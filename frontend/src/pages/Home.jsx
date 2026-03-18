import { Link } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 px-4 py-12">
      <div className="glass-card p-6 md:p-12 rounded-3xl text-center max-w-4xl w-full mx-auto transform transition-all duration-500 hover:shadow-2xl">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400 mb-6 tracking-tight leading-tight">
          Welcome to <span className="block md:inline">Uni-Connect</span>
        </h1>
        <p className="text-base md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          The exclusive social network for your university. Connect, chat, and share with your peers in a secure environment designed for academia.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            to="/login" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-primary-500/30 hover:-translate-y-1 active:scale-95"
          >
            <LogIn className="w-5 h-5 font-bold" />
            Sign In
          </Link>
          <Link 
            to="/register" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 rounded-2xl font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-1 active:scale-95"
          >
            <UserPlus className="w-5 h-5 text-primary-600" />
            Create Account
          </Link>
        </div>
      </div>

      
      {/* Decorative blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-primary-400/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>
    </div>
  );
};

export default Home;
