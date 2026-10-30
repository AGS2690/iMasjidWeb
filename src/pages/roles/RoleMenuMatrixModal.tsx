import React, { useEffect, useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { RoleResponse, RoleMenuDetailsResponse } from '../../types';
import { rolesApi } from '../../api/rolesApi';
import { useToast } from '../../hooks/useToast';
import { extractErrorMessage } from '../../api/client';
import { Layers, ShieldCheck } from 'lucide-react';

interface RoleMenuMatrixModalProps {
  role: RoleResponse;
  onClose: () => void;
  onSuccess: () => void;
}

interface FlattenedRoleMenu {
  menuId: string;
  title: string;
  route?: string;
  parentId?: string;
  isAssigned: boolean;
  actions: { actionId: string; actionName: string; actionCode: string; isGranted: boolean }[];
  depth: number;
}

const flattenRoleMenus = (items: RoleMenuDetailsResponse[], depth = 0): FlattenedRoleMenu[] => {
  let result: FlattenedRoleMenu[] = [];
  for (const item of items) {
    const actions = (item.actions || []).map((a) => ({
      actionId: a.actionId,
      actionName: a.actionName,
      actionCode: a.actionCode,
      isGranted: a.isGranted,
    }));

    result.push({
      menuId: item.menuId,
      title: item.title || item.menuTitle || 'Unnamed Menu',
      route: item.route || item.menuRoute,
      parentId: item.parentId,
      isAssigned: item.isAssigned,
      actions,
      depth,
    });

    if (item.children && item.children.length > 0) {
      result = result.concat(flattenRoleMenus(item.children, depth + 1));
    }
  }
  return result;
};

export const RoleMenuMatrixModal: React.FC<RoleMenuMatrixModalProps> = ({ role, onClose, onSuccess }) => {
  const [flatMenus, setFlatMenus] = useState<FlattenedRoleMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    rolesApi
      .getRoleMenus(role.id)
      .then((res) => {
        const isOk = res.success ?? res.isSuccess;
        if (isOk && res.data) {
          setFlatMenus(flattenRoleMenus(res.data));
        }
      })
      .catch((err) => {
        error(extractErrorMessage(err), 'Failed to load role menus');
      })
      .finally(() => setLoading(false));
  }, [role.id, error]);

  const toggleMenuAssigned = (menuId: string) => {
    setFlatMenus((prev) =>
      prev.map((m) => {
        if (m.menuId === menuId) {
          const nextAssigned = !m.isAssigned;
          return {
            ...m,
            isAssigned: nextAssigned,
            actions: m.actions.map((a) => ({ ...a, isGranted: nextAssigned ? a.isGranted : false })),
          };
        }
        return m;
      })
    );
  };

  const toggleAction = (menuId: string, actionId: string) => {
    setFlatMenus((prev) =>
      prev.map((m) => {
        if (m.menuId === menuId) {
          const updatedActions = m.actions.map((a) =>
            a.actionId === actionId ? { ...a, isGranted: !a.isGranted } : a
          );
          const hasAnyGranted = updatedActions.some((a) => a.isGranted);
          return {
            ...m,
            isAssigned: hasAnyGranted ? true : m.isAssigned,
            actions: updatedActions,
          };
        }
        return m;
      })
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = flatMenus
        .filter((m) => m.isAssigned)
        .map((m) => ({
          menuId: m.menuId,
          actionIds: m.actions.filter((a) => a.isGranted).map((a) => a.actionId),
        }));

      await rolesApi.assignRoleMenus(role.id, payload);
      success(`Menu & Action permissions assigned for role '${role.name}'.`);
      onSuccess();
    } catch (err) {
      error(extractErrorMessage(err), 'Failed to save role menus');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Menu & Action Assignment Matrix: ${role.name}`} size="lg">
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2.5rem' }}>
          <span className="spinner-icon" style={{ width: '28px', height: '28px', borderTopColor: 'var(--primary-500)' }}></span>
        </div>
      ) : (
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Check the menus accessible to this role, and select specific allowed business actions (Create, Edit, Delete, Export, etc.):
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '58vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {flatMenus.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No menus available to configure.
              </div>
            ) : (
              flatMenus.map((m) => (
                <div
                  key={m.menuId}
                  className="glass-panel"
                  style={{
                    padding: '1rem',
                    marginLeft: `${m.depth * 1.5}rem`,
                    borderColor: m.isAssigned ? 'var(--primary-500)' : 'var(--border-color)',
                    background: m.isAssigned ? 'rgba(0, 110, 140, 0.06)' : 'var(--bg-card)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: m.actions.length > 0 ? '0.75rem' : 0 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={m.isAssigned}
                        onChange={() => toggleMenuAssigned(m.menuId)}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Layers size={16} color={m.isAssigned ? 'var(--primary-400)' : 'var(--text-muted)'} />
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: m.isAssigned ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                          {m.title}
                        </span>
                      </div>
                      {m.route && (
                        <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.route}</code>
                      )}
                    </label>
                    <Badge variant={m.isAssigned ? 'primary' : 'neutral'}>
                      {m.isAssigned ? 'Granted' : 'Restricted'}
                    </Badge>
                  </div>

                  {m.actions.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', paddingLeft: '1.85rem' }}>
                      {m.actions.map((a) => (
                        <label
                          key={a.actionId}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.3rem 0.6rem',
                            borderRadius: 'var(--radius-sm)',
                            background: a.isGranted ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-input)',
                            border: a.isGranted ? '1px solid var(--success)' : '1px solid var(--border-color)',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color: a.isGranted ? 'var(--success)' : 'var(--text-secondary)',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={a.isGranted}
                            onChange={() => toggleAction(m.menuId, a.actionId)}
                          />
                          <span>{a.actionCode || a.actionName}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button variant="primary" icon={<ShieldCheck size={16} />} onClick={handleSave} isLoading={saving}>
              Save Menu & Action Matrix
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
