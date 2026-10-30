import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useLocale } from '../../hooks/useLocale';
import { Sun, Moon, LogOut, User, KeyRound, Menu, PanelLeft, PanelRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LanguageSelector } from '../common/LanguageSelector';

interface TopbarProps {
  onToggleSidebar: () => void;
  isSidebarCollapsed?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar, isSidebarCollapsed }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currentLocale, t } = useLocale();
  const isRtl = currentLocale?.direction?.toUpperCase() === 'RTL' || document.documentElement.dir === 'rtl';
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    return parts.map((p) => p[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <button
          className="theme-toggle-btn"
          onClick={onToggleSidebar}
          title={isSidebarCollapsed ? t('LeftMenu.expandSidebar', 'Expand Sidebar (Full Menu)') : t('LeftMenu.collapseSidebar', 'Collapse / Hide Sidebar')}
          aria-label="Toggle Sidebar Menu"
        >
          {isSidebarCollapsed ? (isRtl ? <PanelRight size={19} /> : <PanelLeft size={19} />) : <Menu size={19} />}
        </button>
      </div>

      <div className="topbar-right">
        <LanguageSelector />

        <button className="theme-toggle-btn" onClick={toggleTheme} title={t('Topbar.toggleTheme', 'Toggle Dark/Light Mode')}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            className="user-profile-btn"
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-expanded={dropdownOpen}
          >
            <div className="user-avatar">{getInitials(user?.fullName || user?.userName)}</div>
            <div className="user-info-text">
              <div className="user-info-name">{user?.fullName || user?.userName || t('Topbar.user', 'User')}</div>
              <div className="user-info-role">{user?.roles?.[0] || t('Topbar.member', 'Member')}</div>
            </div>
          </button>

          {dropdownOpen && (
            <div
              className="glass-panel"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: isRtl ? 'auto' : 0,
                left: isRtl ? 0 : 'auto',
                width: '230px',
                padding: '0.5rem',
                zIndex: 1000,
                boxShadow: 'var(--shadow-lg)',
                animation: 'scaleIn 0.15s ease-out',
                textAlign: isRtl ? 'right' : 'left',
              }}
            >
              <div
                style={{
                  padding: '0.6rem 0.75rem',
                  borderBottom: '1px solid var(--border-color)',
                  marginBottom: '0.4rem',
                }}
              >
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user?.fullName || user?.userName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email}
                </div>
              </div>

              <div
                className="nav-item-link"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/profile');
                }}
                style={{ padding: '0.6rem 0.75rem', cursor: 'pointer' }}
              >
                <User size={16} color="var(--primary-400)" />
                <span>{t('Topbar.myProfile', 'My Profile')}</span>
              </div>

              <div
                className="nav-item-link"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/change-password');
                }}
                style={{ padding: '0.6rem 0.75rem', cursor: 'pointer' }}
              >
                <KeyRound size={16} color="var(--primary-400)" />
                <span>{t('Topbar.changePassword', 'Change Password')}</span>
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--border-color)',
                  marginTop: '0.4rem',
                  paddingTop: '0.4rem',
                }}
              >
                <div
                  className="nav-item-link"
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  style={{ padding: '0.6rem 0.75rem', color: 'var(--danger)', cursor: 'pointer' }}
                >
                  <LogOut size={16} />
                  <span>{t('Topbar.logout', 'Logout')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
