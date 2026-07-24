import React, { useState } from 'react';
import { useLocation, NavLink, useNavigate } from 'react-router-dom';
import { Building2, ShieldAlert, PlusCircle, LogIn, LogOut, Flame, ScrollText, User, Sparkles, FileText, CheckCircle, TrendingUp, Users, Share2, Award, Lock } from 'lucide-react';
import { categories } from '../constants/categories';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import CreateGazetteModal from '../components/CreateGazetteModal';
import AuthModal from '../components/AuthModal';

export default function Layout({ children, onOpenCreatePost, selectedCategory, onSelectCategory }) {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isGazetteStudioOpen, setIsGazetteStudioOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const isFeedPage = location.pathname === '/feed' || location.pathname.startsWith('/posts/') || location.pathname === '/profile' || location.pathname === '/admin';

  return (
    <div className="min-h-screen bg-background text-primary flex justify-center selection:bg-[#9A6B32] selection:text-white transition-colors duration-200">
      
      {/* IF ON APP PAGES: FULL 3-COLUMN LUXURY PARLIAMENT LAYOUT */}
      {isFeedPage ? (
        <div className="w-full max-w-[1280px] grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-0 md:gap-6 min-h-screen">
          
          {/* DESKTOP LEFT SIDEBAR */}
          <aside className="hidden md:flex md:col-span-1 lg:col-span-3 flex-col justify-between py-6 px-4 border-r border-border sticky top-0 h-screen overflow-y-auto">
            <div className="space-y-6 text-left">
              {/* BRAND LOGO & THEME SWITCHER */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                  <div className="w-11 h-11 rounded-2xl bg-card border-2 border-bronze text-bronze font-black flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(154,107,50,0.25)] group-hover:scale-105 transition-transform duration-200">
                    🪳
                  </div>
                  <div>
                    <span className="font-black text-lg tracking-tight text-primary block leading-none" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      COCKROACH SABHA
                    </span>
                    <span className="text-[10px] text-bronze font-mono tracking-widest uppercase mt-1 block font-bold">
                      Underground Parliament
                    </span>
                  </div>
                </div>
              </div>

              {/* MAIN NAVIGATION BUTTONS */}
              <nav className="space-y-1.5">
                <button
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory('All');
                    navigate('/feed');
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[12px] text-xs font-bold transition-all duration-200 ${
                    location.pathname === '/feed' && selectedCategory === 'All'
                      ? 'bg-card text-primary border-2 border-bronze shadow-[0_0_15px_rgba(154,107,50,0.2)]'
                      : 'text-secondary hover:text-primary hover:bg-card/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 size={16} className="text-bronze" />
                    <span>Sabha Floor (All)</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-bronze"></span>
                </button>

                {isAdmin && (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `w-full flex items-center justify-between px-3.5 py-2.5 rounded-[12px] text-xs font-bold transition-all duration-200 ${
                        isActive
                          ? 'bg-red-500/10 text-red-400 border-2 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                          : 'text-secondary hover:text-primary hover:bg-card/80 border border-transparent'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldAlert size={16} className="text-red-400" />
                      <span>Speaker's Office</span>
                    </div>
                    <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-mono">ADMIN</span>
                  </NavLink>
                )}
              </nav>

              {/* VIRAL GAZETTE STUDIO SELLING POINT BUTTON */}
              <div className="p-3 bg-card border-2 border-bronze rounded-[14px] space-y-2 shadow-[0_0_20px_rgba(154,107,50,0.2)]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-black uppercase text-bronze flex items-center gap-1">
                    <Flame size={12} />
                    <span>VIRAL FEATURE</span>
                  </span>
                  <span className="text-[9px] bg-primary text-background font-extrabold px-1.5 py-0.5 rounded">NEW</span>
                </div>

                <p className="text-[11px] text-secondary leading-snug">
                  Generate official Parliamentary Gazette Posters for X, Insta & WhatsApp petitions!
                </p>

                <button
                  onClick={() => {
                    if (!user) {
                      toast.error("Trying to issue an official Gazette without a Delegate Pass? Register or login first! 📜");
                      navigate('/auth');
                      return;
                    }
                    setIsGazetteStudioOpen(true);
                  }}
                  className="w-full bg-bronze hover:bg-[#b07d3d] text-white font-black py-2 px-3 rounded-[10px] text-xs transition flex items-center justify-center gap-1.5 shadow-md border border-bronze"
                >
                  <Share2 size={14} />
                  <span>📜 Create Gazette Poster</span>
                </button>
              </div>

              {/* COMMITTEES SECTION */}
              <div className="space-y-2 border-t border-border pt-4">
                <div className="flex items-center justify-between px-2">
                  <p className="text-[11px] font-mono font-black uppercase tracking-wider text-bronze">
                    📜 Committees
                  </p>
                  <span className="text-[10px] text-muted font-mono">{categories.length}</span>
                </div>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        if (onSelectCategory) onSelectCategory(cat);
                        navigate('/feed');
                      }}
                      className={`w-full text-left px-3 py-2 rounded-[9px] text-xs font-semibold transition-all flex items-center justify-between ${
                        selectedCategory === cat && location.pathname === '/feed'
                          ? 'bg-card text-primary border border-bronze font-bold shadow-sm'
                          : 'text-secondary hover:text-primary hover:bg-card/60'
                      }`}
                    >
                      <span className="truncate">{cat}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="space-y-2 border-t border-border pt-4">
                <button
                  onClick={onOpenCreatePost}
                  className="w-full bg-primary text-background hover:opacity-90 font-black py-2.5 px-4 rounded-[12px] transition-all flex items-center justify-center gap-2 text-xs shadow-lg border border-bronze hover:scale-[1.02]"
                >
                  <PlusCircle size={16} />
                  <span>📝 Raise Motion</span>
                </button>

                <button
                  onClick={() => {
                    if (user) {
                      navigate('/profile');
                    } else {
                      navigate('/auth');
                    }
                  }}
                  className={`w-full font-bold py-2.5 px-4 rounded-[12px] transition-all flex items-center justify-center gap-2 text-xs border ${
                    location.pathname === '/profile'
                      ? 'bg-card text-primary border-2 border-bronze shadow-[0_0_15px_rgba(154,107,50,0.2)]'
                      : 'bg-card text-secondary hover:text-primary border-border hover:border-bronze'
                  }`}
                >
                  <FileText size={15} className="text-bronze" />
                  <span>📜 My Motions & Debates</span>
                </button>
              </div>
            </div>

            {/* DELEGATE PROFILE & LOGOUT AT BOTTOM OF LEFT SIDEBAR */}
            <div className="border-t border-border pt-4 mt-4">
              {user ? (
                <div className="space-y-2">
                  <div
                    onClick={() => navigate('/profile')}
                    className="flex items-center justify-between px-3 py-2.5 rounded-[12px] bg-card border border-border hover:border-bronze transition cursor-pointer group shadow-sm text-left"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full bg-background border border-bronze" />
                      <div className="truncate">
                        <p className="text-xs font-extrabold truncate text-primary group-hover:text-bronze transition">🪳 {user.anonymousName}</p>
                        <p className="text-[10px] text-bronze truncate font-mono font-bold">{user.delegateTag || '🪳 Backbencher'}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={logout}
                    className="w-full bg-background border border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold py-2 px-3 rounded-[10px] text-xs transition flex items-center justify-center gap-2"
                  >
                    <LogOut size={14} />
                    <span>Logout Delegate Session</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/auth')}
                  className="w-full border-2 border-bronze bg-card text-primary hover:bg-primary hover:text-background font-extrabold py-2.5 px-3 rounded-[12px] text-xs transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <LogIn size={15} />
                  <span>Enter Sabha Pass</span>
                </button>
              )}
            </div>
          </aside>

          {/* CENTER MAIN FEED CONTAINER */}
          <main className="col-span-1 md:col-span-3 lg:col-span-6 border-r border-l border-border min-h-screen pb-20 md:pb-6 pt-14 md:pt-0">
            {children}
          </main>

          {/* HIGH-UX RIGHT SIDEBAR UTILITY PANEL */}
          <aside className="hidden lg:block lg:col-span-3 py-6 px-4 sticky top-0 h-screen overflow-y-auto space-y-5 text-left">
            
            {/* LIVE SABHA STATS CARD */}
            <div className="bg-card border-2 border-bronze rounded-[16px] p-5 space-y-4 shadow-[0_0_30px_rgba(154,107,50,0.15)] relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🪳</span>
                  <h3 className="font-black text-xs uppercase tracking-wider text-primary">Cockroach Sabha</h3>
                </div>
                <span className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>LIVE</span>
                </span>
              </div>

              <p className="text-xs text-secondary leading-relaxed">
                Where every voice crawls. The internet's secret underground parliament for unfiltered Indian political & student rants.
              </p>

              <div className="grid grid-cols-2 gap-2 text-center pt-1 border-t border-border">
                <div className="bg-background border border-border rounded-[10px] p-3 space-y-0.5">
                  <p className="text-sm font-black text-bronze">100%</p>
                  <p className="text-[10px] text-muted font-mono font-bold">ANONYMOUS</p>
                </div>
                <div className="bg-background border border-border rounded-[10px] p-3 space-y-0.5">
                  <p className="text-sm font-black text-primary">0 CLOUT</p>
                  <p className="text-[10px] text-muted font-mono font-bold">NO FOLLOWERS</p>
                </div>
              </div>
            </div>

            {/* LIVE GAZETTE BULLETIN HIGHLIGHTS */}
            <div className="bg-card border border-border rounded-[16px] p-5 space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Flame size={16} className="text-bronze" />
                  <h3 className="font-black text-xs uppercase tracking-wider text-primary">Sabha Gazette Bulletins</h3>
                </div>
                <span className="text-[10px] text-bronze font-mono font-bold">TOP RANTS</span>
              </div>

              <div className="space-y-3 text-xs text-secondary">
                <div className="bg-background border border-border p-3 rounded-[10px] space-y-1 hover:border-bronze/40 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-bronze font-mono font-bold uppercase">#Gazette 01</span>
                    <span className="text-[9px] text-muted font-mono">UPSC Floor</span>
                  </div>
                  <p className="text-primary text-xs font-semibold leading-snug">UPSC Aspirants raise motion on exam delay & age relaxation.</p>
                </div>

                <div className="bg-background border border-border p-3 rounded-[10px] space-y-1 hover:border-bronze/40 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-bronze font-mono font-bold uppercase">#Gazette 02</span>
                    <span className="text-[9px] text-muted font-mono">Chai Pe Charcha</span>
                  </div>
                  <p className="text-primary text-xs font-semibold leading-snug">Chai Pe Charcha debate hits 50+ arguments on campus placements.</p>
                </div>
              </div>
            </div>

            {/* STANDING ORDERS CARD */}
            <div className="bg-card border border-border rounded-[16px] p-5 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <ScrollText size={16} className="text-bronze" />
                <h3 className="font-black text-xs uppercase tracking-wider text-primary">Standing Orders</h3>
              </div>
              <ul className="text-xs text-secondary space-y-2 list-disc list-inside leading-relaxed font-sans">
                <li><strong className="text-primary font-semibold">Survive. Speak. Repeat:</strong> Speak your truth without fear.</li>
                <li><strong className="text-primary font-semibold">No Doxxing:</strong> Real names are strictly forbidden.</li>
                <li><strong className="text-primary font-semibold">Max 300 Chars:</strong> Keep motions punchy & sharp.</li>
              </ul>
            </div>
          </aside>

        </div>
      ) : (
        /* IF ON LANDING PAGE: LUXURY LIQUID GLASS TOP NAVIGATION HEADER */
        <div className="w-full min-h-screen">
          <header className="border-b border-border/60 bg-background/85 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
              
              {/* BRAND LOGO */}
              <div className="flex items-center gap-3.5 cursor-pointer group" onClick={() => navigate('/')}>
                <div className="w-10 h-10 rounded-2xl bg-card border-2 border-bronze/60 text-bronze font-black flex items-center justify-center text-xl shadow-sm group-hover:border-bronze group-hover:scale-105 transition-all duration-200">
                  🪳
                </div>
                <div className="text-left space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-base sm:text-lg tracking-tight text-primary block leading-none font-sans uppercase">COCKROACH SABHA</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <span className="text-[10px] text-bronze font-mono uppercase tracking-widest block font-bold">Underground Student Assembly</span>
                </div>
              </div>

              {/* ACTION PILLS */}
              <div className="flex items-center gap-2.5 sm:gap-3.5">
                <a
                  href="https://x.com/CEO_chintu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden lg:inline-flex items-center gap-1.5 text-xs font-black text-secondary hover:text-primary transition bg-card border border-border px-3.5 py-2.5 rounded-[12px] hover:border-bronze/50 shadow-sm"
                >
                  <span className="text-[11px] font-bold">𝕏</span>
                  <span>@CEO_chintu</span>
                </a>

                <a
                  href="#gazette-creator"
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-black text-red-500 hover:text-red-600 px-3.5 py-2.5 border border-red-500/25 rounded-[12px] bg-red-500/5 hover:bg-red-500/10 transition"
                >
                  <Flame size={13} className="animate-pulse" />
                  <span>Protest Studio</span>
                </a>

                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="hidden md:inline-flex items-center gap-1.5 text-xs font-black text-bronze hover:text-primary bg-card border border-bronze/40 px-4 py-2.5 rounded-[12px] hover:border-bronze transition shadow-sm"
                >
                  <Lock size={13} />
                  <span>{user ? 'Delegate ID' : '🔑 Create Delegate ID'}</span>
                </button>

                <button
                  onClick={() => navigate('/feed')}
                  className="bg-primary hover:bg-primary/95 text-background font-black text-xs px-5 py-2.5 rounded-[12px] transition border border-bronze/50 shadow-md hover:-translate-y-0.5 active:translate-y-0 duration-200 flex items-center gap-2 uppercase tracking-wider"
                >
                  <span>Enter Floor</span>
                  <span className="text-sm">→</span>
                </button>
              </div>

            </div>
          </header>

          <main>
            {React.isValidElement(children) 
              ? React.cloneElement(children, { onOpenGazetteStudio: () => setIsGazetteStudioOpen(true) })
              : children}
          </main>
        </div>
      )}

      {/* MOBILE TOP BAR FOR APP PAGES */}
      {isFeedPage && (
        <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-background/90 backdrop-blur-md border-b border-border flex items-center justify-between px-4 z-40 transition-colors duration-200">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg bg-card border border-bronze text-bronze font-black flex items-center justify-center text-sm shadow-sm">
              🪳
            </div>
            <div>
              <span className="font-black text-xs tracking-tight text-primary block leading-none">COCKROACH SABHA</span>
              <span className="text-[8px] text-bronze font-mono uppercase tracking-widest block font-bold mt-0.5">Underground Sabha</span>
            </div>
          </div>

        </header>
      )}

      {/* MOBILE BOTTOM NAVIGATION FOR APP PAGES */}
      {isFeedPage && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border flex justify-around items-center h-14 z-40 px-4 transition-colors duration-200">
          <button
            onClick={() => {
              if (onSelectCategory) onSelectCategory('All');
              navigate('/feed');
            }}
            className={location.pathname === '/feed' ? 'text-bronze' : 'text-muted'}
          >
            <Building2 size={22} />
          </button>

          <button 
            onClick={() => {
              if (!user) {
                toast.error("Trying to issue an official Gazette without a Delegate Pass? Register or login first! 📜");
                navigate('/auth');
                return;
              }
              setIsGazetteStudioOpen(true);
            }} 
            className="p-2 text-primary hover:text-bronze"
          >
            <Share2 size={22} />
          </button>

          <button onClick={onOpenCreatePost} className="p-2.5 rounded-full bg-primary text-background font-black shadow-lg border border-bronze">
            <PlusCircle size={22} />
          </button>

          {user ? (
            <NavLink to="/profile" className={({ isActive }) => isActive ? 'text-bronze' : 'text-muted'}>
              <User size={22} />
            </NavLink>
          ) : (
            <NavLink to="/auth" className={({ isActive }) => isActive ? 'text-bronze' : 'text-muted'}>
              <LogIn size={22} />
            </NavLink>
          )}
        </nav>
      )}

      {/* STANDALONE GAZETTE CREATION STUDIO MODAL */}
      <CreateGazetteModal
        isOpen={isGazetteStudioOpen}
        onClose={() => setIsGazetteStudioOpen(false)}
      />

      {/* AUTHENTICATION PORTAL MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
