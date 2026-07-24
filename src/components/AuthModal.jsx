import React, { useState } from 'react';
import { X, Lock, Mail, UserCheck, UserPlus, LogIn, Smartphone, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colleges } from '../constants/categories';
import { toast } from 'sonner';

export default function AuthModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user, login, requestResetCode, resetPassword } = useAuth();

  // Mode: 'signup', 'login', 'forgot'
  const [authMode, setAuthMode] = useState('signup');
  const [forgotStep, setForgotStep] = useState('request'); // 'request', 'reset'
  const [email, setEmail] = useState(''); // Stores email or phone number
  const [password, setPassword] = useState('');
  const [customUsername, setCustomUsername] = useState('');
  const [college, setCollege] = useState(colleges[0]);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [generatedKey, setGeneratedKey] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleQuickAuth = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Email or Phone Number is required');
      return;
    }

    setLoading(true);
    const usernamePayload = authMode === 'signup' ? customUsername : undefined;
    const res = await login(email, college, password, usernamePayload, authMode);
    setLoading(false);

    if (res.success) {
      if (authMode === 'signup' && res.recoveryKey) {
        setGeneratedKey(res.recoveryKey);
        setShowRecoveryModal(true);
      } else {
        toast.success(`Welcome Back Delegate ${res.user.anonymousName}!`);
        onClose();
        if (res.user?.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/feed');
        }
      }
    } else {
      toast.error(res.error || 'Authentication failed');
    }
  };

  const handleForgotRequest = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Email or Phone is required');
      return;
    }

    setLoading(true);
    const res = await requestResetCode(email);
    setLoading(false);

    if (res.success) {
      toast.success(res.message || 'Passcode sent! Check your inbox.');
      setForgotStep('reset');
    } else {
      toast.error(res.error || 'Failed to request reset passcode');
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!email || !resetCode || !newPassword) {
      toast.error('All fields are required');
      return;
    }

    setLoading(true);
    const res = await resetPassword(email, undefined, resetCode, newPassword);
    setLoading(false);

    if (res.success) {
      toast.success(res.message || 'Password reset successful!');
      setAuthMode('login');
      setForgotStep('request');
      setPassword('');
      setResetCode('');
      setNewPassword('');
    } else {
      toast.error(res.error || 'Failed to reset password');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-card border-2 border-bronze rounded-[24px] w-full max-w-md p-7 space-y-6 shadow-[0_0_50px_rgba(154,107,50,0.3)] relative text-left">
          
          {/* Close button */}
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-muted hover:text-primary p-1.5 rounded-full hover:bg-background transition"
          >
            <X size={20} />
          </button>

          {/* Title Header */}
          <div className="space-y-1.5 border-b border-border pb-4">
            <h3 className="text-xl font-black text-primary flex items-center gap-2">
              <span className="text-2xl">🪳</span>
              <span>DELEGATE FLOOR ENTRY</span>
            </h3>
            <p className="text-xs text-secondary/80 font-mono font-bold uppercase tracking-wider">
              Get your anonymous Pass to join the full debates
            </p>
          </div>

          <div className="space-y-4">
            {/* TOGGLE SWITCH */}
            {authMode !== 'forgot' && (
              <div className="grid grid-cols-2 p-1.5 bg-background border border-border rounded-[10px] text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className={`py-2 rounded-[8px] transition-all flex items-center justify-center gap-1.5 ${authMode === 'signup' ? 'bg-bronze text-white shadow-sm font-black' : 'text-secondary hover:text-primary'}`}
                >
                  <UserPlus size={14} />
                  <span>New Delegate</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`py-2 rounded-[8px] transition-all flex items-center justify-center gap-1.5 ${authMode === 'login' ? 'bg-bronze text-white shadow-sm font-black' : 'text-secondary hover:text-primary'}`}
                >
                  <LogIn size={14} />
                  <span>Existing Login</span>
                </button>
              </div>
            )}

            {authMode === 'forgot' ? (
              forgotStep === 'request' ? (
                <form onSubmit={handleForgotRequest} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-secondary mb-1.5 tracking-wider">Email or Phone Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. delegate@college.edu or +919876543210"
                        required
                        className="w-full bg-background border border-border rounded-[10px] p-3 pl-10 text-xs text-primary placeholder-muted focus:outline-none focus:border-bronze transition"
                      />
                      <Smartphone size={14} className="absolute left-3 top-3.5 text-muted" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-background text-primary hover:bg-card font-black py-3 rounded-button transition text-xs flex items-center justify-center gap-2 border border-bronze disabled:opacity-50"
                  >
                    <Mail size={14} />
                    <span>{loading ? 'Sending...' : 'Send Reset Code'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="w-full text-center text-[10px] font-bold text-secondary hover:text-primary mt-1"
                  >
                    ← Back to Login
                  </button>
                </form>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-secondary mb-1.5 tracking-wider">6-Digit Passcode</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        placeholder="123456"
                        required
                        className="w-full bg-background border border-border rounded-[10px] p-3 pl-10 text-xs text-primary placeholder-muted focus:outline-none focus:border-bronze font-mono text-center tracking-widest"
                      />
                      <Lock size={14} className="absolute left-3 top-3.5 text-muted" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-secondary mb-1.5 tracking-wider">New Password</label>
                    <div className="relative">
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-background border border-border rounded-[10px] p-3 pl-10 text-xs text-primary placeholder-muted focus:outline-none focus:border-bronze transition"
                      />
                      <Lock size={14} className="absolute left-3 top-3.5 text-muted" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-background text-primary hover:bg-card font-black py-3 rounded-button transition text-xs flex items-center justify-center gap-2 border border-bronze disabled:opacity-50"
                  >
                    <Lock size={14} />
                    <span>{loading ? 'Resetting...' : 'Reclaim Pass'}</span>
                  </button>
                </form>
              )
            ) : (
              <form onSubmit={handleQuickAuth} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-secondary mb-1.5 tracking-wider">Email or Phone Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="delegate@college.edu or +919876543210"
                      required
                      className="w-full bg-background border border-border rounded-[10px] p-3 pl-10 text-xs text-primary placeholder-muted focus:outline-none focus:border-bronze transition"
                    />
                    <Smartphone size={14} className="absolute left-3 top-3.5 text-muted" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] font-bold uppercase text-secondary tracking-wider">Password</label>
                    {authMode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setAuthMode('forgot')}
                        className="text-[10px] text-bronze hover:underline font-bold"
                      >
                        Forgot Pass?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-background border border-border rounded-[10px] p-3 pl-10 text-xs text-primary placeholder-muted focus:outline-none focus:border-bronze transition"
                    />
                    <Lock size={14} className="absolute left-3 top-3.5 text-muted" />
                  </div>
                </div>

                {authMode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-secondary mb-1.5 tracking-wider">Custom Handle (Optional)</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={customUsername}
                          onChange={(e) => setCustomUsername(e.target.value)}
                          placeholder="Leave blank for auto handle"
                          className="w-full bg-background border border-border rounded-[10px] p-3 pl-10 text-xs text-primary placeholder-muted focus:outline-none focus:border-bronze transition"
                        />
                        <UserCheck size={14} className="absolute left-3 top-3.5 text-muted" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-secondary mb-1.5 tracking-wider">Select College representation</label>
                      <select
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        className="w-full bg-background border border-border rounded-[10px] p-3 text-xs text-primary focus:outline-none focus:border-bronze"
                      >
                        {colleges.map((col) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-background hover:opacity-90 font-black py-3.5 rounded-button transition text-xs flex items-center justify-center gap-2 border border-bronze disabled:opacity-50"
                >
                  <Lock size={14} />
                  <span>{authMode === 'signup' ? 'Create Pass & Enter Floor' : 'Login to Floor'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Secret Recovery Key Modal */}
      {showRecoveryModal && (
        <div className="fixed inset-0 bg-background/85 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-[20px] max-w-sm w-full p-6 space-y-4 shadow-xl text-center">
            <div className="text-center space-y-2">
              <span className="text-3xl">🔑</span>
              <h3 className="font-extrabold text-sm uppercase text-primary tracking-wider font-heading">Secret Recovery Key</h3>
              <p className="text-xs text-muted">
                Save this key immediately! It is the only way to recover your anonymous delegate account if you forget your password.
              </p>
            </div>
            <div className="bg-background border border-border p-3.5 rounded-[12px] text-center font-mono text-bronze font-black tracking-widest text-sm select-all">
              {generatedKey}
            </div>
            <button
              onClick={() => {
                setShowRecoveryModal(false);
                onClose();
                navigate('/feed');
              }}
              className="w-full bg-primary hover:bg-primary/95 text-background text-xs font-black uppercase py-3 rounded-[12px] transition"
            >
              I Have Saved My Key
            </button>
          </div>
        </div>
      )}
    </>
  );
}
