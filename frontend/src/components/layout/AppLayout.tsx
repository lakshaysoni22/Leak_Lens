import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileNav from './MobileNav';

export const AppLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('ll_sidebar_collapsed');
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ll_sidebar_collapsed', JSON.stringify(isCollapsed));
    } catch {
      // ignore
    }
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-[#080B12] text-[#F5F7FA] flex flex-col md:flex-row antialiased overflow-hidden">
      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden md:flex shrink-0">
        <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Sticky TopBar */}
        <TopBar />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-8 p-4 sm:p-6 lg:p-8 scrollbar-thin">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (md:hidden) */}
      <MobileNav />
    </div>
  );
};

export default AppLayout;
