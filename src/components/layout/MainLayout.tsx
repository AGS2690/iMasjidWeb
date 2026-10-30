import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import '../../styles/layout.css';

export const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleSidebar = () => {
    // On small screens (<=900px), toggle mobile drawer; on desktop, toggle collapsed mini/full mode
    if (window.innerWidth <= 900) {
      setMobileOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  };

  return (
    <div className="app-layout-container">
      {/* Mobile backdrop overlay */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          title="Click to close menu"
        />
      )}

      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className={`app-main-wrapper ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <Topbar
          onToggleSidebar={handleToggleSidebar}
          isSidebarCollapsed={collapsed}
        />
        <main className="app-content-body animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
