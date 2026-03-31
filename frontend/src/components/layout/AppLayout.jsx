import { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
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
  const shouldHideSuggestions = isChatPage || isGroupsPage;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex overflow-hidden">
      {/* Premium Ambient Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] right-[-10%] w-[800px] h-[800px] rounded-full bg-sky-100/40 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[900px] h-[900px] rounded-full bg-indigo-50/40 blur-[130px]" />
        <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full bg-blue-50/30 blur-[100px]" />
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        
        <div className="flex-1 overflow-y-auto w-full">
          <div className={cn(
            "mx-auto w-full flex justify-center gap-10",
            shouldHideSuggestions ? "max-w-7xl px-4 lg:px-8 py-4 sm:py-6" : "max-w-[1012px]"
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
    </div>
  );
};

export default AppLayout;
