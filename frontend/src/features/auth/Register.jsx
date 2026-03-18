import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

const Register = () => {
  const [step, setStep] = useState(1); // 1: Details, 2: OTP Verification
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user', otp: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Submit details to get OTP
  const handleRequestOTP = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Connect to backend to send OTP
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 1500);
  };

  // Step 2: Verify OTP and finalize registration
  const handleVerifyOTP = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Connect to backend to verify OTP and register
    setTimeout(() => {
      setIsLoading(false);
      console.log('Registered successfully:', formData);
    }, 1500);
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-cyber-mesh relative overflow-hidden p-4 md:p-8">
      {/* Dynamic Background Glows */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-neon-pink/10 blur-[130px]" />
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-neon-blue/10 blur-[130px]" />
      </div>

      <div className="glass-2080 w-full max-w-md p-8 md:p-10 rounded-[2.5rem] shadow-futuristic relative scale-95 md:scale-100">
        <div className="text-center mb-8">
          <div className="inline-block px-3 py-1 mb-4 border border-neon-pink/30 bg-neon-pink/10 text-neon-pink rounded-full text-[10px] uppercase tracking-[0.3em] font-black">
            Neural Registration
          </div>
          <h2 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase leading-none">
            {step === 1 ? 'Join' : 'Verify'}
          </h2>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">
            {step === 1 ? 'Enroll in the academic grid' : `Code sent to node: ${formData.email}`}
          </p>
        </div>



        {step === 1 ? (
          <form onSubmit={handleRequestOTP} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Identity Tag</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-neon-blue transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  className="w-full cyber-input"
                  placeholder="NOMINAL_ID"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Grid Uplink (Email)</label>
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

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Neural Key (Password)</label>
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Node Class</label>
              <select
                className="w-full cyber-input !pl-4 focus:border-neon-pink transition-all appearance-none cursor-pointer"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="user" className="bg-slate-900">STUDENT_UNIT</option>
                <option value="club" className="bg-slate-900">CLUB_COLLECTIVE</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 cyber-button-pink mt-4 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Request Uplink'}
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Verify Code</label>
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

            <button
              type="submit"
              disabled={isLoading || formData.otp.length !== 6}
              className="w-full flex items-center justify-center gap-2 py-4 cyber-button-blue disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Connection'}
              {!isLoading && <CheckCircle2 className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-[10px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest"
            >
              Abort node creation
            </button>
          </form>
        )}

        {step === 1 && (
          <div className="mt-6 text-center text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
            Node active?{' '}
            <Link to="/login" className="text-neon-blue hover:text-white transition-colors">
              Access Mainframe
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default Register;
