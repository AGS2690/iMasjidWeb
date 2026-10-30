import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { DataTable, ColumnDef } from '../../components/common/DataTable';
import { ActionGuard } from '../../components/common/ActionGuard';
import { RoleResponse } from '../../types';
import { rolesApi } from '../../api/rolesApi';
import { useToast } from '../../context/ToastContext';
import { extractErrorMessage } from '../../api/client';
import { useModalState } from '../../hooks/useModalState';
import { Plus, Edit2, Trash2, KeyRound, LayoutGrid, LayoutList, Shield } from 'lucide-react';
import { RoleModal } from './RoleModal';
import { PermissionMatrixModal } from './PermissionMatrixModal';
import { RoleMenuMatrixModal } from './RoleMenuMatrixModal';
import { useLocale } from '../../context/LocaleContext';

export const RolesPage: React.FC = () => {
  const { t } = useLocale();
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  const modal = useModalState<RoleResponse>();
  const [selectedForPerms, setSelectedForPerms] = useState<RoleResponse | null>(null);
  const [selectedForMenus, setSelectedForMenus] = useState<RoleResponse | null>(null);

  const { success, error } = useToast();

  const loadRoles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await rolesApi.getRoles();
      const isOk = res.success ?? res.isSuccess;
      if (isOk && res.data) {
        setRoles(res.data);
      }
    } catch (err) {
      error(extractErrorMessage(err), 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const handleDelete = async () => {
    if (!modal.selectedForDelete) return;
    modal.setIsDeleting(true);
    try {
      await rolesApi.deleteRole(modal.selectedForDelete.id);
      success(`Role '${modal.selectedForDelete.name}' deleted successfully.`);
      modal.closeDelete();
      loadRoles();
    } catch (err) {
      error(extractErrorMessage(err), 'Delete failed');
    } finally {
      modal.setIsDeleting(false);
    }
  };

  const filteredRoles = roles.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      r.name.toLowerCase().includes(term) ||
      (r.description && r.description.toLowerCase().includes(term))
    );
  });

  const columns: ColumnDef<RoleResponse>[] = [
    {
      key: 'name',
      header: t('Roles.colRoleName', 'Role Name'),
      render: (r) => {
        const isSuperAdmin = r.name.toUpperCase() === 'SUPERADMIN';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={16} color={isSuperAdmin ? 'var(--danger)' : 'var(--primary-400)'} />
            <strong>{r.name}</strong>
            {isSuperAdmin && <Badge variant="danger" size="sm">System Master</Badge>}
          </div>
        );
      },
      exportValue: (r) => r.name,
    },
    {
      key: 'description',
      header: t('Roles.colDescription', 'Description'),
      render: (r) => <span style={{ color: 'var(--text-secondary)' }}>{r.description || '-'}</span>,
    },
    {
      key: 'permissions',
      header: t('Roles.colPermissions', 'Permissions'),
      render: (r) => (
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          <Badge variant="neutral" size="sm">
            {r.permissions?.length || 0} permissions
          </Badge>
        </div>
      ),
      exportValue: (r) => r.permissions?.length || 0,
    },
    {
      key: 'actions',
      header: t('Roles.colActions', 'Actions'),
      align: 'right',
      render: (r) => {
        const isSuperAdmin = r.name.toUpperCase() === 'SUPERADMIN';
        return (
          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
            <Button
              variant="outline"
              size="sm"
              icon={<KeyRound size={13} />}
              title={t('Roles.permissionMatrix', 'Permission Matrix')}
              onClick={() => setSelectedForPerms(r)}
            >
              Perms
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<LayoutGrid size={13} />}
              title={t('Roles.configureMenus', 'Configure Menus')}
              onClick={() => setSelectedForMenus(r)}
            >
              Menus
            </Button>
            <ActionGuard action="EDIT">
              <Button
                variant="ghost"
                size="sm"
                title={t('Roles.editRole', 'Edit Role')}
                onClick={() => modal.openEdit(r)}
              >
                <Edit2 size={15} />
              </Button>
            </ActionGuard>
            {!isSuperAdmin && (
              <ActionGuard action="DELETE">
                <Button
                  variant="ghost"
                  size="sm"
                  title={t('Roles.deleteRole', 'Delete Role')}
                  style={{ color: 'var(--danger)' }}
                  onClick={() => modal.openDelete(r)}
                >
                  <Trash2 size={15} />
                </Button>
              </ActionGuard>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('Roles.title', 'Role & Access Control')}
        subtitle={t('Roles.subtitle', 'Configure enterprise authorization roles, assign granular permissions, and manage menu visibility.')}
        actions={
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {/* View Mode Toggle */}
            <div style={{ display: 'flex', background: 'var(--bg-input)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                style={{
                  background: viewMode === 'grid' ? 'var(--bg-surface)' : 'transparent',
                  border: 'none',
                  color: viewMode === 'grid' ? 'var(--primary-400)' : 'var(--text-muted)',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Grid View"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                style={{
                  background: viewMode === 'table' ? 'var(--bg-surface)' : 'transparent',
                  border: 'none',
                  color: viewMode === 'table' ? 'var(--primary-400)' : 'var(--text-muted)',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Table View"
              >
                <LayoutList size={16} />
              </button>
            </div>

            <ActionGuard action="CREATE">
              <Button variant="primary" icon={<Plus size={16} />} onClick={modal.openCreate}>
                {t('Roles.createRole', 'Add Role')}
              </Button>
            </ActionGuard>
          </div>
        }
      />

      {viewMode === 'table' ? (
        <DataTable<RoleResponse>
          columns={columns}
          data={filteredRoles}
          isLoading={loading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder={t('Roles.searchPlaceholder', 'Search roles...')}
          exportFilename="roles_matrix"
          emptyTitle={t('Roles.noRolesFound', 'No Roles Found')}
          emptyMessage={t('Roles.noRolesMatching', 'No roles match your search query.')}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
              <span className="spinner-icon" style={{ width: '32px', height: '32px', borderTopColor: 'var(--primary-500)' }}></span>
            </div>
          ) : filteredRoles.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No roles found.
            </div>
          ) : (
            filteredRoles.map((role) => {
              const isSuperAdmin = role.name.toUpperCase() === 'SUPERADMIN';
              return (
                <div key={role.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{role.name}</h3>
                        {isSuperAdmin && <Badge variant="danger" size="sm">System Master</Badge>}
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.35rem', margin: '0.35rem 0 0 0' }}>
                        {role.description || 'No description provided.'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <ActionGuard action="EDIT">
                        <Button variant="ghost" size="sm" title="Edit Role" onClick={() => modal.openEdit(role)}>
                          <Edit2 size={15} />
                        </Button>
                      </ActionGuard>
                      {!isSuperAdmin && (
                        <ActionGuard action="DELETE">
                          <Button variant="ghost" size="sm" title="Delete Role" style={{ color: 'var(--danger)' }} onClick={() => modal.openDelete(role)}>
                            <Trash2 size={15} />
                          </Button>
                        </ActionGuard>
                      )}
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.25rem', flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                      Permissions ({role.permissions?.length || 0})
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', maxHeight: '90px', overflowY: 'auto' }}>
                      {role.permissions?.slice(0, 8).map((p) => (
                        <Badge key={p} variant="neutral" size="sm">{p}</Badge>
                      ))}
                      {(role.permissions?.length || 0) > 8 && (
                        <Badge variant="primary" size="sm">+{role.permissions.length - 8} more</Badge>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <Button variant="outline" size="sm" icon={<KeyRound size={14} />} onClick={() => setSelectedForPerms(role)}>
                      Permissions
                    </Button>
                    <Button variant="secondary" size="sm" icon={<LayoutGrid size={14} />} onClick={() => setSelectedForMenus(role)}>
                      Menu Actions
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {modal.isCreateOpen && (
        <RoleModal
          isOpen={modal.isCreateOpen}
          onClose={modal.closeCreate}
          onSuccess={() => {
            modal.closeCreate();
            loadRoles();
          }}
        />
      )}

      {modal.selectedForEdit && (
        <RoleModal
          isOpen={!!modal.selectedForEdit}
          role={modal.selectedForEdit}
          onClose={modal.closeEdit}
          onSuccess={() => {
            modal.closeEdit();
            loadRoles();
          }}
        />
      )}

      {selectedForPerms && (
        <PermissionMatrixModal
          role={selectedForPerms}
          onClose={() => setSelectedForPerms(null)}
          onSuccess={() => {
            setSelectedForPerms(null);
            loadRoles();
          }}
        />
      )}

      {selectedForMenus && (
        <RoleMenuMatrixModal
          role={selectedForMenus}
          onClose={() => setSelectedForMenus(null)}
          onSuccess={() => {
            setSelectedForMenus(null);
            loadRoles();
          }}
        />
      )}

      <ConfirmModal
        isOpen={!!modal.selectedForDelete}
        title="Delete Role"
        message={`Are you sure you want to delete role '${modal.selectedForDelete?.name}'? Users in this role will lose their permissions.`}
        onConfirm={handleDelete}
        onClose={modal.closeDelete}
        isLoading={modal.isDeleting}
      />
    </div>
  );
};
