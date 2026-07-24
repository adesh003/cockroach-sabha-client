import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Building, UserCheck, UserPlus, LogIn } from 'lucide-react';
import { colleges } from '../constants/categories';
import { toast } from 'sonner';

export default function AuthPage() {
  const [authMode, setAuthMode] = useState('signup'); // 'signup', 'login', 'forgot'
  const [forgotStep, setForgotStep] = useState('request'); // 'request', 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [customUsername, setCustomUsername] = useState('');
  const [college, setCollege] = useState(colleges[0]);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [generatedKey, setGeneratedKey] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, requestResetCode, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Email is required');
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
        navigate('/feed');
      }
    } else {
      toast.error(res.error || 'Authentication failed');
    }
  };

  const handleForgotRequest = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Email is required');
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

  const usernameSuggestions = [
    'Professional Backbencher MP', 'Senior Chai Stall Analyst',
    'Unemployed UPSC Veteran', '3 AM Political Overthinker',
    'WhatsApp University Alumni', 'Permanent Opposition Leader'
  ];

  return (
    <div className="p-4 py-12 space-y-6 max-w-md mx-auto text-left">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-card border-2 border-bronze text-primary font-black flex items-center justify-center text-3xl mx-auto shadow-[0_0_30px_rgba(154,107,50,0.3)]">
          🪳
        </div>
        <h1 className="text-2xl font-black text-primary uppercase tracking-wider">
          {authMode === 'signup' ? 'Register New Delegate' : authMode === 'login' ? 'Existing Delegate Login' : 'Recover Delegate Pass'}
        </h1>
        <p className="text-xs text-muted">
          {authMode === 'signup'
            ? 'Enter Cockroach Sabha. Your real identity is never exposed.'
            : authMode === 'login'
            ? 'Access your active Delegate Pass & Motions on the Sabha Floor.'
            : 'Reset your secret credentials using your email passcode.'}
        </p>
      </div>

      <div className="bg-card border-2 border-bronze rounded-[18px] p-6 space-y-4 shadow-[0_0_40px_rgba(154,107,50,0.25)]">
        
        {/* TOGGLE SWITCH BETWEEN NEW DELEGATE & EXISTING LOGIN */}
        {authMode !== 'forgot' ? (
          <div className="grid grid-cols-2 p-1 bg-background border border-border rounded-[10px] text-xs font-bold">
            <button
              type="button"
              onClick={() => setAuthMode('signup')}
              className={`py-2 rounded-[8px] transition flex items-center justify-center gap-1.5 ${
                authMode === 'signup'
                  ? 'bg-bronze text-white shadow-sm font-black'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <UserPlus size={14} />
              <span>New Delegate</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`py-2 rounded-[8px] transition flex items-center justify-center gap-1.5 ${
                authMode === 'login'
                  ? 'bg-bronze text-white shadow-sm font-black'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <LogIn size={14} />
              <span>Existing Login</span>
            </button>
          </div>
        ) : (
          <div className="p-2.5 bg-background border border-border rounded-[10px] text-center text-xs font-black text-bronze uppercase font-mono tracking-wider">
            🔑 Pass Recovery Chamber
          </div>
        )}

        {authMode === 'forgot' ? (
          forgotStep === 'request' ? (
            <form onSubmit={handleForgotRequest} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-secondary mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="delegate@parliament.in"
                    required
                    className="w-full bg-background border border-border rounded-[10px] p-2.5 pl-9 text-xs text-primary placeholder-muted focus:outline-none focus:border-bronze"
                  />
                  <Mail size={14} className="absolute left-3 top-3 text-muted" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-background font-extrabold py-3 px-4 rounded-[10px] transition text-xs flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 border border-bronze"
              >
                <Mail size={14} />
                <span>{loading ? 'Sending Passcode...' : 'Send Reset Passcode'}</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="w-full text-center text-[11px] font-bold text-secondary hover:text-primary mt-2"
              >
                ← Back to Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-secondary mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full bg-background/50 border border-border rounded-[10px] p-2.5 pl-9 text-xs text-secondary cursor-not-allowed focus:outline-none"
                  />
                  <Mail size={14} className="absolute left-3 top-3 text-muted" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-secondary mb-1">6-Digit Passcode</label>
                <div className="relative">
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="e.g. 123456"
                    required
                    className="w-full bg-background border border-border rounded-[10px] p-2.5 pl-9 text-xs text-primary placeholder-muted focus:outline-none focus:border-bronze font-mono tracking-widest text-center"
                  />
                  <Lock size={14} className="absolute left-3 top-3 text-muted" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-secondary mb-1">New Password</label>
                <div className="relative">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-background border border-border rounded-[10px] p-2.5 pl-9 text-xs text-primary placeholder-muted focus:outline-none focus:border-bronze"
                  />
                  <Lock size={14} className="absolute left-3 top-3 text-muted" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-background font-extrabold py-3 px-4 rounded-[10px] transition text-xs flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 border border-bronze"
              >
                <Lock size={14} />
                <span>{loading ? 'Resetting Password...' : 'Reset & Reclaim Pass'}</span>
              </button>

              <button
                type="button"
                onClick={() => setForgotStep('request')}
                className="w-full text-center text-[11px] font-bold text-secondary hover:text-primary mt-2"
              >
                ← Back / Resend Code
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-secondary mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="delegate@parliament.in"
                  required
                  className="w-full bg-background border border-border rounded-[10px] p-2.5 pl-9 text-xs text-primary placeholder-muted focus:outline-none focus:border-bronze"
                />
                <Mail size={14} className="absolute left-3 top-3 text-muted" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[11px] font-semibold uppercase text-secondary">Password</label>
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
                  className="w-full bg-background border border-border rounded-[10px] p-2.5 pl-9 text-xs text-primary placeholder-muted focus:outline-none focus:border-bronze"
                />
                <Lock size={14} className="absolute left-3 top-3 text-muted" />
              </div>
            </div>

            {/* CUSTOM HANDLE FIELD & SUGGESTIONS ONLY VISIBLE IN SIGNUP MODE */}
            {authMode === 'signup' && (
              <div>
                <label className="block text-[11px] font-semibold uppercase text-secondary mb-1">
                  Custom Delegate Handle (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customUsername}
                    onChange={(e) => setCustomUsername(e.target.value)}
                    placeholder="e.g. Backbench MP #402"
                    className="w-full bg-background border border-border rounded-[10px] p-2.5 pl-9 text-xs text-primary placeholder-muted focus:outline-none focus:border-bronze"
                  />
                  <UserCheck size={14} className="absolute left-3 top-3 text-muted" />
                </div>

                {/* USERNAME SUGGESTIONS */}
                <div className="mt-2 space-y-1">
                  <p className="text-[10px] text-muted font-mono">Suggested Delegate Titles:</p>
                  <div className="flex flex-wrap gap-1">
                    {usernameSuggestions.slice(0, 4).map((sug) => (
                      <button
                        type="button"
                        key={sug}
                        onClick={() => setCustomUsername(sug + ' #' + Math.floor(100 + Math.random() * 900))}
                        className="text-[10px] bg-background border border-border text-bronze px-2 py-0.5 rounded-full hover:border-bronze transition"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold uppercase text-secondary mb-1">Parliament Bench</label>
              <div className="relative">
                <select
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full bg-background border border-border rounded-[10px] p-2.5 pl-9 text-xs text-primary focus:outline-none focus:border-bronze"
                >
                  {colleges.map((c) => (
                    <option key={c} value={c} className="bg-card text-primary">{c}</option>
                  ))}
                </select>
                <Building size={14} className="absolute left-3 top-3 text-muted" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-background font-extrabold py-3 px-4 rounded-[10px] transition text-xs flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 border border-bronze"
            >
              <Lock size={14} />
              <span>
                {loading
                  ? 'Authenticating...'
                  : authMode === 'signup'
                  ? 'Register & Enter Sabha Floor'
                  : 'Login to Sabha Floor'}
              </span>
            </button>
          </form>
        )}
      </div>

      {/* Secret Recovery Key Modal */}
      {showRecoveryModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-[20px] max-w-sm w-full p-6 space-y-4 shadow-xl text-center">
            <div className="text-center space-y-2">
              <span className="text-3xl">🔑</span>
              <h3 className="font-extrabold text-sm uppercase text-primary tracking-wider">Secret Recovery Key</h3>
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
                navigate('/feed');
              }}
              className="w-full bg-primary hover:bg-primary/95 text-background text-xs font-black uppercase py-3 rounded-[12px] transition"
            >
              I Have Saved My Key
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
