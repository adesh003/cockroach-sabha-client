import React, { useState } from 'react';
import { X, Lock, Mail, UserCheck, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colleges } from '../constants/categories';
import { toast } from 'sonner';

export default function AuthModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [customUsername, setCustomUsername] = useState('');
  const [college, setCollege] = useState(colleges[0]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Enter an email first! How else will you claim your seat?');
      return;
    }

    setLoading(true);
    const res = await login(email, college, password, customUsername);
    setLoading(false);

    if (res.success) {
      toast.success(`Welcome to the floor, Delegate ${res.user.anonymousName}!`);
      onClose();
      navigate('/feed');
    } else {
      toast.error(res.error || 'Sabha Pass rejected. Try again!');
    }
  };

  const handleSuggestionClick = (sug) => {
    setCustomUsername(sug + ' #' + Math.floor(100 + Math.random() * 900));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#171717] border-2 border-[#9A6B32] rounded-[18px] w-full max-w-md p-6 space-y-5 shadow-[0_0_50px_rgba(154,107,50,0.3)] relative text-left">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-[#292929] pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B0B0B] border border-[#9A6B32] flex items-center justify-center text-xl shadow-inner">
              🪳
            </div>
            <div>
              <h3 className="font-black text-base uppercase tracking-wider text-white">Sabha Pass Required</h3>
              <p className="text-xs text-[#9A6B32] font-mono font-bold">No Pass = No Votes, No Debates!</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#71717A] hover:text-white p-1.5 rounded-full hover:bg-[#292929] transition">
            <X size={20} />
          </button>
        </div>

        {/* HIGH CONTRAST NOTICE BANNER */}
        <div className="bg-[#0B0B0B] border border-[#9A6B32] rounded-[12px] p-4 space-y-1.5 shadow-inner">
          <div className="flex items-center gap-2 text-xs font-black text-[#9A6B32] tracking-wider uppercase">
            <ShieldAlert size={16} />
            <span>DELEGATE NOTICE!</span>
          </div>
          <p className="text-xs text-[#A1A1AA] leading-relaxed italic font-medium">
            "Shouting from the gallery without a Delegate Pass isn't permitted! Sign in or register below to raise motions and support arguments."
          </p>
        </div>

        {/* QUICK AUTH FORM */}
        <form onSubmit={handleAuthSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[10px] font-bold uppercase text-[#A1A1AA] mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="neta@college.edu"
                required
                className="w-full bg-[#0B0B0B] border border-[#292929] rounded-[10px] p-2.5 pl-9 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#9A6B32]"
              />
              <Mail size={14} className="absolute left-3 top-3 text-[#71717A]" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-[#A1A1AA] mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0B0B0B] border border-[#292929] rounded-[10px] p-2.5 pl-9 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#9A6B32]"
              />
              <Lock size={14} className="absolute left-3 top-3 text-[#71717A]" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-[#A1A1AA] mb-1">Custom Handle (Optional)</label>
            <div className="relative">
              <input
                type="text"
                value={customUsername}
                onChange={(e) => setCustomUsername(e.target.value)}
                placeholder="e.g. Backbencher Delegate"
                className="w-full bg-[#0B0B0B] border border-[#292929] rounded-[10px] p-2.5 pl-9 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#9A6B32]"
              />
              <UserCheck size={14} className="absolute left-3 top-3 text-[#71717A]" />
            </div>

            <div className="mt-2 space-y-1">
              <span className="text-[10px] text-[#71717A] font-mono">Quick Handle Chips:</span>
              <div className="flex flex-wrap gap-1.5">
                {['Backbencher', 'Chai Expert', 'UPSC Aspirant', 'Corporate Majdoor'].map((sug) => (
                  <button
                    type="button"
                    key={sug}
                    onClick={() => handleSuggestionClick(sug)}
                    className="text-[10px] bg-[#0B0B0B] border border-[#292929] text-[#9A6B32] px-2 py-0.5 rounded-full hover:border-[#9A6B32] transition font-mono"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#292929]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-[10px] text-xs font-semibold border border-[#292929] text-[#A1A1AA] hover:text-white"
            >
              Just Browsing
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-[10px] text-xs font-black bg-white text-black hover:bg-neutral-200 transition flex items-center gap-2 border border-[#9A6B32]/40"
            >
              <Lock size={13} />
              <span>{loading ? 'Issuing Pass...' : 'Create Pass & Enter'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
