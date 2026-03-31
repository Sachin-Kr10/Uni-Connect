import { Link } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <div className="h-16 sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 px-4 flex items-center justify-between lg:hidden shadow-sm">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="p-2.5 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-all active:scale-95"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link to="/feed" className="font-black text-xl text-slate-900 tracking-tighter">
          Uni-Connect<span className="text-primary-500">.</span>
        </Link>
      </div>

      <div className="flex items-center gap-2.5">
        <button className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100/80 hover:text-primary-600 transition-all active:scale-95 relative group">
          <Bell className="w-5 h-5 group-hover:animate-bounce" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white shadow-sm font-black"></span>
        </button>
        <Link to={`/profile/${user?.id}`} className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm tracking-tighter hover:bg-primary-50 hover:text-primary-600 transition-colors border border-slate-200/50">
          {user?.name?.charAt(0) || 'U'}
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
