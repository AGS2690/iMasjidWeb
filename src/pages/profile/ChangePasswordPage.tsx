import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { authApi } from '../../api/authApi';
import { extractErrorMessage } from '../../api/client';
import { KeyRound, ShieldCheck, Lock, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ChangePasswordPage: React.FC = () => {
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password strength checks
  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const validScore = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecial].filter(Boolean).length;
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['var(--danger)', '#f97316', '#eab308', '#3b82f6', 'var(--success)'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasMinLength) {
      error('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      error('New password and confirm password do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authApi.changePassword({ currentPassword, newPassword, confirmPassword });
      if (res.isSuccess || res.success) {
        success(res.message || 'Password changed successfully. Please log in again.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        error(res.message || 'Failed to update password.');
      }
    } catch (err) {
      error(extractErrorMessage(err), 'Password change failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <PageHeader
        title="Change Password"
        subtitle="Ensure your account stays secure by choosing a strong, unique password."
        actions={
          <Button variant="ghost" onClick={() => navigate('/profile')}>
            Back to Profile
          </Button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        {/* Form Card */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(0, 110, 140, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-400)',
              }}
            >
              <KeyRound size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Update Password</h3>
              <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                Enter your existing password followed by your new password.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ position: 'relative' }}>
              <Input
                label="Current Password"
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current account password"
                required
                leftIcon={<Lock size={16} />}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '36px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
                title={showCurrent ? 'Hide password' : 'Show password'}
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <Input
                label="New Password"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter strong new password (min. 8 chars)"
                required
                leftIcon={<Lock size={16} />}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '36px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
                title={showNew ? 'Hide password' : 'Show password'}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password strength bar */}
            {newPassword && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Password Strength:</span>
                  <span style={{ fontWeight: 600, color: strengthColors[validScore - 1] || 'var(--text-muted)' }}>
                    {strengthLabels[validScore - 1] || 'Very Weak'}
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--bg-input)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${(validScore / 5) * 100}%`,
                      background: strengthColors[validScore - 1] || 'var(--danger)',
                      transition: 'all 0.3s ease',
                    }}
                  />
                </div>
              </div>
            )}

            <div style={{ position: 'relative' }}>
              <Input
                label="Confirm New Password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                required
                leftIcon={<Lock size={16} />}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '36px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
                title={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {confirmPassword && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', marginBottom: '1rem', color: isMatch ? 'var(--success)' : 'var(--danger)' }}>
                {isMatch ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                <span>{isMatch ? 'Passwords match' : 'Passwords do not match'}</span>
              </div>
            )}

            <Button
              variant="primary"
              type="submit"
              isLoading={isSubmitting}
              icon={<ShieldCheck size={18} />}
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}
            >
              Update Password
            </Button>
          </form>
        </div>

        {/* Requirements Card */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <ShieldCheck size={20} color="var(--primary-400)" />
            <h4 style={{ margin: 0, fontSize: '1rem' }}>Password Security Rules</h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
            To safeguard your account and comply with API security policies, your new password must satisfy the following:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: hasMinLength ? 'var(--success)' : 'var(--text-muted)' }}>
              {hasMinLength ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              <span>At least 8 characters long</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: hasUpperCase ? 'var(--success)' : 'var(--text-muted)' }}>
              {hasUpperCase ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              <span>At least one uppercase letter (A-Z)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: hasLowerCase ? 'var(--success)' : 'var(--text-muted)' }}>
              {hasLowerCase ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              <span>At least one lowercase letter (a-z)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: hasNumber ? 'var(--success)' : 'var(--text-muted)' }}>
              {hasNumber ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              <span>At least one digit (0-9)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: hasSpecial ? 'var(--success)' : 'var(--text-muted)' }}>
              {hasSpecial ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              <span>At least one special character (!@#$%^&*)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
