import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { MenuResponse, BusinessActionResponse } from '../../types';
import { menusApi } from '../../api/menusApi';
import { useToast } from '../../hooks/useToast';
import { extractErrorMessage } from '../../api/client';

interface AssignActionsModalProps {
  menu: MenuResponse;
  actions: BusinessActionResponse[];
  onClose: () => void;
  onSuccess: () => void;
}

export const AssignActionsModal: React.FC<AssignActionsModalProps> = ({ menu, actions, onClose, onSuccess }) => {
  const [selectedActionIds, setSelectedActionIds] = useState<string[]>(() => {
    if (!menu.actions || !Array.isArray(menu.actions)) return [];
    const attachedIdentifiers = new Set(
      menu.actions.map((a: any) => (typeof a === 'string' ? a : a.id || a.code))
    );
    return actions
      .filter((a) => attachedIdentifiers.has(a.id) || attachedIdentifiers.has(a.code))
      .map((a) => a.id);
  });

  const [saving, setSaving] = useState(false);
  const { success, error } = useToast();

  const toggleAction = (id: string) => {
    setSelectedActionIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await menusApi.assignActions(menu.id, selectedActionIds);
      success(`Business actions attached to '${menu.title}'.`);
      onSuccess();
    } catch (err) {
      error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Attach Actions: ${menu.title}`} size="sm">
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
        Select which business actions are supported on this menu screen:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
        {actions.length === 0 ? (
          <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No business actions registered. Create actions in the Action Master first.
          </div>
        ) : (
          actions.map((a) => {
            const isSelected = selectedActionIds.includes(a.id);
            return (
              <label
                key={a.id}
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
                  <span style={{ fontWeight: 700, fontSize: '0.925rem' }}>{a.name}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>({a.code})</span>
                </div>
                <input type="checkbox" checked={isSelected} onChange={() => toggleAction(a.id)} />
              </label>
            );
          })
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
        <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="primary" onClick={handleSave} isLoading={saving}>Save Actions</Button>
      </div>
    </Modal>
  );
};
