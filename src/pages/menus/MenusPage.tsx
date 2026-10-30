import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { DataTable, ColumnDef } from '../../components/common/DataTable';
import { ActionGuard } from '../../components/common/ActionGuard';
import { MenuResponse, BusinessActionResponse } from '../../types';
import { menusApi } from '../../api/menusApi';
import { actionsApi } from '../../api/actionsApi';
import { useToast } from '../../context/ToastContext';
import { extractErrorMessage } from '../../api/client';
import { useModalState } from '../../hooks/useModalState';
import { Plus, Edit2, Trash2, Sliders, Layers } from 'lucide-react';
import { MenuModal } from './MenuModal';
import { AssignActionsModal } from './AssignActionsModal';

import { useLocale } from '../../context/LocaleContext';

export const MenusPage: React.FC = () => {
  const [menus, setMenus] = useState<MenuResponse[]>([]);
  const [actions, setActions] = useState<BusinessActionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { currentLocale, t } = useLocale();
  const modal = useModalState<MenuResponse>();
  const { success, error } = useToast();

  const loadMenus = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, aRes] = await Promise.all([
        menusApi.getAllMenus(),
        actionsApi.getActions(),
      ]);
      const mOk = mRes.success ?? mRes.isSuccess;
      const aOk = aRes.success ?? aRes.isSuccess;
      if (mOk && mRes.data) setMenus(mRes.data);
      if (aOk && aRes.data) setActions(aRes.data);
    } catch (err) {
      error(extractErrorMessage(err), 'Failed to load menus');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    loadMenus();
  }, [loadMenus, currentLocale?.cultureCode]);

  const handleDelete = async () => {
    if (!modal.selectedForDelete) return;
    modal.setIsDeleting(true);
    try {
      await menusApi.deleteMenu(modal.selectedForDelete.id);
      success(`Menu '${modal.selectedForDelete.title}' deleted.`);
      modal.closeDelete();
      loadMenus();
    } catch (err) {
      error(extractErrorMessage(err));
    } finally {
      modal.setIsDeleting(false);
    }
  };

  const filteredMenus = menus.filter((m) => {
    const term = searchTerm.toLowerCase();
    return (
      m.title.toLowerCase().includes(term) ||
      (m.route && m.route.toLowerCase().includes(term)) ||
      (m.icon && m.icon.toLowerCase().includes(term))
    );
  });

  const columns: ColumnDef<MenuResponse>[] = [
    {
      key: 'title',
      header: t('Menus.colTitle', 'Menu Title'),
      render: (m) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: m.parentId ? '1.5rem' : '0' }}>
          {m.parentId ? (
            <span style={{ color: 'var(--text-muted)' }}>+-</span>
          ) : (
            <Layers size={16} color="var(--primary-400)" />
          )}
          <strong>{m.title}</strong>
          {!m.parentId && <Badge variant="neutral" size="sm">Group</Badge>}
        </div>
      ),
      exportValue: (m) => m.title,
    },
    {
      key: 'route',
      header: t('Menus.colRoute', 'Route'),
      render: (m) => <code>{m.route || '-'}</code>,
    },
    {
      key: 'icon',
      header: 'Icon',
      render: (m) => <Badge variant="neutral">{m.icon || 'default'}</Badge>,
    },
    {
      key: 'orderIndex',
      header: t('Menus.colOrder', 'Order'),
      align: 'center',
      render: (m) => <span>{m.orderIndex}</span>,
    },
    {
      key: 'isActive',
      header: t('Menus.colStatus', 'Status'),
      align: 'center',
      render: (m) => (
        <Badge variant={m.isActive ? 'success' : 'neutral'}>
          {m.isActive ? t('Common.active', 'Active') : t('Common.inactive', 'Inactive')}
        </Badge>
      ),
      exportValue: (m) => (m.isActive ? t('Common.active', 'Active') : t('Common.inactive', 'Inactive')),
    },
    {
      key: 'actions',
      header: t('Menus.colActions', 'Attached Actions'),
      render: (m) => (
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          {m.actions && m.actions.length > 0 ? (
            m.actions.map((a: any) => {
              const actionCode = typeof a === 'string' ? a : a.code || a.name || a.id;
              const actionKey = typeof a === 'string' ? a : a.id || a.code;
              return (
                <Badge key={actionKey} variant="info" size="sm">
                  {actionCode}
                </Badge>
              );
            })
          ) : (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None</span>
          )}
        </div>
      ),
      exportValue: (m) =>
        m.actions?.map((a: any) => (typeof a === 'string' ? a : a.code || a.name)).join(', ') || '',
    },
    {
      key: 'tableActions',
      header: t('Common.actions', 'Actions'),
      align: 'right',
      render: (m) => (
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
          <Button
            variant="ghost"
            size="sm"
            title={t('Menus.assignActions', 'Attach Business Actions')}
            onClick={() => modal.openAction(m)}
          >
            <Sliders size={15} />
          </Button>
          <ActionGuard action="EDIT">
            <Button
              variant="ghost"
              size="sm"
              title={t('Menus.editMenu', 'Edit Menu')}
              onClick={() => modal.openEdit(m)}
            >
              <Edit2 size={15} />
            </Button>
          </ActionGuard>
          <ActionGuard action="DELETE">
            <Button
              variant="ghost"
              size="sm"
              title={t('Menus.deleteMenu', 'Delete Menu')}
              style={{ color: 'var(--danger)' }}
              onClick={() => modal.openDelete(m)}
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
        title={t('Menus.title', 'Menu Hierarchy & Action Setup')}
        subtitle={t('Menus.subtitle', 'Manage dynamic application navigation menus and bind available business actions.')}
        actions={
          <ActionGuard action="CREATE">
            <Button variant="primary" icon={<Plus size={16} />} onClick={modal.openCreate}>
              {t('Menus.createMenu', 'Add New Menu')}
            </Button>
          </ActionGuard>
        }
      />

      <DataTable<MenuResponse>
        columns={columns}
        data={filteredMenus}
        isLoading={loading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={t('Menus.searchPlaceholder', 'Search menus by title, route, or icon...')}
        exportFilename="menu_hierarchy"
        emptyTitle={t('Menus.noMenusConfigured', 'No Menus Configured')}
        emptyMessage={t('Menus.noMenusMatching', 'No navigation menus match your current search query.')}
      />

      {modal.isCreateOpen && (
        <MenuModal
          isOpen={modal.isCreateOpen}
          menus={menus}
          onClose={modal.closeCreate}
          onSuccess={() => {
            modal.closeCreate();
            loadMenus();
          }}
        />
      )}

      {modal.selectedForEdit && (
        <MenuModal
          isOpen={!!modal.selectedForEdit}
          menu={modal.selectedForEdit}
          menus={menus}
          onClose={modal.closeEdit}
          onSuccess={() => {
            modal.closeEdit();
            loadMenus();
          }}
        />
      )}

      {modal.selectedForAction && (
        <AssignActionsModal
          menu={modal.selectedForAction}
          actions={actions}
          onClose={modal.closeAction}
          onSuccess={() => {
            modal.closeAction();
            loadMenus();
          }}
        />
      )}

      <ConfirmModal
        isOpen={!!modal.selectedForDelete}
        title="Delete Menu"
        message={`Are you sure you want to delete menu '${modal.selectedForDelete?.title}'?`}
        onConfirm={handleDelete}
        onClose={modal.closeDelete}
        isLoading={modal.isDeleting}
      />
    </div>
  );
};
