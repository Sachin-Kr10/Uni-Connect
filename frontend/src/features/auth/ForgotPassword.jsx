import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, KeyRound } from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [formData, setFormData] = useState({ email: '', otp: '', newPassword: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Request OTP
  const handleRequestOTP = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Connect to backend to send OTP for reset
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 1500);
  };

  // Step 2: Reset Password with OTP
  const handleResetPassword = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Connect to backend to reset password
    setTimeout(() => {
      setIsLoading(false);
      console.log('Password reset successfully');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 p-4 md:p-12 lg:p-24">
      {/* Premium Background Blobs */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-primary-100/50 blur-[130px]" />
      </div>

      <div className="glass-card bg-white/40 w-full max-w-[95%] sm:max-w-md p-8 sm:p-12 rounded-[2rem] shadow-2xl relative">
        <div className="text-center mb-10">
          <div className="mx-auto w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm rotate-3">
            <KeyRound className="w-8 h-8" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
            Reset
          </h2>
          <p className="text-slate-500 font-semibold text-sm">
            {step === 1 ? 'Recover your campus account' : `Code sent to ${formData.email}`}
          </p>
        </div>


        {step === 1 ? (
          <form onSubmit={handleRequestOTP} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">University Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-white transition-all outline-none"
                  placeholder="you@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold mt-8 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Code'}
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Reset OTP Code</label>
              <input
                type="text"
                required
                maxLength={6}
                className="w-full px-4 py-3.5 text-center tracking-[0.5em] text-xl font-bold bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-white transition-all outline-none"
                placeholder="------"
                value={formData.otp}
                onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">New Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-white transition-all outline-none"
                  placeholder="••••••••"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || formData.otp.length !== 6}
              className="w-full flex items-center justify-center gap-2 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold mt-8 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
            >
              Wrong email? Go back
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-sm text-slate-500">
          Remember your password?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
