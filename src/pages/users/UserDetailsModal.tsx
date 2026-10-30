import React, { useEffect, useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { UserDetailsResponse } from '../../types';
import { usersApi } from '../../api/usersApi';
import { Mail, Phone, Calendar, Shield } from 'lucide-react';

interface UserDetailsModalProps {
  userId: string;
  onClose: () => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ userId, onClose }) => {
  const [details, setDetails] = useState<UserDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi
      .getUserDetails(userId)
      .then((res) => {
        const isOk = res.success ?? res.isSuccess;
        if (isOk && res.data) {
          const raw = res.data as any;
          const u = raw.user || raw;
          setDetails({
            id: u.id || raw.id || '',
            firstName: u.firstName || raw.firstName || '',
            lastName: u.lastName || raw.lastName || '',
            fullName: u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.userName || raw.userName || 'User',
            userName: u.userName || raw.userName || '',
            email: u.email || raw.email || '',
            phoneNumber: u.phoneNumber || raw.phoneNumber,
            isActive: u.isActive ?? raw.isActive ?? true,
            isEmailVerified: u.isEmailVerified ?? raw.isEmailVerified ?? false,
            lastLoginDate: u.lastLoginDate || raw.lastLoginDate,
            roles: raw.roles || u.roles || [],
            permissions: raw.permissions || u.permissions || [],
          });
        }
      })
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <Modal isOpen={true} onClose={onClose} title="User Account Details" size="md">
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2.5rem' }}>
          <span className="spinner-icon" style={{ width: '28px', height: '28px', borderTopColor: 'var(--primary-500)' }}></span>
        </div>
      ) : details ? (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Full Name</div>
              <div style={{ fontWeight: 600, fontSize: '1rem' }}>{details.fullName}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Username</div>
              <code>@{details.userName}</code>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem' }}>
                <Mail size={14} color="var(--text-muted)" /> {details.email}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem' }}>
                <Phone size={14} color="var(--text-muted)" /> {details.phoneNumber || 'Not provided'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Account Status</div>
              <div>
                <Badge variant={details.isActive ? 'success' : 'danger'}>
                  {details.isActive ? 'Active' : 'Disabled'}
                </Badge>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last Login</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <Calendar size={13} color="var(--text-muted)" />
                {details.lastLoginDate ? new Date(details.lastLoginDate).toLocaleDateString() : 'Never'}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Shield size={14} color="var(--primary-400)" /> Assigned Roles ({details.roles?.length || 0})
            </div>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {details.roles && details.roles.length > 0 ? (
                details.roles.map((r) => (
                  <Badge key={r} variant={r.toUpperCase() === 'SUPERADMIN' ? 'danger' : 'primary'}>
                    {r}
                  </Badge>
                ))
              ) : (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No roles assigned.</span>
              )}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Granted Permissions ({details.permissions?.length || 0})
            </div>
            <div
              style={{
                display: 'flex',
                gap: '0.35rem',
                flexWrap: 'wrap',
                maxHeight: '160px',
                overflowY: 'auto',
                padding: '0.65rem',
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
              }}
            >
              {details.permissions && details.permissions.length > 0 ? (
                details.permissions.map((p) => (
                  <Badge key={p} variant="neutral" size="sm">
                    {p}
                  </Badge>
                ))
              ) : (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No permissions granted.</span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>User details could not be loaded.</p>
      )}
    </Modal>
  );
};
