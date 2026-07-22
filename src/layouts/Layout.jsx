import React, { useState } from 'react';
import { useLocation, NavLink, useNavigate } from 'react-router-dom';
import { Building2, ShieldAlert, PlusCircle, LogIn, LogOut, Flame, ScrollText, User, Sparkles, FileText, CheckCircle, TrendingUp, Users, Share2, Award } from 'lucide-react';
import { categories } from '../constants/categories';
import { useAuth } from '../context/AuthContext';
import CreateGazetteModal from '../components/CreateGazetteModal';

export default function Layout({ children, onOpenCreatePost, selectedCategory, onSelectCategory }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isGazetteStudioOpen, setIsGazetteStudioOpen] = useState(false);

  const isFeedPage = location.pathname === '/feed' || location.pathname.startsWith('/posts/') || location.pathname === '/profile' || location.pathname === '/admin';

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white flex justify-center selection:bg-[#9A6B32] selection:text-white">
      
      {/* IF ON APP PAGES: FULL 3-COLUMN LUXURY PARLIAMENT LAYOUT */}
      {isFeedPage ? (
        <div className="w-full max-w-[1280px] grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-0 md:gap-6 min-h-screen">
          
          {/* DESKTOP LEFT SIDEBAR */}
          <aside className="hidden md:flex md:col-span-1 lg:col-span-3 flex-col justify-between py-6 px-4 border-r border-[#292929] sticky top-0 h-screen overflow-y-auto">
            <div className="space-y-6 text-left">
              {/* BRAND LOGO */}
              <div className="flex items-center gap-3 px-2 cursor-pointer group" onClick={() => navigate('/')}>
                <div className="w-11 h-11 rounded-2xl bg-[#171717] border-2 border-[#9A6B32] text-[#9A6B32] font-black flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(154,107,50,0.25)] group-hover:scale-105 transition-transform duration-200">
                  🪳
                </div>
                <div>
                  <span className="font-black text-lg tracking-tight text-white block leading-none" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    COCKROACH SABHA
                  </span>
                  <span className="text-[10px] text-[#9A6B32] font-mono tracking-widest uppercase mt-1 block font-bold">
                    Underground Parliament
                  </span>
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
                      ? 'bg-[#171717] text-white border-2 border-[#9A6B32] shadow-[0_0_15px_rgba(154,107,50,0.2)]'
                      : 'text-[#A1A1AA] hover:text-white hover:bg-[#171717]/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 size={16} className="text-[#9A6B32]" />
                    <span>Sabha Floor (All)</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9A6B32]"></span>
                </button>

                {isAdmin && (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `w-full flex items-center justify-between px-3.5 py-2.5 rounded-[12px] text-xs font-bold transition-all duration-200 ${
                        isActive
                          ? 'bg-red-500/10 text-red-400 border-2 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                          : 'text-[#A1A1AA] hover:text-white hover:bg-[#171717]/80 border border-transparent'
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
              <div className="p-3 bg-[#171717] border-2 border-[#9A6B32] rounded-[14px] space-y-2 shadow-[0_0_20px_rgba(154,107,50,0.2)]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-black uppercase text-[#9A6B32] flex items-center gap-1">
                    <Flame size={12} />
                    <span>VIRAL FEATURE</span>
                  </span>
                  <span className="text-[9px] bg-white text-black font-extrabold px-1.5 py-0.5 rounded">NEW</span>
                </div>

                <p className="text-[11px] text-[#A1A1AA] leading-snug">
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
                  className="w-full bg-[#9A6B32] hover:bg-[#b07d3d] text-white font-black py-2 px-3 rounded-[10px] text-xs transition flex items-center justify-center gap-1.5 shadow-md border border-[#9A6B32]"
                >
                  <Share2 size={14} />
                  <span>📜 Create Gazette Poster</span>
                </button>
              </div>

              {/* COMMITTEES SECTION */}
              <div className="space-y-2 border-t border-[#292929] pt-4">
                <div className="flex items-center justify-between px-2">
                  <p className="text-[11px] font-mono font-black uppercase tracking-wider text-[#9A6B32]">
                    📜 Committees
                  </p>
                  <span className="text-[10px] text-[#71717A] font-mono">{categories.length}</span>
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
                          ? 'bg-[#171717] text-white border border-[#9A6B32] font-bold shadow-sm'
                          : 'text-[#A1A1AA] hover:text-white hover:bg-[#171717]/60'
                      }`}
                    >
                      <span className="truncate">{cat}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="space-y-2 border-t border-[#292929] pt-4">
                <button
                  onClick={onOpenCreatePost}
                  className="w-full bg-white text-black hover:bg-neutral-200 font-black py-2.5 px-4 rounded-[12px] transition-all flex items-center justify-center gap-2 text-xs shadow-lg border border-[#9A6B32] hover:scale-[1.02]"
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
                      ? 'bg-[#171717] text-white border-2 border-[#9A6B32] shadow-[0_0_15px_rgba(154,107,50,0.2)]'
                      : 'bg-[#171717] text-[#A1A1AA] hover:text-white border-[#292929] hover:border-[#9A6B32]'
                  }`}
                >
                  <FileText size={15} className="text-[#9A6B32]" />
                  <span>📜 My Motions & Debates</span>
                </button>
              </div>
            </div>

            {/* DELEGATE PROFILE & LOGOUT AT BOTTOM OF LEFT SIDEBAR */}
            <div className="border-t border-[#292929] pt-4 mt-4">
              {user ? (
                <div className="space-y-2">
                  <div
                    onClick={() => navigate('/profile')}
                    className="flex items-center justify-between px-3 py-2.5 rounded-[12px] bg-[#171717] border border-[#292929] hover:border-[#9A6B32] transition cursor-pointer group shadow-sm text-left"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full bg-[#0B0B0B] border border-[#9A6B32]" />
                      <div className="truncate">
                        <p className="text-xs font-extrabold truncate text-white group-hover:text-[#9A6B32] transition">🪳 {user.anonymousName}</p>
                        <p className="text-[10px] text-[#9A6B32] truncate font-mono font-bold">{user.delegateTag || '🪳 Backbencher'}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={logout}
                    className="w-full bg-[#0B0B0B] border border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold py-2 px-3 rounded-[10px] text-xs transition flex items-center justify-center gap-2"
                  >
                    <LogOut size={14} />
                    <span>Logout Delegate Session</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/auth')}
                  className="w-full border-2 border-[#9A6B32] bg-[#171717] text-white hover:bg-white hover:text-black font-extrabold py-2.5 px-3 rounded-[12px] text-xs transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <LogIn size={15} />
                  <span>Enter Sabha Pass</span>
                </button>
              )}
            </div>
          </aside>

          {/* CENTER MAIN FEED CONTAINER */}
          <main className="col-span-1 md:col-span-3 lg:col-span-6 border-r border-l border-[#292929] min-h-screen pb-20 md:pb-6">
            {children}
          </main>

          {/* HIGH-UX RIGHT SIDEBAR UTILITY PANEL */}
          <aside className="hidden lg:block lg:col-span-3 py-6 px-4 sticky top-0 h-screen overflow-y-auto space-y-5 text-left">
            
            {/* LIVE SABHA STATS CARD */}
            <div className="bg-[#171717] border-2 border-[#9A6B32] rounded-[16px] p-5 space-y-4 shadow-[0_0_30px_rgba(154,107,50,0.15)] relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#292929] pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🪳</span>
                  <h3 className="font-black text-xs uppercase tracking-wider text-white">Cockroach Sabha</h3>
                </div>
                <span className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>LIVE</span>
                </span>
              </div>

              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Where every voice crawls. The internet's secret underground parliament for unfiltered Indian political & student rants.
              </p>

              <div className="grid grid-cols-2 gap-2 text-center pt-1 border-t border-[#292929]">
                <div className="bg-[#0B0B0B] border border-[#292929] rounded-[10px] p-3 space-y-0.5">
                  <p className="text-sm font-black text-[#9A6B32]">100%</p>
                  <p className="text-[10px] text-[#71717A] font-mono font-bold">ANONYMOUS</p>
                </div>
                <div className="bg-[#0B0B0B] border border-[#292929] rounded-[10px] p-3 space-y-0.5">
                  <p className="text-sm font-black text-white">0 CLOUT</p>
                  <p className="text-[10px] text-[#71717A] font-mono font-bold">NO FOLLOWERS</p>
                </div>
              </div>
            </div>

            {/* LIVE GAZETTE BULLETIN HIGHLIGHTS */}
            <div className="bg-[#171717] border border-[#292929] rounded-[16px] p-5 space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#292929] pb-3">
                <div className="flex items-center gap-2">
                  <Flame size={16} className="text-[#9A6B32]" />
                  <h3 className="font-black text-xs uppercase tracking-wider text-white">Sabha Gazette Bulletins</h3>
                </div>
                <span className="text-[10px] text-[#9A6B32] font-mono font-bold">TOP RANTS</span>
              </div>

              <div className="space-y-3 text-xs text-[#A1A1AA]">
                <div className="bg-[#0B0B0B] border border-[#292929] p-3 rounded-[10px] space-y-1 hover:border-[#9A6B32]/40 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#9A6B32] font-mono font-bold uppercase">#Gazette 01</span>
                    <span className="text-[9px] text-[#71717A] font-mono">UPSC Floor</span>
                  </div>
                  <p className="text-white text-xs font-semibold leading-snug">UPSC Aspirants raise motion on exam delay & age relaxation.</p>
                </div>

                <div className="bg-[#0B0B0B] border border-[#292929] p-3 rounded-[10px] space-y-1 hover:border-[#9A6B32]/40 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#9A6B32] font-mono font-bold uppercase">#Gazette 02</span>
                    <span className="text-[9px] text-[#71717A] font-mono">Chai Pe Charcha</span>
                  </div>
                  <p className="text-white text-xs font-semibold leading-snug">Chai Pe Charcha debate hits 50+ arguments on campus placements.</p>
                </div>
              </div>
            </div>

            {/* STANDING ORDERS CARD */}
            <div className="bg-[#171717] border border-[#292929] rounded-[16px] p-5 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 border-b border-[#292929] pb-3">
                <ScrollText size={16} className="text-[#9A6B32]" />
                <h3 className="font-black text-xs uppercase tracking-wider text-white">Standing Orders</h3>
              </div>
              <ul className="text-xs text-[#A1A1AA] space-y-2 list-disc list-inside leading-relaxed font-sans">
                <li><strong className="text-white font-semibold">Survive. Speak. Repeat:</strong> Speak your truth without fear.</li>
                <li><strong className="text-white font-semibold">No Doxxing:</strong> Real names are strictly forbidden.</li>
                <li><strong className="text-white font-semibold">Max 300 Chars:</strong> Keep motions punchy & sharp.</li>
              </ul>
            </div>

          </aside>

        </div>
      ) : (
        /* IF ON LANDING PAGE: LUXURY LIQUID GLASS TOP NAVIGATION HEADER */
        <div className="w-full min-h-screen">
          <header className="border-b border-[#9A6B32]/30 bg-[#0B0B0B]/70 backdrop-blur-xl sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                <div className="w-10 h-10 rounded-xl bg-[#171717]/80 backdrop-blur-md border-2 border-[#9A6B32] text-[#9A6B32] font-black flex items-center justify-center text-xl shadow-[0_0_20px_rgba(154,107,50,0.35)] group-hover:scale-105 transition">
                  🪳
                </div>
                <div>
                  <span className="font-black text-lg tracking-tight text-white block leading-none">COCKROACH SABHA</span>
                  <span className="text-[9px] text-[#9A6B32] font-mono uppercase tracking-widest block font-bold">Underground Parliament</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/feed')}
                  className="bg-white/90 hover:bg-white text-black font-black text-xs px-5 py-2.5 rounded-[10px] backdrop-blur-md transition border-2 border-[#9A6B32] shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02]"
                >
                  Enter Sabha Floor →
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

      {/* MOBILE BOTTOM NAVIGATION FOR APP PAGES */}
      {isFeedPage && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0B0B0B]/95 backdrop-blur-md border-t border-[#292929] flex justify-around items-center h-14 z-40 px-4">
          <button
            onClick={() => {
              if (onSelectCategory) onSelectCategory('All');
              navigate('/feed');
            }}
            className={location.pathname === '/feed' ? 'text-[#9A6B32]' : 'text-[#71717A]'}
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
            className="p-2 text-white hover:text-[#9A6B32]"
          >
            <Share2 size={22} />
          </button>

          <button onClick={onOpenCreatePost} className="p-2.5 rounded-full bg-white text-black font-black shadow-lg border border-[#9A6B32]">
            <PlusCircle size={22} />
          </button>

          {user ? (
            <NavLink to="/profile" className={({ isActive }) => isActive ? 'text-[#9A6B32]' : 'text-[#71717A]'}>
              <User size={22} />
            </NavLink>
          ) : (
            <NavLink to="/auth" className={({ isActive }) => isActive ? 'text-[#9A6B32]' : 'text-[#71717A]'}>
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
    </div>
  );
}
