import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(formData.email, formData.password);
      navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-surface p-4 md:p-12 lg:p-24">
      {/* Premium Background Blobs */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary-100/50 blur-[130px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-tertiary-100/50 blur-[130px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-surface-lowest/20 blur-[150px]" />
      </div>

      <div className="glass-card w-full max-w-[95%] sm:max-w-md p-8 sm:p-12 rounded-[2rem] shadow-2xl relative">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1.5 mb-4 bg-primary-100 text-primary-700 rounded-full text-xs font-bold uppercase tracking-widest">
            Uni-Connect Secure
          </div>
          <h2 className="text-4xl font-black text-on-surface mb-3 tracking-tight font-[family-name:var(--font-display)]">
            Login
          </h2>
          <p className="text-on-surface-variant font-semibold text-sm">Welcome back to your campus community</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-100/80 text-red-600 rounded-xl text-sm font-semibold text-center border border-red-200">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface-variant ml-1">University Email</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary-500 transition-colors">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                required
                className="w-full pl-11 pr-4 py-3.5 bg-surface-container-low border border-outline-variant/20 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-surface-lowest transition-all outline-none text-on-surface"
                placeholder="you@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-sm font-semibold text-on-surface-variant">Password</label>
              <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary-500 transition-colors">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type="password"
                required
                className="w-full pl-11 pr-4 py-3.5 bg-surface-container-low border border-outline-variant/20 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-surface-lowest transition-all outline-none text-on-surface"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold mt-8 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-on-surface-variant">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
            Apply now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
