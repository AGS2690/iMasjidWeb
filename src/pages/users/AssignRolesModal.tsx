import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { UserResponse, RoleResponse } from '../../types';
import { usersApi } from '../../api/usersApi';
import { useToast } from '../../context/ToastContext';
import { extractErrorMessage } from '../../api/client';

interface AssignRolesModalProps {
  isOpen: boolean;
  user: UserResponse;
  roles: RoleResponse[];
  onClose: () => void;
  onSuccess: () => void;
}

export const AssignRolesModal: React.FC<AssignRolesModalProps> = ({
  isOpen,
  user,
  roles,
  onClose,
  onSuccess,
}) => {
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(() => {
    return roles.filter((r) => user.roles?.includes(r.name)).map((r) => r.id);
  });
  const [isLoading, setIsLoading] = useState(false);
  const { success, error } = useToast();

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await usersApi.assignRoles(user.id, selectedRoleIds);
      success(`Roles updated for ${user.userName}.`);
      onSuccess();
    } catch (err) {
      error(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign Roles: ${user.fullName || user.userName}`}
      size="sm"
    >
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
        Select the administrative roles to grant to this user account:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
        {roles.map((r) => {
          const isSelected = selectedRoleIds.includes(r.id);
          return (
            <div
              key={r.id}
              onClick={() => toggleRole(r.id)}
              className="glass-panel"
              style={{
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                borderColor: isSelected ? 'var(--primary-500)' : 'var(--border-color)',
                background: isSelected ? 'rgba(0, 110, 140, 0.1)' : 'var(--bg-surface)',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.925rem' }}>{r.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.description || 'System Role'}</div>
              </div>
              <input type="checkbox" checked={isSelected} readOnly />
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
        <Button variant="ghost" onClick={onClose} disabled={isLoading}>Cancel</Button>
        <Button variant="primary" onClick={handleSave} isLoading={isLoading}>Apply Roles</Button>
      </div>
    </Modal>
  );
};
