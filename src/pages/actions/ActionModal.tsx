import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { BusinessActionResponse } from '../../types';
import { actionsApi } from '../../api/actionsApi';
import { useToast } from '../../context/ToastContext';
import { extractErrorMessage } from '../../api/client';

interface ActionModalProps {
  isOpen: boolean;
  action?: BusinessActionResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ActionModal: React.FC<ActionModalProps> = ({ isOpen, action, onClose, onSuccess }) => {
  const isEdit = !!action;
  const [name, setName] = useState(action?.name || '');
  const [code, setCode] = useState(action?.code || '');
  const [description, setDescription] = useState(action?.description || '');
  const [isLoading, setIsLoading] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isEdit && action) {
        await actionsApi.updateAction(action.id, { name, description, isActive: true });
        success('Action updated.');
      } else {
        await actionsApi.createAction({ name, code: code.toUpperCase().trim(), description, isActive: true });
        success('Action created.');
      }
      onSuccess();
    } catch (err) {
      error(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Business Action' : 'Add Business Action'} size="sm">
      <form onSubmit={handleSubmit}>
        <Input label="Action Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Export Data" required />
        {!isEdit && (
          <Input label="Action Code (Unique)" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. EXPORT" required />
        )}
        <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description of capability..." />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            {isEdit ? 'Save Changes' : 'Create Action'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
