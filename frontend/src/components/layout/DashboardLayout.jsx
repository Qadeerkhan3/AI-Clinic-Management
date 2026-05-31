import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar  from './Navbar';
import { useState, useEffect, useCallback } from 'react';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [isDesktop,   setIsDesktop]   = useState(() => window.innerWidth >= 1024);

  const handleResize = useCallback(() => {
    const desktop = window.innerWidth >= 1024;
    setIsDesktop(desktop);
    if (desktop) setSidebarOpen(true);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const showOverlay = sidebarOpen && !isDesktop;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* Mobile overlay backdrop */}
      {showOverlay && (
        <div
          className="fixed inset-0 bg-black/50 z-20 transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — fixed on mobile, static on desktop */}
      <div className={`
        ${isDesktop ? 'relative flex-shrink-0' : 'fixed inset-y-0 left-0 z-30'}
        ${!sidebarOpen && !isDesktop ? '-translate-x-full' : 'translate-x-0'}
        transition-transform duration-300 ease-in-out
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} isDesktop={isDesktop} />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Navbar onToggle={() => setSidebarOpen(prev => !prev)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

    </div>
  );
}