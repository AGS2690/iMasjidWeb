import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { UserResponse, RoleResponse } from '../../types';
import { usersApi } from '../../api/usersApi';
import { useToast } from '../../hooks/useToast';
import { extractErrorMessage } from '../../api/client';

interface UserModalProps {
  isOpen: boolean;
  user?: UserResponse | null;
  roles: RoleResponse[];
  onClose: () => void;
  onSuccess: () => void;
}

export const UserModal: React.FC<UserModalProps> = ({ isOpen, user, roles, onClose, onSuccess }) => {
  const isEdit = !!user;
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [userName, setUserName] = useState(user?.userName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [password, setPassword] = useState('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEdit && user) {
        await usersApi.updateUser(user.id, { firstName, lastName, phoneNumber });
        success('User updated successfully.');
      } else {
        await usersApi.createUser({
          firstName,
          lastName,
          userName,
          email,
          phoneNumber,
          password,
          roleIds: selectedRoleIds,
        });
        success('User created successfully.');
      }
      onSuccess();
    } catch (err) {
      error(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit User Profile' : 'Create New User Account'}
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>

        {!isEdit && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input label="Username" value={userName} onChange={(e) => setUserName(e.target.value)} required />
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Input
              label="Initial Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
            />
          </>
        )}

        <Input label="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+1234567890" />

        {!isEdit && roles.length > 0 && (
          <div style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
            <label className="input-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Initial Roles</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {roles.map((r) => {
                const isSelected = selectedRoleIds.includes(r.id);
                return (
                  <button
                    key={r.id}
                    type="button"
                    className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => toggleRole(r.id)}
                  >
                    {r.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            {isEdit ? 'Save Changes' : 'Create User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
