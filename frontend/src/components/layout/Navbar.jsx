import { Link, useLocation } from 'react-router-dom';
import { Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const location = useLocation();

  const desktopNavItems = [
    { label: 'Home', path: '/feed' },
    { label: 'Chat', path: '/chat' },
    { label: 'Clubs', path: '/groups' },
    { label: 'Profile', path: `/profile/${user?.id}` },
    { label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="sticky top-0 z-40 glass-nav">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="h-16 flex items-center justify-between">
          {/* Left: Hamburger (Mobile) + Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="p-2.5 -ml-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all active:scale-95 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/feed" className="font-[family-name:var(--font-display)] font-extrabold text-2xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-tertiary-500 pb-1">
              Indigo Club
            </Link>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {desktopNavItems.map((item) => {
              const isActive = item.path === `/profile/${user?.id}`
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 font-[family-name:var(--font-body)]",
                    isActive
                      ? "text-primary-600 bg-primary-50"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-primary-600 transition-all active:scale-95">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-primary-600 transition-all active:scale-95 relative group">
              <Bell className="w-5 h-5 group-hover:animate-bounce" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-secondary-500 border-2 border-surface shadow-sm" />
            </button>
            <Link
              to={`/profile/${user?.id}`}
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-500 to-tertiary-500 flex items-center justify-center text-white font-bold text-sm tracking-tight hover:shadow-ambient transition-shadow"
            >
              {user?.name?.charAt(0) || 'U'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
