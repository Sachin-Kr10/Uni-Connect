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
    <div className="h-screen w-full flex items-center justify-center bg-cyber-mesh relative overflow-hidden p-4 md:p-8">
      {/* Dynamic Background Glows */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-neon-violet/10 blur-[130px]" />
      </div>

      <div className="glass-2080 w-full max-w-md p-8 md:p-12 rounded-[2.5rem] shadow-futuristic relative group">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 bg-neon-violet/10 text-neon-violet border border-neon-violet/30 rounded-2xl flex items-center justify-center mb-6 shadow-glow-blue rotate-3">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase">
            Reset
          </h2>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">
            {step === 1 ? 'Recall lost neural access' : `Signal sent to: ${formData.email}`}
          </p>
        </div>



        {step === 1 ? (
          <form onSubmit={handleRequestOTP} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Identity Tag (Email)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-neon-violet transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  className="w-full cyber-input !border-neon-violet/20 focus:!border-neon-violet"
                  placeholder="USER@U-NET"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 cyber-button-blue shadow-glow-blue disabled:opacity-50 mt-4"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Request Reset Signal'}
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Signal Key</label>
              <input
                type="text"
                required
                maxLength={6}
                className="w-full cyber-input !pl-0 text-center !tracking-[0.5em] text-xl font-bold"
                placeholder="000000"
                value={formData.otp}
                onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">New Neural Key</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-neon-blue transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full cyber-input"
                  placeholder="********"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || formData.otp.length !== 6}
              className="w-full flex items-center justify-center gap-2 py-4 cyber-button-pink shadow-glow-pink disabled:opacity-50 mt-4"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Override Passcode'}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-[10px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest mt-2"
            >
              Abort recall signal
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
          Recall Identity?{' '}
          <Link to="/login" className="text-neon-blue hover:text-white transition-colors">
            Return to gateway
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
