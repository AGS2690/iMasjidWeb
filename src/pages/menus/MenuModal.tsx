import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Switch } from '../../components/common/Switch';
import { MenuResponse } from '../../types';
import { menusApi } from '../../api/menusApi';
import { useToast } from '../../hooks/useToast';
import { extractErrorMessage } from '../../api/client';

interface MenuModalProps {
  isOpen: boolean;
  menu?: MenuResponse | null;
  menus: MenuResponse[];
  onClose: () => void;
  onSuccess: () => void;
}

export const MenuModal: React.FC<MenuModalProps> = ({ isOpen, menu, menus, onClose, onSuccess }) => {
  const isEdit = !!menu;
  const [title, setTitle] = useState(menu?.title || '');
  const [route, setRoute] = useState(menu?.route || '');
  const [icon, setIcon] = useState(menu?.icon || 'dashboard');
  const [parentId, setParentId] = useState<string>(menu?.parentId || '');
  const [orderIndex, setOrderIndex] = useState(menu?.orderIndex || 1);
  const [isActive, setIsActive] = useState(menu?.isActive ?? true);
  const [isLoading, setIsLoading] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isEdit && menu) {
        await menusApi.updateMenu(menu.id, {
          title,
          route: route.trim() || undefined,
          icon: icon.trim() || undefined,
          parentId: parentId || undefined,
          orderIndex,
          isActive,
        });
        success('Menu updated successfully.');
      } else {
        await menusApi.createMenu({
          title,
          route: route.trim() || undefined,
          icon: icon.trim() || undefined,
          parentId: parentId || undefined,
          orderIndex,
          isActive,
        });
        success('Menu created successfully.');
      }
      onSuccess();
    } catch (err) {
      error(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const parentOptions = menus.filter((m) => !m.parentId && (!menu || m.id !== menu.id));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Menu' : 'Create New Menu'} size="md">
      <form onSubmit={handleSubmit}>
        <Input label="Menu Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. User Management" required />
        <Input label="Route" value={route} onChange={(e) => setRoute(e.target.value)} placeholder="e.g. /admin/users (leave empty for parent groups)" />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input label="Icon Name" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="e.g. people, settings, shield" />
          <Input label="Display Order" type="number" value={orderIndex} onChange={(e) => setOrderIndex(parseInt(e.target.value) || 0)} required />
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label className="input-label" style={{ marginBottom: '0.4rem', display: 'block' }}>Parent Menu Group</label>
          <select
            className="input-field"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
          >
            <option value="">None (Top-level Root Menu)</option>
            {parentOptions.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <Switch checked={isActive} onChange={setIsActive} label="Menu is Active" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            {isEdit ? 'Save Changes' : 'Create Menu'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
