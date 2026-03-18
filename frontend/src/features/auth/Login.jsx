import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Connect to backend login API
    setTimeout(() => {
      setIsLoading(false);
      console.log('Login attempt:', formData);
    }, 1500);
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-cyber-mesh relative overflow-hidden p-4 md:p-8">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-neon-pink/5 blur-[120px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-neon-blue/5 blur-[120px]" />
      </div>

      <div className="glass-2080 w-full max-w-md p-8 md:p-12 rounded-[2.5rem] shadow-futuristic relative group">
        <div className="text-center mb-10">
          <div className="inline-block px-3 py-1 mb-4 border border-neon-blue/30 bg-neon-blue/10 text-neon-blue rounded-full text-[10px] uppercase tracking-[0.3em] font-black">
            Auth Service v8.0
          </div>
          <h2 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase">
            Login
          </h2>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Identify yourself to the grid</p>
        </div>



        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Access Key (Email)</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-neon-blue transition-colors">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                required
                className="w-full cyber-input"
                placeholder="USER@MAINFRM"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Neural Passcode</label>
              <Link to="/forgot-password" size="xs" className="text-[10px] font-black text-neon-blue hover:text-white transition-colors uppercase tracking-widest">
                Recover?
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-neon-blue transition-colors">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type="password"
                required
                className="w-full cyber-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-4 cyber-button-blue mt-6 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
            {!isLoading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <div className="mt-8 text-center text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
          No Access?{' '}
          <Link to="/register" className="text-neon-pink hover:text-white transition-colors">
            Request Uplink
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
