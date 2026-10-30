import React, { useEffect, useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { RoleResponse, PermissionDto } from '../../types';
import { rolesApi } from '../../api/rolesApi';
import { useToast } from '../../hooks/useToast';
import { extractErrorMessage } from '../../api/client';

interface PermissionMatrixModalProps {
  role: RoleResponse;
  onClose: () => void;
  onSuccess: () => void;
}

export const PermissionMatrixModal: React.FC<PermissionMatrixModalProps> = ({ role, onClose, onSuccess }) => {
  const [allPermissions, setAllPermissions] = useState<PermissionDto[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>(role.permissions || []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    rolesApi
      .getAllPermissions()
      .then((res) => {
        if (res.isSuccess && res.data) setAllPermissions(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const togglePermission = (code: string) => {
    setSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const toggleModuleAll = (modulePerms: PermissionDto[]) => {
    const codes = modulePerms.map((p) => p.code);
    const allSelected = codes.every((c) => selectedCodes.includes(c));
    if (allSelected) {
      setSelectedCodes((prev) => prev.filter((c) => !codes.includes(c)));
    } else {
      setSelectedCodes((prev) => Array.from(new Set([...prev, ...codes])));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await rolesApi.updatePermissions(role.id, selectedCodes);
      success(`Permissions saved for role '${role.name}'.`);
      onSuccess();
    } catch (err) {
      error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // Group permissions by module
  const modules = Array.from(new Set(allPermissions.map((p) => p.module)));

  return (
    <Modal isOpen={true} onClose={onClose} title={`Permission Matrix: ${role.name}`} size="lg">
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <span className="spinner-icon" style={{ width: '28px', height: '28px', borderTopColor: 'var(--primary-500)' }}></span>
        </div>
      ) : (
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Check the explicit permissions granted to this role across system modules:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {modules.map((mod) => {
              const modPerms = allPermissions.filter((p) => p.module === mod);
              const allSelected = modPerms.every((p) => selectedCodes.includes(p.code));

              return (
                <div key={mod} className="glass-panel" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ fontSize: '1rem', color: 'var(--primary-400)' }}>{mod} Module</h4>
                    <button
                      type="button"
                      className="btn btn-sm btn-ghost"
                      onClick={() => toggleModuleAll(modPerms)}
                      style={{ fontSize: '0.75rem' }}
                    >
                      {allSelected ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem' }}>
                    {modPerms.map((p) => {
                      const isChecked = selectedCodes.includes(p.code);
                      return (
                        <label
                          key={p.code}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.45rem 0.65rem',
                            borderRadius: 'var(--radius-sm)',
                            background: isChecked ? 'rgba(0, 110, 140, 0.1)' : 'var(--bg-input)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                          }}
                        >
                          <input type="checkbox" checked={isChecked} onChange={() => togglePermission(p.code)} />
                          <span>{p.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} isLoading={saving}>Save Permissions</Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
