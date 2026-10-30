import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { DataTable, ColumnDef } from '../../components/common/DataTable';
import { ActionGuard } from '../../components/common/ActionGuard';
import { SettingResponse } from '../../types';
import { settingsApi } from '../../api/settingsApi';
import { useToast } from '../../context/ToastContext';
import { extractErrorMessage } from '../../api/client';
import { useModalState } from '../../hooks/useModalState';
import { Plus, Edit2, Sliders, Lock } from 'lucide-react';
import { SettingModal } from './SettingModal';
import { useLocale } from '../../context/LocaleContext';

export const SettingsPage: React.FC = () => {
  const { t } = useLocale();
  const [settings, setSettings] = useState<SettingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const modal = useModalState<SettingResponse>();
  const { error } = useToast();

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await settingsApi.getSettings();
      const isOk = res.success ?? res.isSuccess;
      if (isOk && res.data) {
        setSettings(res.data);
      }
    } catch (err) {
      error(extractErrorMessage(err), 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const filteredSettings = settings.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.key.toLowerCase().includes(term) ||
      s.module.toLowerCase().includes(term) ||
      (s.description && s.description.toLowerCase().includes(term)) ||
      (!s.isEncrypted && s.value.toLowerCase().includes(term))
    );
  });

  const columns: ColumnDef<SettingResponse>[] = [
    {
      key: 'key',
      header: t('Settings.colKey', 'Setting Key'),
      render: (s) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Sliders size={15} color="var(--primary-400)" />
          <code>{s.key}</code>
        </div>
      ),
      exportValue: (s) => s.key,
    },
    {
      key: 'value',
      header: t('Settings.colValue', 'Value'),
      render: (s) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {s.isEncrypted && <Lock size={13} color="var(--warning)" />}
          <strong>{s.isEncrypted ? '********' : s.value}</strong>
        </div>
      ),
      exportValue: (s) => (s.isEncrypted ? '[ENCRYPTED]' : s.value),
    },
    {
      key: 'module',
      header: t('Settings.colModule', 'Module'),
      render: (s) => <Badge variant="neutral">{s.module}</Badge>,
    },
    {
      key: 'isEncrypted',
      header: t('Settings.colStatus', 'Encryption'),
      align: 'center',
      render: (s) =>
        s.isEncrypted ? (
          <Badge variant="warning">Encrypted</Badge>
        ) : (
          <Badge variant="neutral">Plain</Badge>
        ),
      exportValue: (s) => (s.isEncrypted ? 'Encrypted' : 'Plain'),
    },
    {
      key: 'description',
      header: t('Settings.colDescription', 'Description'),
      render: (s) => <span style={{ color: 'var(--text-secondary)' }}>{s.description || '-'}</span>,
    },
    {
      key: 'actions',
      header: t('Common.actions', 'Actions'),
      align: 'right',
      render: (s) => (
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
          <ActionGuard action="EDIT">
            <Button
              variant="ghost"
              size="sm"
              title={t('Common.edit', 'Edit')}
              onClick={() => modal.openEdit(s)}
            >
              <Edit2 size={15} />
            </Button>
          </ActionGuard>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('Settings.title', 'System Settings')}
        subtitle={t('Settings.subtitle', 'Configure system policies, authentication rules, and parameters.')}
        actions={
          <ActionGuard action="CREATE">
            <Button variant="primary" icon={<Plus size={16} />} onClick={modal.openCreate}>
              {t('Common.create', 'Add New')}
            </Button>
          </ActionGuard>
        }
      />

      <DataTable<SettingResponse>
        columns={columns}
        data={filteredSettings}
        isLoading={isLoading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={t('Settings.searchPlaceholder', 'Search settings by key, module, or value...')}
        exportFilename="system_settings"
        emptyTitle={t('Settings.noSettingsFound', 'No Settings Found')}
        emptyMessage={t('Settings.noSettingsMatching', 'No system settings match your search query.')}
      />

      {modal.isCreateOpen && (
        <SettingModal
          isOpen={modal.isCreateOpen}
          onClose={modal.closeCreate}
          onSuccess={() => {
            modal.closeCreate();
            loadSettings();
          }}
        />
      )}

      {modal.selectedForEdit && (
        <SettingModal
          isOpen={!!modal.selectedForEdit}
          setting={modal.selectedForEdit}
          onClose={modal.closeEdit}
          onSuccess={() => {
            modal.closeEdit();
            loadSettings();
          }}
        />
      )}
    </div>
  );
};
