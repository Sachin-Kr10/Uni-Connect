import { Link } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 relative overflow-hidden px-4 py-12 md:py-24">
      {/* Premium Mesh Background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-200/40 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-200/30 rounded-full blur-[120px] animation-delay-2000" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-primary-200/20 rounded-full blur-[100px]" />
      </div>

      <div className="glass-card bg-white/60 p-8 md:p-16 lg:p-20 rounded-[2.5rem] text-center max-w-5xl w-full mx-auto shadow-2xl scale-100 hover:scale-[1.01]">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 mb-8 tracking-tighter leading-[0.9]">
          Connect your <br />
          <span className="text-gradient">University Life.</span>
        </h1>
        
        <p className="text-lg md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
          The ultimate social platform for students and clubs. 
          Share, follow, and grow within your exclusive campus community.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
          <Link 
            to="/login" 
            className="group w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold text-lg transition-all shadow-[0_10px_30px_-10px_rgba(22,163,74,0.5)] hover:shadow-[0_15px_35px_-10px_rgba(22,163,74,0.6)] hover:-translate-y-1 active:scale-95"
          >
            <LogIn className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            Sign In
          </Link>
          <Link 
            to="/register" 
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-5 bg-white/80 hover:bg-white text-slate-800 border border-slate-200/60 rounded-2xl font-bold text-lg transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 active:scale-95 backdrop-blur-sm"
          >
            <UserPlus className="w-6 h-6 text-primary-600" />
            Get Started
          </Link>
        </div>
      </div>
      
      {/* Bottom Footer or Info */}
      <div className="mt-12 text-slate-400 font-semibold uppercase tracking-[0.2em] text-xs">
        Trusted by 1000+ Students & Clubs
      </div>
    </div>
  );
};


export default Home;
