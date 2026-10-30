import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { DataTable, ColumnDef } from '../../components/common/DataTable';
import { ActionGuard } from '../../components/common/ActionGuard';
import { BusinessActionResponse } from '../../types';
import { actionsApi } from '../../api/actionsApi';
import { useToast } from '../../context/ToastContext';
import { extractErrorMessage } from '../../api/client';
import { useModalState } from '../../hooks/useModalState';
import { Plus, Edit2, Trash2, Sliders } from 'lucide-react';
import { ActionModal } from './ActionModal';

import { useLocale } from '../../context/LocaleContext';

export const ActionsPage: React.FC = () => {
  const [actions, setActions] = useState<BusinessActionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { currentLocale, t } = useLocale();
  const modal = useModalState<BusinessActionResponse>();
  const { success, error } = useToast();

  const loadActions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await actionsApi.getActions();
      const isOk = res.success ?? res.isSuccess;
      if (isOk && res.data) {
        setActions(res.data);
      }
    } catch (err) {
      error(extractErrorMessage(err), 'Failed to load business actions');
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    loadActions();
  }, [loadActions, currentLocale?.cultureCode]);

  const handleDelete = async () => {
    if (!modal.selectedForDelete) return;
    modal.setIsDeleting(true);
    try {
      await actionsApi.deleteAction(modal.selectedForDelete.id);
      success(`Action '${modal.selectedForDelete.name}' deleted.`);
      modal.closeDelete();
      loadActions();
    } catch (err) {
      error(extractErrorMessage(err), 'Delete failed');
    } finally {
      modal.setIsDeleting(false);
    }
  };

  const filteredActions = actions.filter((a) => {
    const term = searchTerm.toLowerCase();
    return (
      a.name.toLowerCase().includes(term) ||
      a.code.toLowerCase().includes(term) ||
      (a.description && a.description.toLowerCase().includes(term))
    );
  });

  const columns: ColumnDef<BusinessActionResponse>[] = [
    {
      key: 'name',
      header: t('Actions.colName', 'Action Name'),
      render: (a) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sliders size={16} color="var(--primary-400)" />
          <strong>{a.name}</strong>
        </div>
      ),
      exportValue: (a) => a.name,
    },
    {
      key: 'code',
      header: t('Actions.colCode', 'Action Code'),
      render: (a) => <Badge variant="primary">{a.code}</Badge>,
    },
    {
      key: 'description',
      header: t('Actions.colDescription', 'Description'),
      render: (a) => <span style={{ color: 'var(--text-secondary)' }}>{a.description || '-'}</span>,
    },
    {
      key: 'isActive',
      header: t('Actions.colStatus', 'Status'),
      align: 'center',
      render: (a) => (
        <Badge variant={a.isActive ? 'success' : 'neutral'}>
          {a.isActive ? t('Common.active', 'Active') : t('Common.inactive', 'Inactive')}
        </Badge>
      ),
      exportValue: (a) => (a.isActive ? t('Common.active', 'Active') : t('Common.inactive', 'Inactive')),
    },
    {
      key: 'actions',
      header: t('Common.actions', 'Actions'),
      align: 'right',
      render: (a) => (
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
          <ActionGuard action="EDIT">
            <Button
              variant="ghost"
              size="sm"
              title={t('Actions.editAction', 'Edit Action')}
              onClick={() => modal.openEdit(a)}
            >
              <Edit2 size={15} />
            </Button>
          </ActionGuard>

          <ActionGuard action="DELETE">
            <Button
              variant="ghost"
              size="sm"
              title={t('Actions.deleteAction', 'Delete Action')}
              style={{ color: 'var(--danger)' }}
              onClick={() => modal.openDelete(a)}
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
        title={t('Actions.title', 'Business Actions')}
        subtitle={t('Actions.subtitle', 'Manage available granular actions that can be bound to navigation menus and permission matrices.')}
        actions={
          <ActionGuard action="CREATE">
            <Button variant="primary" icon={<Plus size={16} />} onClick={modal.openCreate}>
              {t('Actions.createAction', 'Add New Action')}
            </Button>
          </ActionGuard>
        }
      />

      <DataTable<BusinessActionResponse>
        columns={columns}
        data={filteredActions}
        isLoading={isLoading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={t('Actions.searchPlaceholder', 'Search actions by name or code...')}
        exportFilename="business_actions"
        emptyTitle={t('Actions.noActionsFound', 'No Actions Found')}
        emptyMessage={t('Actions.noActionsMatching', 'No business actions match your search query.')}
      />

      {modal.isCreateOpen && (
        <ActionModal
          isOpen={modal.isCreateOpen}
          onClose={modal.closeCreate}
          onSuccess={() => {
            modal.closeCreate();
            loadActions();
          }}
        />
      )}

      {modal.selectedForEdit && (
        <ActionModal
          isOpen={!!modal.selectedForEdit}
          action={modal.selectedForEdit}
          onClose={modal.closeEdit}
          onSuccess={() => {
            modal.closeEdit();
            loadActions();
          }}
        />
      )}

      <ConfirmModal
        isOpen={!!modal.selectedForDelete}
        title="Delete Business Action"
        message={`Are you sure you want to delete action code '${modal.selectedForDelete?.code}'?`}
        onConfirm={handleDelete}
        onClose={modal.closeDelete}
        isLoading={modal.isDeleting}
      />
    </div>
  );
};
