import React, { useRef, useState } from 'react';
import { X, Download, Share2, Award, Building2, CheckCircle2, ShieldAlert, Stamp } from 'lucide-react';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';

export default function ExportGazetteModal({ isOpen, onClose, post }) {
  const posterRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [themeMode, setThemeMode] = useState('dark'); // 'dark' (Gold/Black) or 'monochrome' (Silver/Brutalist)

  if (!isOpen || !post) return null;

  const handleDownload = async () => {
    if (!posterRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(posterRef.current, { cacheBust: true, pixelRatio: 3 });
      const link = document.createElement('a');
      link.download = `Cockroach_Sabha_Official_Gazette_${post.id ? post.id.slice(0, 6) : 'motion'}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Official Parliamentary Gazette Poster downloaded in Ultra-HD!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate Gazette poster image');
    } finally {
      setDownloading(false);
    }
  };

  const formattedDate = new Date(post.createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const gazetteId = post.id ? post.id.slice(0, 8).toUpperCase() : 'MOT-9021';

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border-2 border-bronze rounded-[22px] w-full max-w-lg p-6 space-y-5 shadow-[0_0_80px_rgba(154,107,50,0.45)] relative text-left">
        
        {/* MODAL HEADER WITH THEME TOGGLE */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-background border border-bronze flex items-center justify-center text-bronze shadow-inner">
              <Share2 size={17} />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-wider text-primary">Parliamentary Gazette Poster</h3>
              <p className="text-[10px] text-bronze font-mono font-bold">Official Document for X, WhatsApp & Instagram Stories</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-muted hover:text-primary p-1.5 rounded-full hover:bg-background transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* POSTER STYLE TOGGLE BUTTONS */}
        <div className="flex items-center justify-between text-xs bg-background p-1.5 rounded-[12px] border border-border">
          <span className="text-[10px] font-mono text-muted pl-2 uppercase font-bold">Gazette Theme:</span>
          <div className="flex gap-1">
            <button
              onClick={() => setThemeMode('dark')}
              className={`px-3 py-1 rounded-[8px] font-bold text-[11px] transition ${
                themeMode === 'dark'
                  ? 'bg-bronze text-white shadow-sm'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              👑 Imperial Gold
            </button>
            <button
              onClick={() => setThemeMode('monochrome')}
              className={`px-3 py-1 rounded-[8px] font-bold text-[11px] transition ${
                themeMode === 'monochrome'
                  ? 'bg-primary text-background shadow-sm'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              🏛 Silver Brutalist
            </button>
          </div>
        </div>

        {/* ULTRA-HD PARLIAMENTARY GAZETTE POSTER CANVAS */}
        <div className="flex justify-center py-2">
          <div
            ref={posterRef}
            className={`w-[360px] rounded-[20px] p-6 text-white space-y-4 shadow-2xl relative flex flex-col justify-between border-4 transition-all duration-300 ${
              themeMode === 'dark'
                ? 'bg-[#060606] border-[#9A6B32]'
                : 'bg-[#0B0B0B] border-neutral-300'
            }`}
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            {/* TOP HEADER & EMBLEM STAMP */}
            <div className={`pb-3 space-y-2 text-center border-b-2 ${
              themeMode === 'dark' ? 'border-[#9A6B32]' : 'border-neutral-300'
            }`}>
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl">🪳</span>
                <span className={`font-black text-xl tracking-[0.15em] uppercase ${
                  themeMode === 'dark' ? 'text-white' : 'text-white'
                }`} style={{ fontFamily: 'Cinzel, serif' }}>
                  COCKROACH SABHA
                </span>
              </div>

              <div className="flex items-center justify-center gap-1 text-[9px] font-mono font-black uppercase tracking-[0.25em]" style={{ color: themeMode === 'dark' ? '#9A6B32' : '#A1A1AA' }}>
                <span>• PARLIAMENTARY GAZETTE BULLETIN •</span>
              </div>

              <div className="flex items-center justify-between text-[9px] font-mono text-[#A1A1AA] pt-1.5 border-t border-[#292929]">
                <span>NO: #{gazetteId}</span>
                <span>ISSUE DATE: {formattedDate}</span>
              </div>
            </div>

            {/* DELEGATE IDENTIFICATION BADGE */}
            <div className={`p-3.5 rounded-[14px] flex items-center gap-3 border ${
              themeMode === 'dark'
                ? 'bg-[#121212] border-[#9A6B32]/40'
                : 'bg-[#171717] border-neutral-700'
            }`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-black shrink-0 border ${
                themeMode === 'dark'
                  ? 'bg-[#060606] border-[#9A6B32] text-[#9A6B32]'
                  : 'bg-[#060606] border-neutral-400 text-white'
              }`}>
                🪳
              </div>
              <div className="min-w-0 flex-1 text-left">
                <div className="flex items-center justify-between gap-1">
                  <p className="font-extrabold text-xs text-white truncate">
                    {post.user?.anonymousName || 'Delegate Cockroach'}
                  </p>
                  <span className="text-[9px] text-emerald-400 font-mono font-bold flex items-center gap-0.5">
                    <CheckCircle2 size={11} />
                    <span>Pass Verified</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-mono mt-1 flex-wrap">
                  <span className={`px-2 py-0.5 rounded border font-bold ${
                    themeMode === 'dark'
                      ? 'bg-[#060606] border-[#9A6B32]/50 text-[#9A6B32]'
                      : 'bg-[#060606] border-neutral-500 text-neutral-200'
                  }`}>
                    {post.category || 'Parliamentary Debate'}
                  </span>
                  {post.college && <span className="text-[#A1A1AA] truncate">• {post.college}</span>}
                </div>
              </div>
            </div>

            {/* RAISED MOTION QUOTE CONTAINER */}
            <div className="space-y-2.5 my-auto text-left">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${
                  themeMode === 'dark' ? 'text-[#9A6B32]' : 'text-neutral-400'
                }`}>
                  📜 MOTION SUBMITTED ON FLOOR
                </span>
                <span className="text-[9px] text-[#71717A] font-mono">UNFILTERED SPEECH</span>
              </div>

              <div className={`p-4 rounded-r-[12px] border-l-4 text-left shadow-sm ${
                themeMode === 'dark'
                  ? 'bg-[#121212] border-[#9A6B32]'
                  : 'bg-[#171717] border-neutral-200'
              }`}>
                <p className="text-xs font-medium text-neutral-100 whitespace-pre-wrap leading-relaxed italic" style={{ fontFamily: 'Inter, sans-serif' }}>
                  "{post.content}"
                </p>
              </div>
            </div>

            {/* ATTACHED MEDIA IMAGE (IF APPLICABLE) */}
            {post.image && (
              <div className="rounded-[12px] overflow-hidden border border-[#292929] max-h-44 bg-black flex items-center justify-center">
                <img 
                  src={post.image} 
                  alt="Attachment" 
                  className="w-full h-auto max-h-44 object-contain rounded-[12px]" 
                />
              </div>
            )}

            {/* WATERMARK FOOTER STAMP */}
            <div className={`pt-3.5 flex items-center justify-between text-[9px] font-mono text-[#A1A1AA] border-t-2 ${
              themeMode === 'dark' ? 'border-[#9A6B32]' : 'border-neutral-300'
            }`}>
              <div className="text-left space-y-0.5">
                <p className="text-white font-black uppercase tracking-wider text-[10px]" style={{ fontFamily: 'Cinzel, serif' }}>
                  DEMOCRACY UNFILTERED
                </p>
                <p className={`font-bold ${themeMode === 'dark' ? 'text-[#9A6B32]' : 'text-neutral-400'}`}>
                  cockroachsabha.com
                </p>
              </div>

              <div className={`px-3 py-1.5 rounded-[8px] uppercase font-black text-[9px] tracking-wider border-2 flex items-center gap-1 ${
                themeMode === 'dark'
                  ? 'border-[#9A6B32] text-[#9A6B32] bg-[#121212]'
                  : 'border-neutral-300 text-neutral-200 bg-[#171717]'
              }`}>
                <Stamp size={12} />
                <span>OFFICIAL STAMP</span>
              </div>
            </div>

          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-[10px] text-xs font-bold border border-border text-secondary hover:text-primary hover:bg-background transition"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="px-6 py-2.5 rounded-[10px] text-xs font-black bg-primary text-background hover:opacity-90 transition flex items-center gap-2 border border-bronze shadow-xl disabled:opacity-50"
          >
            <Download size={15} />
            <span>{downloading ? 'Generating Ultra-HD PNG...' : 'Download Gazette PNG'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
