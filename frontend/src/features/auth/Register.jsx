import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user', otpCode: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await api.post('/auth/send-otp', { email: formData.email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await register(formData.name, formData.email, formData.password, formData.role, formData.otpCode);
      navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-surface p-4 md:p-12 lg:p-24">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-tertiary-100/50 blur-[130px]" />
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary-100/50 blur-[130px]" />
      </div>

      <div className="glass-card w-full max-w-[95%] sm:max-w-md p-8 sm:p-12 rounded-[2rem] shadow-2xl relative">
        <div className="text-center mb-6">
          <div className="inline-block px-4 py-1.5 mb-4 bg-primary-100 text-primary-700 rounded-full text-xs font-bold uppercase tracking-widest">
            Join Uni-Connect
          </div>
          <h2 className="text-4xl font-black text-on-surface mb-3 tracking-tight leading-none font-[family-name:var(--font-display)]">
            {step === 1 ? 'Create' : 'Verify'} Account
          </h2>
          <p className="text-on-surface-variant font-semibold text-sm">
            {step === 1 ? 'Join your university community' : `OTP sent to ${formData.email}`}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-100 text-red-600 rounded-xl text-sm font-semibold text-center border border-red-200">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOTP} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-on-surface-variant ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary-500 transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-surface-container-low border border-outline-variant/20 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-surface-lowest transition-all outline-none text-on-surface"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

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
                  placeholder="name@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-on-surface-variant ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary-500 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full pl-11 pr-4 py-3.5 bg-surface-container-low border border-outline-variant/20 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-surface-lowest transition-all outline-none text-on-surface"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-on-surface-variant ml-1">Account Type</label>
              <select
                className="w-full px-4 py-3.5 bg-surface-container-low border border-outline-variant/20 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-surface-lowest transition-all outline-none text-on-surface font-medium appearance-none"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="user">Student User</option>
                <option value="club">University Club</option>
                <option value="admin">Platform Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold mt-8 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Verification OTP'}
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-on-surface-variant ml-1">6-Digit OTP</label>
              <input
                type="text"
                required
                maxLength={6}
                className="w-full px-4 py-4 text-center tracking-[0.5em] text-2xl font-bold bg-surface-container-low border border-outline-variant/20 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-surface-lowest transition-all outline-none text-on-surface"
                placeholder="------"
                value={formData.otpCode}
                onChange={(e) => setFormData({ ...formData, otpCode: e.target.value.replace(/\D/g, '') })}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || formData.otpCode.length !== 6}
              className="w-full flex items-center justify-center gap-2 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold mt-8 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Registration'}
              {!isLoading && <CheckCircle2 className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Wrong email? Go back
            </button>
          </form>
        )}

        {step === 1 && (
          <div className="mt-8 text-center text-sm text-on-surface-variant">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
