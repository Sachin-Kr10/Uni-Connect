import { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import SuggestionsSidebar from '../../features/feed/SuggestionsSidebar';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const location = useLocation();
  const isChatPage = location.pathname.startsWith('/chat');
  const isGroupsPage = location.pathname.startsWith('/groups');
  const isProfilePage = location.pathname.startsWith('/profile');
  const isSettingsPage = location.pathname.startsWith('/settings');
  const shouldHideSuggestions = isChatPage || isGroupsPage || isProfilePage || isSettingsPage;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-10 h-10 rounded-full border-4 border-surface-container border-t-primary-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-surface flex overflow-hidden">
      {/* Premium Ambient Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] right-[-10%] w-[800px] h-[800px] rounded-full bg-primary-100/30 blur-[140px]" style={{ animation: 'float 8s ease-in-out infinite' }} />
        <div className="absolute bottom-[-15%] left-[-10%] w-[900px] h-[900px] rounded-full bg-tertiary-100/25 blur-[150px]" style={{ animation: 'float 10s ease-in-out infinite reverse' }} />
        <div className="absolute top-[30%] left-[20%] w-[400px] h-[400px] rounded-full bg-secondary-100/15 blur-[120px]" />
      </div>

      {/* Mobile sidebar toggle button (hamburger) — fixed top-left */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 left-4 z-[55] p-2.5 rounded-xl bg-surface-lowest/80 backdrop-blur-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all active:scale-95 lg:hidden shadow-md border border-outline-variant/15"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <div className="flex-1 overflow-y-auto w-full pb-16 lg:pb-0">
          <div className={cn(
            "mx-auto w-full flex justify-center gap-10",
            shouldHideSuggestions ? "max-w-7xl px-4 lg:px-8 py-4 sm:py-6" : "max-w-[1012px] pt-4 sm:pt-6"
          )}>
            <div className={cn(
              "w-full",
              !shouldHideSuggestions && "flex-1 max-w-[600px]"
            )}>
              <Outlet />
            </div>

            {/* Desktop Suggestions Sidebar */}
            {!shouldHideSuggestions && (
              <div className="hidden lg:block w-[320px] shrink-0">
                <SuggestionsSidebar />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default AppLayout;
