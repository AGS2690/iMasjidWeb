import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { DataTable, ColumnDef } from '../../components/common/DataTable';
import { AuditLogResponse } from '../../types';
import { auditLogsApi } from '../../api/auditLogsApi';
import { useToast } from '../../hooks/useToast';
import { extractErrorMessage } from '../../api/client';
import { useModalState } from '../../hooks/useModalState';
import { Eye, History } from 'lucide-react';
import { AuditDetailsModal } from './AuditDetailsModal';
import { useLocale } from '../../hooks/useLocale';

export const AuditLogsPage: React.FC = () => {
  const { t } = useLocale();
  const [logs, setLogs] = useState<AuditLogResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(15);
  const [loading, setLoading] = useState(true);

  const modal = useModalState<AuditLogResponse>();
  const { error } = useToast();

  const handlePageChange = (page: number) => {
    setLoading(true);
    setPageNumber(page);
  };

  useEffect(() => {
    let active = true;
    auditLogsApi.getAuditLogs({ pageNumber, pageSize })
      .then((res) => {
        if (!active) return;
        const isOk = res.success ?? res.isSuccess;
        if (isOk && res.data) {
          setLogs(res.data.items || []);
          setTotalCount(res.data.totalCount || 0);
          setTotalPages(res.data.totalPages || 1);
        }
      })
      .catch((err) => {
        if (active) error(extractErrorMessage(err), 'Failed to load audit trail');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [pageNumber, pageSize, error]);

  const columns: ColumnDef<AuditLogResponse>[] = [
    {
      key: 'createdOn',
      header: t('AuditLogs.colTimestamp', 'Timestamp'),
      render: (log) => (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {new Date(log.createdOn).toLocaleString()}
        </span>
      ),
      exportValue: (log) => new Date(log.createdOn).toISOString(),
    },
    {
      key: 'actionName',
      header: t('AuditLogs.colAction', 'Action'),
      render: (log) => (
        <Badge
          variant={
            log.actionName === 'Create'
              ? 'success'
              : log.actionName === 'Delete'
              ? 'danger'
              : 'primary'
          }
        >
          {log.actionName}
        </Badge>
      ),
      exportValue: (log) => log.actionName,
    },
    {
      key: 'entityName',
      header: t('AuditLogs.colEntity', 'Target Entity'),
      render: (log) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <History size={14} color="var(--primary-400)" />
          <strong>{log.entityName}</strong>
        </div>
      ),
      exportValue: (log) => log.entityName,
    },
    {
      key: 'entityId',
      header: t('AuditLogs.colEntityId', 'Entity ID'),
      render: (log) => (
        <code>{log.entityId ? log.entityId.substring(0, 8) + '...' : '-'}</code>
      ),
      exportValue: (log) => log.entityId || '',
    },
    {
      key: 'userId',
      header: t('AuditLogs.colUser', 'Actor / User ID'),
      render: (log) => (
        <span style={{ color: 'var(--text-secondary)' }}>{log.userId || 'System / Anonymous'}</span>
      ),
      exportValue: (log) => log.userId || 'System',
    },
    {
      key: 'ipAddress',
      header: t('AuditLogs.colIp', 'IP Address'),
      render: (log) => <code>{log.ipAddress || '-'}</code>,
      exportValue: (log) => log.ipAddress || '',
    },
    {
      key: 'actions',
      header: t('Common.actions', 'Inspect'),
      align: 'right',
      render: (log) => (
        <Button
          variant="ghost"
          size="sm"
          title={t('Common.viewDetails', 'Inspect Old & New State Diff')}
          onClick={() => modal.openView(log)}
        >
          <Eye size={15} />
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('AuditLogs.title', 'System Audit Trail')}
        subtitle={t('AuditLogs.subtitle', 'Review chronological security records, data modifications, and user access history.')}
      />

      <DataTable<AuditLogResponse>
        columns={columns}
        data={logs}
        isLoading={loading}
        exportFilename="audit_compliance_logs"
        emptyTitle={t('AuditLogs.noLogsFound', 'No Audit Records')}
        emptyMessage={t('AuditLogs.noLogsMatching', 'No audit trail records found for the selected criteria.')}
        pagination={{
          pageNumber,
          pageSize,
          totalCount,
          totalPages,
          onPageChange: handlePageChange,
        }}
      />

      {modal.selectedForView && (
        <AuditDetailsModal
          log={modal.selectedForView}
          onClose={modal.closeView}
        />
      )}
    </div>
  );
};
