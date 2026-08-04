import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faEnvelope, faLock, faUser, faShieldHalved, faPhone } from '@fortawesome/free-solid-svg-icons';
import useAppStore from '../../stores/useAppStore';

export default function LoginModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [step, setStep] = useState('credentials'); // 'credentials' or 'otp'
  const [formData, setFormData] = useState({ 
    name: 'Kavya Bhardwaj', 
    email: 'kb@gmail.com', 
    password: 'hubble123', 
    phone: '', 
    otp: '' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { setUser } = useAppStore();

  const API_URL = 'http://localhost:8000';
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCredentialSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (loginMethod === 'phone') {
        // Twilio Verify Flow
        const res = await fetch(`${BACKEND_URL}/api/auth/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: formData.phone })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to send verification SMS');
        }
        setStep('otp');
      } else {
        // FastAPI Email Flow
        const endpoint = isLogin ? '/login/' : '/signup/';
        const body = isLogin 
          ? { email: formData.email, password: formData.password }
          : { name: formData.name, email: formData.email, password: formData.password };

        const res = await fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.detail || 'Authentication failed');
        }
        setStep('otp');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (loginMethod === 'phone') {
        // Twilio Verify OTP
        const res = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: formData.phone, code: formData.otp })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Invalid or expired OTP');
        }
        setUser(data.user);
        onClose();
      } else {
        // FastAPI Email OTP
        const res = await fetch(`${API_URL}/verify/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, otp: formData.otp })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.detail || 'Invalid OTP');
        }
        setUser({ email: formData.email, name: formData.name || formData.email.split('@')[0] });
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md bg-[#1a1f24] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
            </button>

            <div className="p-8">
              <h2 className="text-2xl font-bold text-white mb-2 font-display">
                {step === 'otp' ? 'Verify Code' : (isLogin ? 'Welcome Back' : 'Create Account')}
              </h2>
              <p className="text-white/60 text-sm mb-6">
                {step === 'otp' 
                  ? `Enter the 6-digit OTP sent to your ${loginMethod === 'phone' ? 'phone number' : 'email'}.` 
                  : 'Sign in to access your saved trips and special offers.'}
              </p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm mb-6">
                  {error}
                </div>
              )}

              {step === 'credentials' && (
                <div className="flex border-b border-white/10 mb-6">
                  <button
                    type="button"
                    onClick={() => { setLoginMethod('email'); setError(null); }}
                    className={`flex-1 pb-3 text-sm font-medium transition-colors ${loginMethod === 'email' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-white/50 hover:text-white/80'}`}
                  >
                    Email Address
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLoginMethod('phone'); setError(null); }}
                    className={`flex-1 pb-3 text-sm font-medium transition-colors ${loginMethod === 'phone' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-white/50 hover:text-white/80'}`}
                  >
                    Phone Number
                  </button>
                </div>
              )}

              {step === 'credentials' ? (
                <form onSubmit={handleCredentialSubmit} className="space-y-4">
                  {!isLogin && (
                    <div>
                      <label className="block text-white/70 text-sm mb-1">Full Name</label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faUser} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                  )}

                  {loginMethod === 'phone' ? (
                    <div>
                      <label className="block text-white/70 text-sm mb-1">Phone Number</label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faPhone} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500"
                          placeholder="+919876543210"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-white/70 text-sm mb-1">Email Address</label>
                        <div className="relative">
                          <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                          <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500"
                            placeholder="you@example.com"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-1">Password</label>
                        <div className="relative">
                          <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                          <input
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-500 text-white font-semibold py-3 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 mt-6"
                  >
                    {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-1">One-Time Password (OTP)</label>
                    <div className="relative">
                      <FontAwesomeIcon icon={faShieldHalved} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="text"
                        name="otp"
                        required
                        value={formData.otp}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500 text-center tracking-widest text-lg"
                        placeholder="123456"
                        maxLength={6}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-500 text-white font-semibold py-3 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 mt-6"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </form>
              )}

              {step === 'credentials' && (
                <div className="mt-6 text-center text-white/50 text-sm">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={() => { setIsLogin(!isLogin); setError(null); }}
                    className="text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
