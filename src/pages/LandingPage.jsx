import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, UserCheck, UserPlus, LogIn, Compass, Flame, Share2 } from 'lucide-react';
import { colleges } from '../constants/categories';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'sonner';

export default function LandingPage({ onOpenGazetteStudio }) {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const { theme } = useTheme();

  // Mode Toggle: 'signup' or 'login'
  const [authMode, setAuthMode] = useState('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [customUsername, setCustomUsername] = useState('');
  const [college, setCollege] = useState(colleges[0]);
  const [loading, setLoading] = useState(false);

  const handleQuickAuth = async (e) => {
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
      toast.success(authMode === 'signup' ? `New Delegate Registered! Welcome ${res.user.anonymousName}!` : `Welcome Back Delegate ${res.user.anonymousName}!`);
      navigate('/feed');
    } else {
      toast.error(res.error || 'Authentication failed');
    }
  };

  const gradientOverlay = theme === 'light'
    ? 'linear-gradient(to bottom, rgba(251, 251, 249, 0.9), rgba(251, 251, 249, 0.95))'
    : 'linear-gradient(to bottom, rgba(11, 11, 11, 0.85), rgba(11, 11, 11, 0.95))';

  return (
    <div
      className="min-h-[calc(100vh-4rem)] flex flex-col justify-between py-12 px-6 max-w-6xl mx-auto space-y-16 relative bg-cover bg-center bg-no-repeat rounded-[24px] transition-all duration-200"
      style={{
        backgroundImage: `${gradientOverlay}, url('/landing_bg.png')`
      }}
    >

      {/* CENTRAL HERO SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center my-auto">

        {/* LEFT COLUMN: TITLE, TAGLINE & ENLARGED SANSAD ARTWORK */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card border border-bronze/40 text-xs text-bronze font-mono font-bold">
            <span>🪳 Underground Parliament of the Unfiltered</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-primary uppercase leading-none">
            COCKROACH SABHA
          </h1>

          <p className="text-2xl sm:text-3xl text-bronze font-black italic tracking-wide">
            "Survive. Speak. Repeat."
          </p>

          <p className="text-sm sm:text-base text-secondary max-w-xl leading-relaxed">
            Where every citizen & youth voice crawls beneath the political surface. Unfiltered rants on Lok Sabha debates, UPSC realities, taxes, Chai Pe Charcha, and Indian democracy. No followers. No clout chasing.
          </p>

          {/* HOMEPAGE VIRAL GAZETTE FEATURE BANNER WITH AUTH REQUIREMENT */}
          <div className="p-4 bg-card/90 border-2 border-bronze rounded-[16px] space-y-2.5 shadow-[0_0_30px_rgba(154,107,50,0.25)] max-w-xl text-left backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black uppercase text-bronze flex items-center gap-1.5">
                <Flame size={14} className="animate-bounce" />
                <span>VIRAL FEATURE</span>
              </span>
              <span className="text-[9px] bg-primary text-background font-black px-2 py-0.5 rounded uppercase tracking-wider">NEW</span>
            </div>

            <p className="text-xs font-bold text-primary leading-snug">
              Generate official Parliamentary Gazette Posters for X, Insta & WhatsApp petitions!
            </p>

            <button
              type="button"
              onClick={() => {
                if (!user) {
                  toast.error("Delegate Pass Required! Sign in or register to access Gazette Studio! 🪳");
                } else {
                  if (onOpenGazetteStudio) onOpenGazetteStudio();
                }
              }}
              className="w-full bg-bronze hover:bg-[#b07d3d] text-white font-black py-2.5 px-4 rounded-[10px] text-xs transition flex items-center justify-center gap-2 shadow-lg border border-bronze hover:scale-[1.01]"
            >
              <Share2 size={15} />
              <span>📜 Launch Gazette Studio (Auth Required)</span>
            </button>
          </div>

          {/* PURE VECTOR SVG LINE-ART SKETCH OF SANSAD BHAVAN (NO IMAGE TAG) */}
          <div className="pt-2 w-full max-w-xl flex justify-center">
            <svg
              viewBox="0 0 800 500"
              className="w-full h-auto max-h-72 filter drop-shadow-[0_0_20px_rgba(154,107,50,0.35)] opacity-95 hover:opacity-100 transition-all duration-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* SANSAD MAIN OUTER OCTAGONAL BASE */}
              <polygon points="400,100 680,180 720,380 400,450 80,380 120,180" className="text-primary" strokeWidth="2.5" />
              <polygon points="400,120 650,190 680,360 400,430 120,360 150,190" className="text-bronze" strokeWidth="1.5" />

              {/* ROOF BEAMS & STRUCTURE LINES */}
              <line x1="400" y1="120" x2="400" y2="250" className="text-primary" strokeWidth="2" />
              <line x1="150" y1="190" x2="400" y2="250" className="text-bronze" />
              <line x1="650" y1="190" x2="400" y2="250" className="text-bronze" />
              <line x1="120" y1="360" x2="400" y2="250" className="text-bronze" />
              <line x1="680" y1="360" x2="400" y2="250" className="text-bronze" />

              {/* COLUMNA FACADE & PARLIAMENT DOORS */}
              <rect x="300" y="270" width="200" height="110" rx="4" className="text-primary" strokeWidth="2" />
              <line x1="330" y1="270" x2="330" y2="380" className="text-primary" strokeWidth="2" />
              <line x1="360" y1="270" x2="360" y2="380" className="text-primary" strokeWidth="2" />
              <line x1="390" y1="270" x2="390" y2="380" className="text-primary" strokeWidth="2" />
              <line x1="410" y1="270" x2="410" y2="380" className="text-primary" strokeWidth="2" />
              <line x1="440" y1="270" x2="440" y2="380" className="text-primary" strokeWidth="2" />
              <line x1="470" y1="270" x2="470" y2="380" className="text-primary" strokeWidth="2" />

              {/* SANSAD DOME & EMBLEM */}
              <path d="M 330 180 Q 400 110 470 180 Z" className="text-primary" strokeWidth="2.5" fill="var(--color-card)" fillOpacity="0.8" />
              <circle cx="400" cy="130" r="16" className="text-bronze" strokeWidth="2" fill="var(--color-background)" />

              {/* COCKROACH SILHOUETTE STAMP ON DOME */}
              <text x="391" y="136" fontSize="16" fill="var(--color-primary)">🪳</text>

              {/* TREES & PERIMETER PATHWAYS */}
              <path d="M 60 390 Q 200 470 400 470 Q 600 470 740 390" className="text-bronze" strokeDasharray="4 4" />
              <circle cx="100" cy="370" r="8" className="text-muted" />
              <circle cx="700" cy="370" r="8" className="text-muted" />
              <circle cx="140" cy="400" r="10" className="text-muted" />
              <circle cx="660" cy="400" r="10" className="text-muted" />
            </svg>
          </div>
        </div>

        {/* RIGHT COLUMN: HIGH CONTRAST FORM WITH SIGNUP / LOGIN TOGGLE & EXPLORE SABHA FLOOR BUTTON */}
        <div className="lg:col-span-5 bg-card border-2 border-bronze rounded-[18px] p-6 space-y-5 shadow-[0_0_40px_rgba(154,107,50,0.25)] relative text-left">
          {user ? (
            <div className="space-y-5 text-center py-8">
              <div className="w-20 h-20 rounded-full bg-background border-2 border-bronze flex items-center justify-center mx-auto text-3xl shadow-[0_0_30px_rgba(154,107,50,0.3)]">
                🪳
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-primary">{user.anonymousName}</h3>
                <p className="text-xs text-bronze font-mono font-bold">Delegate Session Active</p>
              </div>
              <button
                onClick={() => navigate('/feed')}
                className="w-full bg-primary text-background font-black py-3.5 px-4 rounded-[10px] transition text-xs flex items-center justify-center gap-2 shadow-lg border border-bronze"
              >
                <span>Proceed to Sabha Floor</span>
                <ArrowRight size={15} />
              </button>
            </div>
          ) : (
            <div className="space-y-4">

              {/* EXPLORE SABHA FLOOR DIRECT ACTION BUTTON ON RIGHT CARD */}
              <button
                onClick={() => navigate('/feed')}
                className="w-full bg-primary text-background font-black py-3 px-4 rounded-[10px] transition text-xs flex items-center justify-center gap-2 shadow-xl border-2 border-bronze hover:scale-[1.02]"
              >
                <Compass size={16} className="text-bronze" />
                <span>Explore Sabha Floor Directly →</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-border"></div>
                <span className="flex-shrink mx-3 text-[10px] font-mono text-muted uppercase font-bold">OR REGISTER DELEGATE</span>
                <div className="flex-grow border-t border-border"></div>
              </div>

              {/* TOGGLE SWITCH FOR SIGNUP vs LOGIN */}
              <div className="grid grid-cols-2 p-1 bg-background border border-border rounded-[10px] text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className={`py-2 rounded-[8px] transition flex items-center justify-center gap-1.5 ${authMode === 'signup'
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
                  className={`py-2 rounded-[8px] transition flex items-center justify-center gap-1.5 ${authMode === 'login'
                      ? 'bg-bronze text-white shadow-sm font-black'
                      : 'text-secondary hover:text-primary'
                    }`}
                >
                  <LogIn size={14} />
                  <span>Existing Login</span>
                </button>
              </div>

              <form onSubmit={handleQuickAuth} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-secondary mb-1">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="delegate@college.edu"
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
                      required
                      className="w-full bg-background border border-border rounded-[10px] p-2.5 pl-9 text-xs text-primary placeholder-muted focus:outline-none focus:border-bronze"
                    />
                    <Lock size={14} className="absolute left-3 top-3 text-muted" />
                  </div>
                </div>

                {/* CUSTOM HANDLE FILED ONLY VISIBLE IN SIGNUP MODE */}
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-secondary mb-1">
                      Custom Cockroach Handle (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={customUsername}
                        onChange={(e) => setCustomUsername(e.target.value)}
                        placeholder="Leave blank for auto Cockroach handle"
                        className="w-full bg-background border border-border rounded-[10px] p-2.5 pl-9 text-xs text-primary placeholder-muted focus:outline-none focus:border-bronze"
                      />
                      <UserCheck size={14} className="absolute left-3 top-3 text-muted" />
                    </div>
                    <p className="text-[10px] text-muted font-mono mt-1">
                      *If left blank, an anonymous handle (e.g. Backbencher #402) is automatically assigned based on your email.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-background text-primary hover:bg-card font-black py-3 px-4 rounded-[10px] transition text-xs flex items-center justify-center gap-2 disabled:opacity-50 border border-bronze shadow-md mt-2"
                >
                  <Lock size={14} />
                  <span>
                    {loading
                      ? 'Authenticating...'
                      : authMode === 'signup'
                        ? 'Register & Enter Floor'
                        : 'Login to Sabha Floor'}
                  </span>
                </button>
              </form>
            </div>
          )}
        </div>

      </div>

      {/* MINIMAL FOOTER BAR */}
      <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted gap-4">
        <p>© 2026 Cockroach Sabha. Underground Democracy for Students & Youth.</p>
        <div className="flex items-center gap-6 font-mono text-[11px]">
          <span>100% Anonymous</span>
          <span>Zero Clout</span>
          <span>Unfiltered</span>
        </div>
      </div>

    </div>
  );
}
