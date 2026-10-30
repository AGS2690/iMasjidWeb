import React from 'react';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { JsonDiffViewer } from '../../components/common/JsonDiffViewer';
import { AuditLogResponse } from '../../types';

interface AuditDetailsModalProps {
  log: AuditLogResponse;
  onClose: () => void;
}

export const AuditDetailsModal: React.FC<AuditDetailsModalProps> = ({ log, onClose }) => {
  return (
    <Modal isOpen={true} onClose={onClose} title="Audit Record Inspection" size="lg">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Entity</div>
          <div style={{ fontWeight: 700 }}>{log.entityName}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Action</div>
          <Badge variant={log.actionName === 'Create' ? 'success' : log.actionName === 'Delete' ? 'danger' : 'primary'}>
            {log.actionName}
          </Badge>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>User ID</div>
          <div>{log.userId || 'System'}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Timestamp</div>
          <div>{new Date(log.createdOn).toLocaleString()}</div>
        </div>
      </div>

      <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Payload Changes (JSON Diff)</h4>
      <JsonDiffViewer oldValues={log.oldValues} newValues={log.newValues} />
    </Modal>
  );
};
