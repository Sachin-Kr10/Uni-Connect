import { Link } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      <div className="glass-card p-12 rounded-3xl text-center max-w-2xl mx-4">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400 mb-6 tracking-tight">
          Welcome to Uni-Connect
        </h1>
        <p className="text-lg text-slate-600 mb-10">
          The exclusive social network for your university. Connect, chat, and share with your peers in a secure environment.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/login" 
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <LogIn className="w-5 h-5" />
            Sign In
          </Link>
          <Link 
            to="/register" 
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
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
