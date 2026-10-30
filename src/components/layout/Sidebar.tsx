import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../hooks/useLocale';
import { UserNavMenuResponse } from '../../types';
import {
  LayoutGrid,
  Database,
  Users,
  Landmark,
  Building2,
  Calendar,
  Image as ImageIcon,
  Heart,
  PieChart,
  Compass,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  CircleDot,
  Layers,
  Settings,
  History,
  Shield,
  KeyRound,
  Sliders,
  Menu as MenuIcon,
  FileText,
  Folder,
  UserCheck,
} from 'lucide-react';

import headerLogoLTR from '../../assets/masjid-images/iMasjid_Header_Logo_LTR.svg';
import headerLogoRTL from '../../assets/masjid-images/iMasjid_Header_Logo_RTL.svg';
import menuBg from '../../assets/masjid-images/iMasjid_Menu_BG.svg';
import loginLogo from '../../assets/masjid-images/iMasjid_Login.svg';

const iconMap: Record<string, React.ReactNode> = {
  dashboard: <LayoutGrid size={19} />,
  layoutdashboard: <LayoutGrid size={19} />,
  grid: <LayoutGrid size={19} />,
  database: <Database size={19} />,
  master: <Database size={19} />,
  identity: <Users size={19} />,
  people: <Users size={19} />,
  users: <Users size={19} />,
  user: <UserCheck size={19} />,
  security: <Shield size={19} />,
  shield: <Shield size={19} />,
  roles: <KeyRound size={19} />,
  vpn_key: <KeyRound size={19} />,
  key: <KeyRound size={19} />,
  menu: <MenuIcon size={19} />,
  actions: <Sliders size={19} />,
  touch_app: <Sliders size={19} />,
  sliders: <Sliders size={19} />,
  tune: <Settings size={19} />,
  settings: <Settings size={19} />,
  hub: <Compass size={19} />,
  compass: <Compass size={19} />,
  audit: <History size={19} />,
  history: <History size={19} />,
  mosque_admin: <Landmark size={19} />,
  mosque: <Landmark size={19} />,
  landmark: <Landmark size={19} />,
  mosque_mgmt: <Building2 size={19} />,
  building: <Building2 size={19} />,
  events: <Calendar size={19} />,
  calendar: <Calendar size={19} />,
  gallery: <ImageIcon size={19} />,
  image: <ImageIcon size={19} />,
  donations: <Heart size={19} />,
  heart: <Heart size={19} />,
  reports: <PieChart size={19} />,
  piechart: <PieChart size={19} />,
  file_text: <FileText size={19} />,
  folder: <Folder size={19} />,
};

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  mobileOpen,
  onCloseMobile,
}) => {
  // Purely dynamic menus derived from user's active role from the backend
  const { navMenus } = useAuth();
  const { currentLocale, t } = useLocale();
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const isRtl = currentLocale?.direction?.toUpperCase() === 'RTL' || document.documentElement.dir === 'rtl';
  const headerLogo = isRtl ? headerLogoRTL : headerLogoLTR;

  // Auto-expand group if current path is an active child route
  useEffect(() => {
    (navMenus || []).forEach((item) => {
      const children = item.children || item.subMenus || [];
      if (children.length > 0) {
        const isChildActive = children.some(
          (sub) => sub.route && sub.route !== '#' && location.pathname.startsWith(sub.route)
        );
        if (isChildActive) {
          setOpenGroups((prev) => ({ ...prev, [item.title]: true }));
        }
      }
    });
  }, [location.pathname, navMenus]);

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const getIcon = (iconName?: string) => {
    if (!iconName) return <Layers size={19} />;
    const key = iconName.toLowerCase().replace(/[-_]/g, '');
    const directMatch = iconMap[iconName.toLowerCase()] || iconMap[key];
    return directMatch || <Layers size={19} />;
  };

  const renderMenuItem = (item: UserNavMenuResponse) => {
    const children = item.children || item.subMenus || [];
    const hasChildren = children.length > 0;
    const isGroupOpen = !!openGroups[item.title];
    const isParentActive =
      hasChildren &&
      children.some((sub) => sub.route && sub.route !== '#' && location.pathname.startsWith(sub.route));

    if (hasChildren) {
      return (
        <div key={item.id || item.title} style={{ marginBottom: '0.2rem' }}>
          <div
            onClick={() => toggleGroup(item.title)}
            title={collapsed ? item.title : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.92rem',
              fontWeight: isParentActive ? 600 : 500,
              cursor: 'pointer',
              userSelect: 'none',
              background: isParentActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isParentActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            }}
            onMouseLeave={(e) => {
              if (!isParentActive) e.currentTarget.style.background = 'transparent';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
              <span style={{ display: 'flex', alignItems: 'center', color: '#ffffff', flexShrink: 0 }}>
                {getIcon(item.icon)}
              </span>
              {!collapsed && (
                <span
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    letterSpacing: '0.01em',
                  }}
                >
                  {item.title}
                </span>
              )}
            </div>
            {!collapsed && (
              <span style={{ color: 'rgba(255, 255, 255, 0.75)', display: 'flex', alignItems: 'center' }}>
                {isGroupOpen ? <ChevronDown size={16} /> : isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </span>
            )}
          </div>

          {!collapsed && isGroupOpen && (
            <div
              style={{
                paddingLeft: isRtl ? 0 : '1.25rem',
                paddingRight: isRtl ? '1.25rem' : 0,
                marginLeft: isRtl ? 0 : '1.15rem',
                marginRight: isRtl ? '1.15rem' : 0,
                borderLeft: isRtl ? 'none' : '1.5px solid rgba(255, 255, 255, 0.15)',
                borderRight: isRtl ? '1.5px solid rgba(255, 255, 255, 0.15)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem',
                marginTop: '0.25rem',
                marginBottom: '0.35rem',
              }}
            >
              {children.map((sub) => {
                return (
                  <NavLink
                    key={sub.id || sub.route}
                    to={sub.route || '#'}
                    onClick={onCloseMobile}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.84rem',
                      textDecoration: 'none',
                      color: isActive ? '#3ca2c3' : 'rgba(255, 255, 255, 0.85)',
                      fontWeight: isActive ? 600 : 400,
                      background: isActive ? 'rgba(0, 110, 140, 0.25)' : 'transparent',
                      transition: 'all 0.15s ease',
                    })}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', opacity: 0.85 }}>
                      {getIcon(sub.icon) || <CircleDot size={12} />}
                    </span>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {sub.title}
                    </span>
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    // Direct Single Route Item (e.g. Dashboard)
    return (
      <NavLink
        key={item.id || item.route}
        to={item.route || '/dashboard'}
        onClick={onCloseMobile}
        title={collapsed ? item.title : undefined}
        style={({ isActive }) => ({
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.65rem 0.85rem',
          borderRadius: '8px',
          color: '#ffffff',
          textDecoration: 'none',
          fontSize: '0.92rem',
          fontWeight: isActive ? 700 : 500,
          background: isActive ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
          border: isActive ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid transparent',
          boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.12)' : 'none',
          transition: 'all 0.15s ease',
          marginBottom: '0.2rem',
        })}
      >
        <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: '#ffffff' }}>
          {getIcon(item.icon)}
        </span>
        {!collapsed && <span style={{ letterSpacing: '0.01em' }}>{item.title}</span>}
      </NavLink>
    );
  };

  return (
    <aside
      className={`app-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
      style={{
        width: collapsed ? '78px' : '270px',
        backgroundColor: '#173f53',
        backgroundImage: `url(${menuBg})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center bottom',
        backgroundSize: 'cover',
        borderRight: isRtl ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
        borderLeft: isRtl ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: isRtl ? 'auto' : 0,
        right: isRtl ? 0 : 'auto',
        height: '100vh',
        zIndex: 100,
        overflow: 'hidden',
        color: '#ffffff',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        direction: isRtl ? 'rtl' : 'ltr',
      }}
    >
      {/* SIDEBAR HEADER: Transparent background seamlessly sharing menuBg */}
      <div
        style={{
          height: '84px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0' : '0 1.25rem',
          background: 'transparent',
          borderBottom: 'none',
          flexShrink: 0,
        }}
      >
        {collapsed ? (
          <img
            src={loginLogo}
            alt="iMasjid"
            style={{
              height: '38px',
              width: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.25))',
            }}
          />
        ) : (
          <img
            key={isRtl ? 'rtl-logo' : 'ltr-logo'}
            src={headerLogo}
            alt="iMasjid Connect"
            style={{
              maxHeight: '48px',
              maxWidth: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.25))',
            }}
          />
        )}
      </div>

      {/* DYNAMIC MENU ITEMS NAVIGATION LIST - ONLY THIS SCROLLS */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '0.75rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.15rem',
        }}
        className="sidebar-scroll-container"
      >
        {navMenus && navMenus.length > 0 ? (
          navMenus.map((item) => renderMenuItem(item))
        ) : (
          <div
            style={{
              padding: '2rem 1rem',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.65)',
              fontSize: '0.825rem',
              lineHeight: 1.5,
            }}
          >
            {t('LeftMenu.loadingMenu', 'Memuat menu perizinan peran...')}
          </div>
        )}
      </div>

      {/* SIDEBAR FOOTER: Transparent background seamlessly sharing menuBg */}
      {!collapsed && (
        <div
          style={{
            padding: '1rem 1.15rem',
            fontSize: '0.72rem',
            lineHeight: 1.5,
            color: 'rgba(255, 255, 255, 0.75)',
            background: 'transparent',
            borderTop: 'none',
            flexShrink: 0,
            textAlign: isRtl ? 'right' : 'left',
          }}
        >
          <div style={{ fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)', marginBottom: '0.15rem' }}>
            ©{new Date().getFullYear()}. {t('LeftMenu.allRightsReserved', 'All Rights Reserved.')}
          </div>
          <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: '0.15rem' }}>
            {t('LeftMenu.mmsV1', 'iMasjid Connect V2.1.0')}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
            {t('LeftMenu.poweredBy', 'Developed in collaboration between')} <br />
            <strong>{t('LeftMenu.makmurMadani', 'PT Sultan Raj Sinergi')}</strong>
          </div>
        </div>
      )}
    </aside>
  );
};
