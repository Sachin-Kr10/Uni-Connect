import { Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, Users, User, Settings, LogOut, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Feed', icon: Home, path: '/feed' },
    { label: 'Chat', icon: MessageSquare, path: '/chat', badge: 3 },
    { label: 'Clubs', icon: Users, path: '/groups' },
    { label: 'Profile', icon: User, path: `/profile/${user?.id || ''}` },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const handleLogout = async () => {
    await logout();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white/60 backdrop-blur-3xl lg:bg-transparent lg:backdrop-blur-none border-r border-slate-200/50 lg:border-none p-4 w-72 lg:w-full">
      <div className="flex items-center justify-between mb-8 pl-2">
        <Link to="/feed" className="font-black text-2xl text-slate-900 tracking-tighter">
          Uni-Connect<span className="text-primary-500">.</span>
        </Link>
        <button onClick={onClose} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-2xl font-semibold transition-all group",
                isActive 
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/25" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700")} />
                {item.label}
              </div>
              {item.badge && (
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full",
                  isActive ? "bg-white/20 text-white" : "bg-primary-100 text-primary-700"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto pt-4 border-t border-slate-200/50">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 font-semibold hover:bg-red-50 hover:text-red-600 rounded-2xl transition-colors group"
        >
          <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
          Log Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 transform lg:transform-none lg:static lg:block transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        "w-72 lg:w-64"
      )}>
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;
