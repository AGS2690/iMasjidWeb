import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { RoleResponse } from '../../types';
import { rolesApi } from '../../api/rolesApi';
import { useToast } from '../../context/ToastContext';
import { extractErrorMessage } from '../../api/client';

interface RoleModalProps {
  isOpen: boolean;
  role?: RoleResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const RoleModal: React.FC<RoleModalProps> = ({ isOpen, role, onClose, onSuccess }) => {
  const isEdit = !!role;
  const [name, setName] = useState(role?.name || '');
  const [description, setDescription] = useState(role?.description || '');
  const [isLoading, setIsLoading] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isEdit && role) {
        await rolesApi.updateRole(role.id, { name, description, isActive: true });
        success('Role updated successfully.');
      } else {
        await rolesApi.createRole({ name, description });
        success('Role created successfully.');
      }
      onSuccess();
    } catch (err) {
      error(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Role' : 'Create New Role'} size="sm">
      <form onSubmit={handleSubmit}>
        <Input label="Role Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. FinanceManager" required />
        <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of duties..." />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            {isEdit ? 'Save Role' : 'Create Role'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
