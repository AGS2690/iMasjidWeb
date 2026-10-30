import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Switch } from '../../components/common/Switch';
import { SettingResponse } from '../../types';
import { settingsApi } from '../../api/settingsApi';
import { useToast } from '../../hooks/useToast';
import { extractErrorMessage } from '../../api/client';

interface SettingModalProps {
  isOpen: boolean;
  setting?: SettingResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const SettingModal: React.FC<SettingModalProps> = ({ isOpen, setting, onClose, onSuccess }) => {
  const isEdit = !!setting;
  const [key, setKey] = useState(setting?.key || '');
  const [value, setValue] = useState(setting?.value || '');
  const [description, setDescription] = useState(setting?.description || '');
  const [module, setModule] = useState(setting?.module || 'General');
  const [isEncrypted, setIsEncrypted] = useState(setting?.isEncrypted || false);
  const [isLoading, setIsLoading] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isEdit && setting) {
        await settingsApi.updateSetting(setting.key, { value, description, module, isEncrypted });
        success('Setting updated.');
      } else {
        await settingsApi.createSetting({ key, value, description, module, isEncrypted });
        success('Setting created.');
      }
      onSuccess();
    } catch (err) {
      error(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? `Edit Setting: ${setting?.key}` : 'Create New Setting'} size="md">
      <form onSubmit={handleSubmit}>
        {!isEdit && (
          <Input label="Key Name" value={key} onChange={(e) => setKey(e.target.value)} placeholder="e.g. Security.MaxLoginAttempts" required />
        )}
        <Input label="Setting Value" value={value} onChange={(e) => setValue(e.target.value)} required />
        <Input label="Module" value={module} onChange={(e) => setModule(e.target.value)} placeholder="e.g. Security, General, Auditing" />
        <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <div style={{ marginBottom: '1.5rem' }}>
          <Switch checked={isEncrypted} onChange={setIsEncrypted} label="Encrypt Value in Storage" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>Save Setting</Button>
        </div>
      </form>
    </Modal>
  );
};
