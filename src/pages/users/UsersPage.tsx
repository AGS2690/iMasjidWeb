import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Switch } from '../../components/common/Switch';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { DataTable, ColumnDef } from '../../components/common/DataTable';
import { ActionGuard } from '../../components/common/ActionGuard';
import { UserResponse, RoleResponse } from '../../types';
import { usersApi } from '../../api/usersApi';
import { rolesApi } from '../../api/rolesApi';
import { useToast } from '../../context/ToastContext';
import { extractErrorMessage } from '../../api/client';
import { useModalState } from '../../hooks/useModalState';
import { UserPlus, Shield, Eye, Edit2, Trash2 } from 'lucide-react';
import { UserModal } from './UserModal';
import { AssignRolesModal } from './AssignRolesModal';
import { UserDetailsModal } from './UserDetailsModal';
import { useLocale } from '../../context/LocaleContext';

export const UsersPage: React.FC = () => {
  const { t } = useLocale();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const modal = useModalState<UserResponse>();
  const { success, error } = useToast();

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await usersApi.getUsers({
        pageNumber,
        pageSize,
        searchTerm: searchTerm.trim() || undefined,
      });
      const isOk = res.success ?? res.isSuccess;
      if (isOk && res.data) {
        setUsers(res.data.items || []);
        setTotalCount(res.data.totalCount || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      error(extractErrorMessage(err), 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [pageNumber, pageSize, searchTerm, error]);

  const loadRoles = async () => {
    try {
      const res = await rolesApi.getRoles();
      const isOk = res.success ?? res.isSuccess;
      if (isOk && res.data) {
        setRoles(res.data);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadRoles();
  }, []);

  const handleToggleStatus = async (user: UserResponse) => {
    try {
      await usersApi.toggleStatus(user.id);
      success(`User '${user.userName}' status updated.`);
      loadUsers();
    } catch (err) {
      error(extractErrorMessage(err));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!modal.selectedForDelete) return;
    modal.setIsDeleting(true);
    try {
      await usersApi.deleteUser(modal.selectedForDelete.id);
      success(`User '${modal.selectedForDelete.userName}' deleted successfully.`);
      modal.closeDelete();
      loadUsers();
    } catch (err) {
      error(extractErrorMessage(err), 'Delete failed');
    } finally {
      modal.setIsDeleting(false);
    }
  };

  const columns: ColumnDef<UserResponse>[] = [
    {
      key: 'user',
      header: t('Users.colName', 'Full Name'),
      render: (u) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
            {u.firstName?.[0]}{u.lastName?.[0]}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{u.fullName || `${u.firstName} ${u.lastName}`}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
          </div>
        </div>
      ),
      exportValue: (u) => u.fullName || `${u.firstName} ${u.lastName}`,
    },
    {
      key: 'userName',
      header: t('Users.colUsername', 'Username'),
      render: (u) => <code>@{u.userName}</code>,
    },
    {
      key: 'roles',
      header: t('Users.colRoles', 'Assigned Roles'),
      render: (u) => (
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {u.roles && u.roles.length > 0 ? (
            u.roles.map((r) => (
              <Badge key={r} variant={r.toUpperCase() === 'SUPERADMIN' ? 'danger' : 'primary'}>
                {r}
              </Badge>
            ))
          ) : (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No role</span>
          )}
        </div>
      ),
      exportValue: (u) => u.roles?.join(', ') || '',
    },
    {
      key: 'isActive',
      header: t('Users.colStatus', 'Status'),
      align: 'center',
      render: (u) => <Switch checked={u.isActive} onChange={() => handleToggleStatus(u)} />,
      exportValue: (u) => (u.isActive ? t('Common.active', 'Active') : t('Common.inactive', 'Inactive')),
    },
    {
      key: 'lastLoginDate',
      header: t('Users.colLastLogin', 'Last Login'),
      render: (u) => (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {u.lastLoginDate ? new Date(u.lastLoginDate).toLocaleDateString() : t('Common.never', 'Never')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('Users.colActions', 'Actions'),
      align: 'right',
      render: (u) => (
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
          <Button
            variant="ghost"
            size="sm"
            title={t('Users.viewDetails', 'View Details')}
            onClick={() => modal.openView(u)}
          >
            <Eye size={15} />
          </Button>

          <ActionGuard action="MANAGE_ROLES">
            <Button
              variant="ghost"
              size="sm"
              title={t('Users.assignRoles', 'Assign Roles')}
              onClick={() => modal.openAction(u)}
            >
              <Shield size={15} />
            </Button>
          </ActionGuard>

          <ActionGuard action="EDIT">
            <Button
              variant="ghost"
              size="sm"
              title={t('Users.editUser', 'Edit Profile')}
              onClick={() => modal.openEdit(u)}
            >
              <Edit2 size={15} />
            </Button>
          </ActionGuard>

          <ActionGuard action="DELETE">
            <Button
              variant="ghost"
              size="sm"
              title={t('Users.deleteUser', 'Delete User')}
              style={{ color: 'var(--danger)' }}
              onClick={() => modal.openDelete(u)}
            >
              <Trash2 size={15} />
            </Button>
          </ActionGuard>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('Users.title', 'User Management')}
        subtitle={t('Users.subtitle', 'Manage registered accounts, assign administrative roles, and inspect login security.')}
        actions={
          <ActionGuard action="CREATE">
            <Button variant="primary" icon={<UserPlus size={16} />} onClick={modal.openCreate}>
              {t('Users.createUser', 'Add New User')}
            </Button>
          </ActionGuard>
        }
      />

      <DataTable<UserResponse>
        columns={columns}
        data={users}
        isLoading={isLoading}
        searchTerm={searchTerm}
        onSearchChange={(term) => {
          setSearchTerm(term);
          setPageNumber(1);
        }}
        searchPlaceholder={t('Users.searchPlaceholder', 'Search by name, username, or email...')}
        exportFilename="users_directory"
        pagination={{
          pageNumber,
          pageSize,
          totalCount,
          totalPages,
          onPageChange: setPageNumber,
        }}
        emptyTitle={t('Users.noUsersFound', 'No Users Found')}
        emptyMessage={t('Users.noUsersMatching', 'No registered users match your current search parameters.')}
      />

      {/* Dynamic Modals */}
      {modal.isCreateOpen && (
        <UserModal
          isOpen={modal.isCreateOpen}
          onClose={modal.closeCreate}
          onSuccess={() => {
            modal.closeCreate();
            loadUsers();
          }}
          roles={roles}
        />
      )}

      {modal.selectedForEdit && (
        <UserModal
          isOpen={!!modal.selectedForEdit}
          user={modal.selectedForEdit}
          onClose={modal.closeEdit}
          onSuccess={() => {
            modal.closeEdit();
            loadUsers();
          }}
          roles={roles}
        />
      )}

      {modal.selectedForAction && (
        <AssignRolesModal
          isOpen={!!modal.selectedForAction}
          user={modal.selectedForAction}
          roles={roles}
          onClose={modal.closeAction}
          onSuccess={() => {
            modal.closeAction();
            loadUsers();
          }}
        />
      )}

      {modal.selectedForView && (
        <UserDetailsModal
          userId={modal.selectedForView.id}
          onClose={modal.closeView}
        />
      )}

      <ConfirmModal
        isOpen={!!modal.selectedForDelete}
        title="Delete User Account"
        message={`Are you sure you want to delete user '${modal.selectedForDelete?.userName}'? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onClose={modal.closeDelete}
        isLoading={modal.isDeleting}
      />
    </div>
  );
};
