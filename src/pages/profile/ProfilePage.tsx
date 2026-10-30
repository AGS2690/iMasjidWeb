import React, { useEffect, useState, useEffectEvent } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Switch } from '../../components/common/Switch';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { authApi } from '../../api/authApi';
import { extractErrorMessage } from '../../api/client';
import { UserDetailsResponse } from '../../types';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Lock,
  CheckCircle,
  RefreshCw,
  KeyRound,
  Hash,
  ShieldCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '../../hooks/useLocale';

export const ProfilePage: React.FC = () => {
  const { user: contextUser, refreshProfile } = useAuth();
  const { success, error } = useToast();
  const { t } = useLocale();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState<UserDetailsResponse | null>(contextUser);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isToggling2FA, setIsToggling2FA] = useState(false);

  const handleToggle2FA = async (enable: boolean) => {
    setIsToggling2FA(true);
    try {
      const res = await authApi.toggleTwoFactor({ enable });
      const isOk = res.success ?? res.isSuccess;
      if (isOk) {
        success(res.message || `Two-factor authentication has been ${enable ? 'enabled' : 'disabled'}.`);
        await fetchProfileFromServer();
        await refreshProfile();
      } else {
        error(res.message || 'Failed to update two-factor authentication.');
      }
    } catch (err) {
      error(extractErrorMessage(err), 'Update Failed');
    } finally {
      setIsToggling2FA(false);
    }
  };

  const fetchProfileFromServer = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const res = await authApi.getMe();
      const isOk = res.success ?? res.isSuccess;
      if (isOk && res.data) {
        // Normalize response whether backend returns { user: {...}, roles: [...], permissions: [...] } or flat
        const raw = res.data as any;
        const u = raw.user || raw;
        const normalized: UserDetailsResponse = {
          id: u.id || raw.id || '',
          firstName: u.firstName || raw.firstName || '',
          lastName: u.lastName || raw.lastName || '',
          fullName: u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.userName || raw.userName || 'User',
          userName: u.userName || raw.userName || '',
          email: u.email || raw.email || '',
          phoneNumber: u.phoneNumber || raw.phoneNumber || '',
          isActive: u.isActive ?? raw.isActive ?? true,
          isEmailVerified: u.isEmailVerified ?? raw.isEmailVerified ?? false,
          lastLoginDate: u.lastLoginDate || raw.lastLoginDate,
          roles: raw.roles || u.roles || [],
          permissions: raw.permissions || u.permissions || [],
        };

        setProfileData(normalized);
        await refreshProfile();

        if (isManualRefresh) {
          success('Profile reloaded from server.');
        }
      }
    } catch (err) {
      error(extractErrorMessage(err), 'Failed to fetch user profile');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchProfileFromEffect = useEffectEvent(fetchProfileFromServer);

  useEffect(() => {
    fetchProfileFromEffect();
  }, []);

  const activeUser = profileData || contextUser;

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div>
      <PageHeader
        title={t('Profile.title', 'My Profile')}
        subtitle={t('Profile.subtitle', 'Manage your personal account credentials, contact information, and security preferences.')}
        actions={
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button
              variant="secondary"
              icon={<RefreshCw size={16} className={isRefreshing ? 'spinner-icon' : ''} />}
              onClick={() => fetchProfileFromServer(true)}
              disabled={isRefreshing || isLoading}
            >
              {t('Profile.refreshData', 'Refresh Profile')}
            </Button>
            <Button
              variant="primary"
              icon={<KeyRound size={16} />}
              onClick={() => navigate('/change-password')}
            >
              {t('Profile.changePassword', 'Change Password')}
            </Button>
          </div>
        }
      />

      {isLoading && !profileData ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <span className="spinner-icon" style={{ width: '32px', height: '32px', borderTopColor: 'var(--primary-500)' }}></span>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>{t('Common.loading', 'Loading account profile...')}</p>
        </div>
      ) : (
        <>
          {/* Main Profile Header Banner */}
          <div
            className="glass-panel"
            style={{
              padding: '2rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.5rem',
              background: 'linear-gradient(135deg, rgba(0, 110, 140, 0.12) 0%, rgba(23, 63, 83, 0.08) 100%)',
              border: '1px solid rgba(0, 110, 140, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div
                className="user-avatar"
                style={{
                  width: '80px',
                  height: '80px',
                  fontSize: '2rem',
                  boxShadow: 'var(--shadow-glow)',
                }}
              >
                {getInitials(activeUser?.fullName || activeUser?.userName)}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>
                    {activeUser?.fullName || `${activeUser?.firstName || ''} ${activeUser?.lastName || ''}`.trim() || activeUser?.userName || 'User'}
                  </h2>
                  <Badge variant={activeUser?.isActive ? 'success' : 'danger'}>
                    {activeUser?.isActive ? t('Common.activeAccount', 'Active Account') : t('Common.disabled', 'Disabled')}
                  </Badge>
                  {activeUser?.isEmailVerified && (
                    <Badge variant="primary">
                      <CheckCircle size={12} style={{ marginRight: '4px' }} /> {t('Profile.emailVerified', 'Email Verified')}
                    </Badge>
                  )}
                </div>
                <p style={{ margin: '0.35rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  <code>@{activeUser?.userName}</code> &bull; {activeUser?.email}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {activeUser?.roles?.map((r) => (
                <Badge
                  key={r}
                  variant={r.toUpperCase() === 'SUPERADMIN' ? 'danger' : 'primary'}
                  style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                >
                  <Shield size={14} style={{ marginRight: '6px' }} /> {r}
                </Badge>
              ))}
            </div>
          </div>

          <div className="profile-main-grid">
            {/* Account Details Card */}
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={18} color="var(--primary-400)" /> {t('Profile.personalInfo', 'Personal Information')}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('Profile.firstName', 'First Name')}</span>
                  <span style={{ fontWeight: 600 }}>{activeUser?.firstName || '-'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('Profile.lastName', 'Last Name')}</span>
                  <span style={{ fontWeight: 600 }}>{activeUser?.lastName || '-'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('Profile.username', 'Username')}</span>
                  <code>{activeUser?.userName}</code>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('Profile.emailAddress', 'Email Address')}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Mail size={14} color="var(--text-muted)" /> {activeUser?.email}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('Profile.phoneNumber', 'Phone Number')}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Phone size={14} color="var(--text-muted)" /> {activeUser?.phoneNumber || '-'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>User ID</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <Hash size={13} /> <code>{activeUser?.id}</code>
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('Users.colLastLogin', 'Last Login')}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                    <Calendar size={14} color="var(--text-muted)" />
                    {activeUser?.lastLoginDate ? new Date(activeUser.lastLoginDate).toLocaleString() : t('Common.never', 'Never')}
                  </span>
                </div>
              </div>
            </div>

            {/* Security & Authentication Card */}
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={18} color="var(--primary-400)" /> {t('Profile.accountSecurity', 'Security & Password')}
              </h3>

              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                  {t('Profile.changePassword', 'Password Protection')}
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Keep your credentials secure and regularly change your login password.
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<KeyRound size={15} />}
                  onClick={() => navigate('/change-password')}
                >
                  {t('Profile.changePassword', 'Change Password')}
                </Button>
              </div>

              {/* Two-Factor Authentication Box */}
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      marginBottom: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                    }}
                  >
                    <ShieldCheck size={16} color="var(--primary-400)" /> {t('Profile.twoFactorTitle', 'Two-Factor Authentication (2FA)')}
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    {t('Profile.twoFactorSubtitle', 'Require email verification OTP code upon sign in.')}
                  </div>
                </div>
                <Switch
                  checked={!!activeUser?.twoFactorEnabled}
                  disabled={isToggling2FA}
                  onChange={(checked) => handleToggle2FA(checked)}
                />
              </div>

              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  {t('Profile.assignedRoles', 'Assigned Roles:')}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {activeUser?.roles && activeUser.roles.length > 0 ? (
                    activeUser.roles.map((r) => (
                      <Badge key={r} variant={r.toUpperCase() === 'SUPERADMIN' ? 'danger' : 'primary'}>
                        {r}
                      </Badge>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No roles assigned.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Permissions Matrix Overview */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={18} color="var(--primary-400)" /> Effective Permissions ({activeUser?.permissions?.length || 0})
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              The following granular security permissions are currently granted to your account via your assigned roles:
            </p>

            {activeUser?.roles?.some((r) => r.toUpperCase() === 'SUPERADMIN') ? (
              <div
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(0, 110, 140, 0.1)',
                  border: '1px solid var(--primary-500)',
                  color: 'var(--primary-400)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                ? SuperAdmin Role: You have full unrestricted administrative privileges across all system endpoints and resources.
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {activeUser?.permissions && activeUser.permissions.length > 0 ? (
                  activeUser.permissions.map((p) => (
                    <Badge key={p} variant="neutral" style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}>
                      {p}
                    </Badge>
                  ))
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No explicit permissions assigned.</span>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
