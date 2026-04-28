import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageSquare, Users, User, Settings, LogOut, X, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getAvatar } from '../../utils/avatar';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Feed', icon: Home, path: '/feed' },
    { label: 'Messages', icon: MessageSquare, path: '/chat' },
    { label: 'Communities', icon: Users, path: '/groups' },
    { label: 'My Profile', icon: User, path: `/profile/${user?.id}` },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-surface-lowest/80 backdrop-blur-2xl lg:bg-transparent lg:backdrop-blur-none p-5 w-72 lg:w-full">
      {/* Brand Header */}
      <div className="flex items-center justify-between mb-2 pl-3">
        <Link to="/feed" className="flex flex-col" onClick={onClose}>
          <span className="font-[family-name:var(--font-display)] font-extrabold text-2xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-tertiary-500">
            Uni-Connect
          </span>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mt-0.5">
            Campus Network
          </span>
        </Link>
        <button onClick={onClose} className="lg:hidden p-2 text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* User Quick Info */}
      <div className="flex items-center gap-3 px-3 py-4 mt-4 mb-2 bg-surface-container/40 rounded-2xl">
        <img
          src={getAvatar(user)}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover bg-surface-container"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm font-[family-name:var(--font-display)] tracking-tight truncate text-on-surface">
            {user?.name}
          </h4>
          <p className="text-[10px] text-on-surface-variant font-medium truncate">
            {user?.email}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 space-y-1.5 mt-4">
        {navItems.map((item) => {
          const isActive = item.path === `/profile/${user?.id}` 
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-[15px] transition-all duration-300 group relative overflow-hidden font-[family-name:var(--font-body)]",
                isActive
                  ? "bg-primary-600 text-white shadow-ambient"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              )}
            >
              <div className="flex items-center gap-3.5">
                <item.icon className={cn("w-5 h-5 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
                {item.label}
              </div>
            </Link>
          );
        })}
        
        <div className="pt-6">
          <Link
            to="/feed"
            onClick={() => {
              if (onClose) onClose();
              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                const composer = document.querySelector('textarea');
                if (composer) composer.focus();
              }, 100);
            }}
            className="w-full flex items-center justify-center bg-gradient-to-r from-primary-600 to-tertiary-500 text-white font-[family-name:var(--font-display)] font-bold py-3.5 rounded-2xl shadow-lg shadow-primary-500/20 active:scale-95 transition-transform duration-300 hover:shadow-primary-500/40"
          >
            Create Post
          </Link>
        </div>
      </div>

      {/* Dark Mode Toggle */}
      <div className="px-3 py-4 mb-2 bg-surface-container/40 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isDark ? <Moon className="w-5 h-5 text-tertiary-400" /> : <Sun className="w-5 h-5 text-yellow-500" />}
          <span className="font-bold text-sm text-on-surface">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
        </div>
        <button
          onClick={toggleTheme}
          className={`toggle-switch ${isDark ? 'active' : 'inactive'}`}
        >
          <span className="toggle-knob" />
        </button>
      </div>

      {/* Logout */}
      <div className="mt-auto pt-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant font-semibold hover:bg-secondary-50 hover:text-secondary-600 rounded-2xl transition-colors group"
        >
          <LogOut className="w-5 h-5 group-hover:text-secondary-500 transition-colors" />
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
          className="fixed inset-0 z-40 bg-on-surface/20 backdrop-blur-sm lg:hidden transition-opacity"
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
