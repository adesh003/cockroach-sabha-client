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
      <div className="bg-card border-2 border-bronze rounded-[18px] w-full max-w-md p-6 space-y-5 shadow-[0_0_50px_rgba(154,107,50,0.3)] relative text-left">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-border pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-background border border-bronze flex items-center justify-center text-xl shadow-inner">
              🪳
            </div>
            <div>
              <h3 className="font-black text-base uppercase tracking-wider text-primary">Sabha Pass Required</h3>
              <p className="text-xs text-bronze font-mono font-bold">No Pass = No Votes, No Debates!</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted hover:text-primary p-1.5 rounded-full hover:bg-background transition">
            <X size={20} />
          </button>
        </div>

        {/* HIGH CONTRAST NOTICE BANNER */}
        <div className="bg-background border border-bronze rounded-[12px] p-4 space-y-1.5 shadow-inner">
          <div className="flex items-center gap-2 text-xs font-black text-bronze tracking-wider uppercase">
            <ShieldAlert size={16} />
            <span>DELEGATE NOTICE!</span>
          </div>
          <p className="text-xs text-secondary leading-relaxed italic font-medium">
            "Shouting from the gallery without a Delegate Pass isn't permitted! Sign in or register below to raise motions and support arguments."
          </p>
        </div>

        {/* QUICK AUTH FORM */}
        <form onSubmit={handleAuthSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[10px] font-bold uppercase text-secondary mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="neta@college.edu"
                required
                className="w-full bg-background border border-border rounded-[10px] p-2.5 pl-9 text-xs text-primary placeholder-muted focus:outline-none focus:border-bronze"
              />
              <Mail size={14} className="absolute left-3 top-3 text-muted" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-secondary mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-background border border-border rounded-[10px] p-2.5 pl-9 text-xs text-primary placeholder-muted focus:outline-none focus:border-bronze"
              />
              <Lock size={14} className="absolute left-3 top-3 text-muted" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-secondary mb-1">Custom Handle (Optional)</label>
            <div className="relative">
              <input
                type="text"
                value={customUsername}
                onChange={(e) => setCustomUsername(e.target.value)}
                placeholder="e.g. Backbencher Delegate"
                className="w-full bg-background border border-border rounded-[10px] p-2.5 pl-9 text-xs text-primary placeholder-muted focus:outline-none focus:border-bronze"
              />
              <UserCheck size={14} className="absolute left-3 top-3 text-muted" />
            </div>

            <div className="mt-2 space-y-1">
              <span className="text-[10px] text-muted font-mono">Quick Handle Chips:</span>
              <div className="flex flex-wrap gap-1.5">
                {['Backbencher', 'Chai Expert', 'UPSC Aspirant', 'Corporate Majdoor'].map((sug) => (
                  <button
                    type="button"
                    key={sug}
                    onClick={() => handleSuggestionClick(sug)}
                    className="text-[10px] bg-background border border-border text-bronze px-2 py-0.5 rounded-full hover:border-bronze transition font-mono"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-[10px] text-xs font-semibold border border-border text-secondary hover:text-primary hover:bg-background transition"
            >
              Just Browsing
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-[10px] text-xs font-black bg-primary text-background hover:opacity-90 transition flex items-center gap-2 border border-bronze/40"
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
