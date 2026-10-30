import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { ShieldAlert, LogOut, RefreshCw, UserCheck } from 'lucide-react';

export const ForbiddenPage: React.FC = () => {
  const { user, logout, refreshProfile, refreshNavMenus, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleRefresh = async () => {
    const updated = await refreshProfile();
    if (updated && updated.roles && updated.roles.length > 0) {
      await refreshNavMenus();
      navigate('/dashboard');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 30%, rgba(239, 68, 68, 0.12) 0%, transparent 60%), var(--bg-app)',
        padding: '1.5rem',
      }}
    >
      <div
        className="glass-panel animate-fade-in forbidden-card"
        style={{
          width: '100%',
          maxWidth: '520px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
            boxShadow: '0 0 25px rgba(239, 68, 68, 0.3)',
          }}
        >
          <ShieldAlert size={36} />
        </div>

        <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          403 ACCESS DENIED / NO ROLES ASSIGNED
        </div>

        <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Restricted Portal Access
        </h2>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
          Hello <strong>{user?.fullName || user?.userName || 'User'}</strong>, your account is authenticated, but currently <strong>has no assigned roles or system permissions</strong> to access portal features.
        </p>

        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-glass-card)',
            border: '1px solid var(--border-color)',
            marginBottom: '1.75rem',
            textAlign: 'left',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', color: 'var(--text-primary)', fontWeight: 600 }}>
            <UserCheck size={16} color="var(--primary-400)" />
            <span>Account Details</span>
          </div>
          <div style={{ color: 'var(--text-muted)' }}>Email: {user?.email || 'N/A'}</div>
          <div style={{ color: 'var(--text-muted)' }}>Username: {user?.userName || 'N/A'}</div>
          <div style={{ color: '#ef4444', marginTop: '0.3rem', fontWeight: 600 }}>
            Roles: None assigned
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="secondary" onClick={handleRefresh} isLoading={isLoading} icon={<RefreshCw size={16} />}>
            Recheck Roles
          </Button>
          <Button variant="danger" onClick={logout} icon={<LogOut size={16} />}>
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};
