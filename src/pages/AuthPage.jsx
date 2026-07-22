import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Building, UserCheck, UserPlus, LogIn } from 'lucide-react';
import { colleges } from '../constants/categories';
import { toast } from 'sonner';

export default function AuthPage() {
  const [authMode, setAuthMode] = useState('signup'); // 'signup' or 'login'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [customUsername, setCustomUsername] = useState('');
  const [college, setCollege] = useState(colleges[0]);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Email is required');
      return;
    }

    setLoading(true);
    const usernamePayload = authMode === 'signup' ? customUsername : undefined;
    const res = await login(email, college, password, usernamePayload);
    setLoading(false);

    if (res.success) {
      toast.success(
        authMode === 'signup'
          ? `New Delegate Registered! Welcome ${res.user.anonymousName}!`
          : `Welcome Back Delegate ${res.user.anonymousName}!`
      );
      navigate('/feed');
    } else {
      toast.error(res.error || 'Authentication failed');
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
        <div className="w-14 h-14 rounded-2xl bg-[#171717] border-2 border-[#9A6B32] text-white font-black flex items-center justify-center text-3xl mx-auto shadow-[0_0_30px_rgba(154,107,50,0.3)]">
          🪳
        </div>
        <h1 className="text-2xl font-black text-white uppercase tracking-wider">
          {authMode === 'signup' ? 'Register New Delegate' : 'Existing Delegate Login'}
        </h1>
        <p className="text-xs text-[#71717A]">
          {authMode === 'signup'
            ? 'Enter Cockroach Sabha. Your real identity is never exposed.'
            : 'Access your active Delegate Pass & Motions on the Sabha Floor.'}
        </p>
      </div>

      <div className="bg-[#171717] border-2 border-[#9A6B32] rounded-[18px] p-6 space-y-4 shadow-[0_0_40px_rgba(154,107,50,0.25)]">
        
        {/* TOGGLE SWITCH BETWEEN NEW DELEGATE & EXISTING LOGIN */}
        <div className="grid grid-cols-2 p-1 bg-[#0B0B0B] border border-[#292929] rounded-[10px] text-xs font-bold">
          <button
            type="button"
            onClick={() => setAuthMode('signup')}
            className={`py-2 rounded-[8px] transition flex items-center justify-center gap-1.5 ${
              authMode === 'signup'
                ? 'bg-[#9A6B32] text-white shadow-sm font-black'
                : 'text-[#A1A1AA] hover:text-white'
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
                ? 'bg-[#9A6B32] text-white shadow-sm font-black'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <LogIn size={14} />
            <span>Existing Login</span>
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase text-[#A1A1AA] mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="delegate@parliament.in"
                required
                className="w-full bg-[#0B0B0B] border border-[#292929] rounded-[10px] p-2.5 pl-9 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#9A6B32]"
              />
              <Mail size={14} className="absolute left-3 top-3 text-[#71717A]" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-[#A1A1AA] mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#0B0B0B] border border-[#292929] rounded-[10px] p-2.5 pl-9 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#9A6B32]"
              />
              <Lock size={14} className="absolute left-3 top-3 text-[#71717A]" />
            </div>
          </div>

          {/* CUSTOM HANDLE FILED & SUGGESTIONS ONLY VISIBLE IN SIGNUP MODE */}
          {authMode === 'signup' && (
            <div>
              <label className="block text-[11px] font-semibold uppercase text-[#A1A1AA] mb-1">
                Custom Delegate Handle (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={customUsername}
                  onChange={(e) => setCustomUsername(e.target.value)}
                  placeholder="e.g. Backbench MP #402"
                  className="w-full bg-[#0B0B0B] border border-[#292929] rounded-[10px] p-2.5 pl-9 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#9A6B32]"
                />
                <UserCheck size={14} className="absolute left-3 top-3 text-[#71717A]" />
              </div>

              {/* USERNAME SUGGESTIONS */}
              <div className="mt-2 space-y-1">
                <p className="text-[10px] text-[#71717A] font-mono">Suggested Delegate Titles:</p>
                <div className="flex flex-wrap gap-1">
                  {usernameSuggestions.slice(0, 4).map((sug) => (
                    <button
                      type="button"
                      key={sug}
                      onClick={() => setCustomUsername(sug + ' #' + Math.floor(100 + Math.random() * 900))}
                      className="text-[10px] bg-[#0B0B0B] border border-[#292929] text-[#9A6B32] px-2 py-0.5 rounded-full hover:border-[#9A6B32] transition"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold uppercase text-[#A1A1AA] mb-1">Parliament Bench</label>
            <div className="relative">
              <select
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full bg-[#0B0B0B] border border-[#292929] rounded-[10px] p-2.5 pl-9 text-xs text-white focus:outline-none focus:border-[#9A6B32]"
              >
                {colleges.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <Building size={14} className="absolute left-3 top-3 text-[#71717A]" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-extrabold py-3 px-4 rounded-[10px] transition text-xs flex items-center justify-center gap-2 hover:bg-neutral-200 disabled:opacity-50 border border-[#9A6B32]"
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
      </div>
    </div>
  );
}
