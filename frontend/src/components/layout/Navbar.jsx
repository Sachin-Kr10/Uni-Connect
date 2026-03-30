import { Link } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <div className="h-16 glass-card sticky top-0 z-40 border-b border-white/20 px-4 flex items-center justify-between lg:hidden shadow-sm">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100/50 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link to="/feed" className="font-bold text-lg text-slate-800 tracking-tight">
          Uni-Connect
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded-xl text-slate-600 hover:bg-slate-100/50 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 shadow-sm flex items-center justify-center text-white font-semibold text-sm">
          {user?.name?.charAt(0) || 'U'}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
