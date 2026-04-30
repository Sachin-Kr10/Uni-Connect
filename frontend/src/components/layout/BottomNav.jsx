import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { getAvatar } from '../../utils/avatar';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { notificationCount } = useSocket();

  const items = [
    { icon: 'home', path: '/feed', label: 'Home' },
    { icon: 'groups', path: '/groups', label: 'Communities' },
    { icon: 'add_box', path: '#create', label: 'Create', isAction: true },
    { icon: 'notifications', path: '/announcements', label: 'Alerts', hasBadge: true },
    { icon: 'person', path: `/profile/${user?.id}`, label: 'Profile', isAvatar: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[60] bg-surface-lowest/80 backdrop-blur-xl border-t border-outline-variant/15 lg:hidden shadow-[0_-8px_24px_rgba(44,47,48,0.04)]">
      <div className="flex items-center justify-around h-16 px-4">
        {items.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && !item.isAction && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.label}
              to={item.isAction ? '/feed' : item.path}
              onClick={(e) => {
                if (item.isAction) {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  document.querySelector('textarea')?.focus();
                }
              }}
              className={cn(
                'flex flex-col items-center justify-center w-12 h-12 transition-all duration-300 group relative',
                isActive 
                  ? 'text-primary-600' 
                  : 'text-on-surface-variant hover:text-on-surface'
              )}
            >
              <div className="relative">
                {item.isAvatar ? (
                  <img 
                    src={getAvatar(user)} 
                    alt="Profile" 
                    className={cn(
                      "w-6 h-6 rounded-full object-cover border transition-all duration-300 pointer-events-none group-hover:scale-110",
                      isActive ? "border-primary-600 scale-110" : "border-outline-variant/30"
                    )}
                  />
                ) : (
                  <span 
                    className={cn(
                      "material-symbols-outlined transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] pointer-events-none",
                      isActive ? "scale-110" : "group-hover:scale-110 group-active:scale-95"
                    )}
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                )}
                {isActive && !item.isAvatar && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-600" />
                )}
                {/* Notification badge */}
                {item.hasBadge && notificationCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-primary-600 text-white text-[9px] font-black">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
