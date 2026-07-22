import React, { useRef, useState } from 'react';
import { X, Download, Share2, Award, Stamp, CheckCircle2, FileText, Sparkles, Image as ImageIcon, RefreshCw, Flame } from 'lucide-react';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import { gazettePetitionTypes, gazetteStamps, delegateTags } from '../constants/categories';
import { useAuth } from '../context/AuthContext';

export default function CreateGazetteModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const posterRef = useRef(null);
  const fileInputRef = useRef(null);

  // Gazette Generator Customization States
  const [petitionType, setPetitionType] = useState(gazettePetitionTypes[0]);
  const [customTitle, setCustomTitle] = useState('');
  const [demandContent, setDemandContent] = useState('We hereby petition the Parliament for immediate accountability, transparency, and action!');
  const [delegateTitle, setDelegateTitle] = useState(user?.anonymousName || 'Chief Citizen Petitioner MP');
  const [stampType, setStampType] = useState(gazetteStamps[0]);
  const [themeMode, setThemeMode] = useState('gold'); // 'gold', 'emerald', 'crimson', 'monochrome'
  const [imagePreview, setImagePreview] = useState(null);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/webp', 0.7);
        setImagePreview(compressedDataUrl);
        toast.success('Evidence photo attached to Gazette!');
      };
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = async () => {
    if (!posterRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(posterRef.current, { cacheBust: true, pixelRatio: 3 });
      const link = document.createElement('a');
      link.download = `Cockroach_Sabha_Official_Gazette_Petition_${Date.now().toString().slice(-6)}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Viral Gazette Poster downloaded in 4K Ultra-HD!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export Gazette poster image');
    } finally {
      setDownloading(false);
    }
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const gazetteId = `GAZ-2026-${Math.floor(10000 + Math.random() * 90000)}`;

  // Theme border & accent colors
  const themeStyles = {
    gold: { border: 'border-[#9A6B32]', text: 'text-[#9A6B32]', bg: 'bg-[#9A6B32]', glow: 'shadow-[0_0_50px_rgba(154,107,50,0.3)]' },
    emerald: { border: 'border-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-600', glow: 'shadow-[0_0_50px_rgba(16,185,129,0.3)]' },
    crimson: { border: 'border-red-500', text: 'text-red-400', bg: 'bg-red-600', glow: 'shadow-[0_0_50px_rgba(239,68,68,0.3)]' },
    monochrome: { border: 'border-neutral-300', text: 'text-white', bg: 'bg-white text-black', glow: 'shadow-[0_0_50px_rgba(255,255,255,0.2)]' },
  }[themeMode];

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#171717] border-2 border-[#9A6B32] rounded-[24px] w-full max-w-4xl p-6 shadow-[0_0_80px_rgba(154,107,50,0.45)] relative text-left grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto">
        
        {/* LEFT COLUMN: CUSTOMIZATION CONTROLS */}
        <div className="lg:col-span-6 space-y-4 max-h-[80vh] overflow-y-auto pr-1">
          <div className="flex items-center justify-between border-b border-[#292929] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#0B0B0B] border border-[#9A6B32] flex items-center justify-center text-[#9A6B32]">
                <Flame size={18} />
              </div>
              <div>
                <h3 className="font-extrabold text-sm uppercase text-white tracking-wider">Official Gazette Studio</h3>
                <p className="text-[10px] text-[#9A6B32] font-mono font-bold">Create Viral Social Media Petitions</p>
              </div>
            </div>
            <button onClick={onClose} className="lg:hidden text-[#71717A] hover:text-white p-1">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase text-[#9A6B32] mb-1 font-mono">
                1. Select Petition Type / Demands
              </label>
              <select
                value={petitionType}
                onChange={(e) => setPetitionType(e.target.value)}
                className="w-full bg-[#0B0B0B] border border-[#292929] rounded-[10px] p-2.5 text-xs text-white focus:outline-none focus:border-[#9A6B32]"
              >
                {gazettePetitionTypes.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {petitionType.includes('Custom') && (
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#A1A1AA] mb-1">
                  Custom Gazette Title / Motion Name
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Demand for Immediate Highway Audit"
                  className="w-full bg-[#0B0B0B] border border-[#292929] rounded-[10px] p-2.5 text-xs text-white focus:outline-none focus:border-[#9A6B32]"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase text-[#A1A1AA] mb-1">
                2. Statement of Demands / Unfiltered Arguments
              </label>
              <textarea
                value={demandContent}
                onChange={(e) => setDemandContent(e.target.value)}
                rows={3}
                placeholder="State your petition demands clearly..."
                className="w-full bg-[#0B0B0B] border border-[#292929] rounded-[10px] p-2.5 text-xs text-white focus:outline-none focus:border-[#9A6B32] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#A1A1AA] mb-1">
                  Petitioner Handle
                </label>
                <input
                  type="text"
                  value={delegateTitle}
                  onChange={(e) => setDelegateTitle(e.target.value)}
                  placeholder="e.g. Chief Opposition MP"
                  className="w-full bg-[#0B0B0B] border border-[#292929] rounded-[10px] p-2.5 text-xs text-white focus:outline-none focus:border-[#9A6B32]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#A1A1AA] mb-1">
                  Parliamentary Stamp Seal
                </label>
                <select
                  value={stampType}
                  onChange={(e) => setStampType(e.target.value)}
                  className="w-full bg-[#0B0B0B] border border-[#292929] rounded-[10px] p-2.5 text-xs text-white focus:outline-none focus:border-[#9A6B32]"
                >
                  {gazetteStamps.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-[#A1A1AA] mb-1">
                3. Poster Theme Palette
              </label>
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#0B0B0B] border border-[#292929] rounded-[10px] text-[11px] font-bold text-center">
                <button
                  type="button"
                  onClick={() => setThemeMode('gold')}
                  className={`py-1.5 rounded-[7px] transition ${themeMode === 'gold' ? 'bg-[#9A6B32] text-white shadow-sm' : 'text-[#A1A1AA]'}`}
                >
                  👑 Imperial
                </button>
                <button
                  type="button"
                  onClick={() => setThemeMode('emerald')}
                  className={`py-1.5 rounded-[7px] transition ${themeMode === 'emerald' ? 'bg-emerald-600 text-white shadow-sm' : 'text-[#A1A1AA]'}`}
                >
                  🏛 Emerald
                </button>
                <button
                  type="button"
                  onClick={() => setThemeMode('crimson')}
                  className={`py-1.5 rounded-[7px] transition ${themeMode === 'crimson' ? 'bg-red-600 text-white shadow-sm' : 'text-[#A1A1AA]'}`}
                >
                  🚨 Crimson
                </button>
                <button
                  type="button"
                  onClick={() => setThemeMode('monochrome')}
                  className={`py-1.5 rounded-[7px] transition ${themeMode === 'monochrome' ? 'bg-white text-black shadow-sm' : 'text-[#A1A1AA]'}`}
                >
                  📜 Silver
                </button>
              </div>
            </div>

            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-[#0B0B0B] border border-[#9A6B32]/40 text-[#9A6B32] hover:text-white font-bold py-2 rounded-[10px] transition text-xs flex items-center justify-center gap-2"
              >
                <ImageIcon size={14} />
                <span>{imagePreview ? 'Change Attached Evidence Photo' : 'Attach Photo Evidence'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME GAZETTE CANVAS PREVIEW & EXPORT */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#9A6B32]">
              LIVE 4K GAZETTE POSTER PREVIEW
            </span>
            <button onClick={onClose} className="hidden lg:block text-[#71717A] hover:text-white p-1">
              <X size={20} />
            </button>
          </div>

          <div className="flex justify-center my-auto">
            <div
              ref={posterRef}
              className={`w-[350px] rounded-[20px] p-6 text-white space-y-4 shadow-2xl relative flex flex-col justify-between border-4 bg-[#060606] ${themeStyles.border} ${themeStyles.glow}`}
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              {/* GAZETTE HEADER */}
              <div className={`pb-3 space-y-2 text-center border-b-2 ${themeStyles.border}`}>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl">🪳</span>
                  <span className="font-black text-xl tracking-[0.15em] uppercase text-white" style={{ fontFamily: 'Cinzel, serif' }}>
                    COCKROACH SABHA
                  </span>
                </div>

                <div className={`flex items-center justify-center gap-1 text-[9px] font-mono font-black uppercase tracking-[0.25em] ${themeStyles.text}`}>
                  <span>• OFFICIAL PARLIAMENTARY GAZETTE NOTIFICATION •</span>
                </div>

                <div className="flex items-center justify-between text-[9px] font-mono text-[#A1A1AA] pt-1.5 border-t border-[#292929]">
                  <span>NOTIF NO: #{gazetteId}</span>
                  <span>DATE: {formattedDate}</span>
                </div>
              </div>

              {/* PETITION TITLE BADGE */}
              <div className="space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-black uppercase tracking-wider ${themeStyles.text}`}>
                    📜 CITIZEN PETITION / MOTION
                  </span>
                  <span className="text-[9px] text-emerald-400 font-mono font-bold">100% UNFILTERED</span>
                </div>

                <div className={`p-3.5 rounded-[12px] bg-[#121212] border-l-4 ${themeStyles.border}`}>
                  <h4 className="font-black text-xs text-white uppercase tracking-wide leading-snug" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {petitionType.includes('Custom') ? (customTitle || 'Citizen Petition Motion') : petitionType}
                  </h4>
                </div>
              </div>

              {/* STATEMENT OF DEMANDS */}
              <div className="p-3.5 rounded-[12px] bg-[#121212] border border-[#292929] space-y-1.5 text-left">
                <span className="text-[9px] text-[#71717A] font-mono uppercase font-bold">DECREE & DEMANDS:</span>
                <p className="text-xs text-neutral-100 italic leading-relaxed whitespace-pre-wrap">
                  "{demandContent}"
                </p>
              </div>

              {/* EVIDENCE IMAGE (IF ATTACHED) */}
              {imagePreview && (
                <div className="rounded-[12px] overflow-hidden border border-[#292929] max-h-36 bg-black flex items-center justify-center">
                  <img src={imagePreview} alt="Evidence" className="w-full h-auto max-h-36 object-contain rounded-[12px]" />
                </div>
              )}

              {/* PETITIONER & STAMP FOOTER */}
              <div className={`pt-3.5 flex items-center justify-between text-[9px] font-mono text-[#A1A1AA] border-t-2 ${themeStyles.border}`}>
                <div className="text-left space-y-0.5">
                  <p className="text-white font-black uppercase text-[10px]" style={{ fontFamily: 'Cinzel, serif' }}>
                    🪳 {delegateTitle}
                  </p>
                  <p className={`font-bold ${themeStyles.text}`}>
                    cockroachsabha.com
                  </p>
                </div>

                <div className={`px-2.5 py-1.5 rounded-[8px] uppercase font-black text-[8px] tracking-wider border-2 flex items-center gap-1 bg-[#121212] ${themeStyles.border} ${themeStyles.text}`}>
                  <Stamp size={11} />
                  <span>{stampType.split(' ')[0]}</span>
                </div>
              </div>
            </div>
          </div>

          {/* EXPORT ACTION BUTTON */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-[10px] text-xs font-bold border border-[#292929] text-[#A1A1AA] hover:text-white hover:bg-[#292929] transition"
            >
              Close Studio
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="px-6 py-2.5 rounded-[10px] text-xs font-black bg-white text-black hover:bg-neutral-200 transition flex items-center gap-2 border border-[#9A6B32] shadow-xl disabled:opacity-50"
            >
              <Download size={15} />
              <span>{downloading ? 'Generating Ultra-HD PNG...' : 'Download Gazette PNG'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
