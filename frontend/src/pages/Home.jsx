import { Link } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';

const Home = () => {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-cyber-mesh relative overflow-hidden p-4 md:p-8">
      {/* Moving Neon Light Rays */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-[40%] left-[-10%] w-[120%] h-[20%] bg-neon-pink/10 blur-[100px] -rotate-12 animate-pulse" />
        <div className="absolute top-[30%] right-[-10%] w-[120%] h-[20%] bg-neon-blue/10 blur-[100px] rotate-12" />
      </div>

      <div className="glass-2080 p-8 md:p-12 lg:p-16 rounded-[3rem] text-center max-w-4xl w-full mx-auto relative group">
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-neon-blue opacity-50 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-neon-pink opacity-50 group-hover:opacity-100 transition-opacity" />

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tighter leading-none uppercase">
          Uni<span className="text-neon-blue">.</span>Connect <br />
          <span className="text-neon-pink animate-pulse">2080</span>
        </h1>
        
        <p className="text-base md:text-lg text-slate-400 mb-8 max-w-xl mx-auto leading-relaxed tracking-wide font-medium">
          Access the secure campus mainframe. <br />
          Connect with neural nodes across the university grid.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link 
            to="/login" 
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-4 bg-neon-blue/20 hover:bg-neon-blue/40 text-neon-blue border border-neon-blue rounded-full font-black text-sm uppercase tracking-[0.2em] transition-all shadow-glow-blue hover:shadow-[0_0_30px_var(--color-neon-blue)] active:scale-95"
          >
            <LogIn className="w-5 h-5" />
            Initialize
          </Link>
          <Link 
            to="/register" 
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-4 bg-neon-pink/20 hover:bg-neon-pink/40 text-neon-pink border border-neon-pink rounded-full font-black text-sm uppercase tracking-[0.2em] transition-all shadow-glow-pink hover:shadow-[0_0_30px_var(--color-neon-pink)] active:scale-95"
          >
            <UserPlus className="w-5 h-5" />
            New Node
          </Link>
        </div>

        {/* System Status Line */}
        <div className="mt-10 flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500">
          <span className="w-2 h-2 rounded-full bg-neon-yellow animate-ping" />
          Network Status: Optimal
          <span className="w-10 h-[1px] bg-slate-800" />
          v2080.4.12
        </div>
      </div>
    </div>
  );
};



export default Home;
