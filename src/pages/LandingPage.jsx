import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, UserCheck, UserPlus, LogIn, Compass, Flame, Share2, Download, CheckCircle2, Image as ImageIcon, Copy, Smartphone, Sparkles, TrendingUp, Users } from 'lucide-react';
import { colleges, gazettePetitionTypes, gazetteStamps } from '../constants/categories';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'sonner';
import { toPng } from 'html-to-image';

export default function LandingPage({ onOpenGazetteStudio }) {
  const navigate = useNavigate();
  const { user, login, requestResetCode, resetPassword } = useAuth();
  const { theme } = useTheme();

  // Mode Toggle for main auth box: 'signup', 'login', 'forgot'
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

  // --- GAZETTE INLINE CREATOR STATES ---
  const [petitionerName, setPetitionerName] = useState('');
  const [petitionType, setPetitionType] = useState(gazettePetitionTypes[0]);
  const [customTitle, setCustomTitle] = useState('');
  const [demandContent, setDemandContent] = useState('We hereby petition the Parliament for immediate accountability, dismantling of NTA, and the resignation of Education Minister Dharmendra Pradhan over NEET-UG leaks.');
  const [delegateTitle, setDelegateTitle] = useState('Chief Student Protester MP');
  const [stampType, setStampType] = useState(gazetteStamps[0]);
  const [themeMode, setThemeMode] = useState('crimson'); // 'crimson', 'gold', 'emerald', 'monochrome'
  const [imagePreview, setImagePreview] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const fileInputRef = useRef(null);
  const posterRef = useRef(null);

  // Inline Auth within Creator
  const [inlineAuthMode, setInlineAuthMode] = useState('signup'); // 'signup', 'login'
  const [inlineEmail, setInlineEmail] = useState('');
  const [inlinePassword, setInlinePassword] = useState('');
  const [inlineUsername, setInlineUsername] = useState('');
  const [inlineCollege, setInlineCollege] = useState(colleges[0]);
  const [publishing, setPublishing] = useState(false);
  const [publishedPost, setPublishedPost] = useState(null); // Stores successfully published post
  const [isCustomizing, setIsCustomizing] = useState(false);

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
        navigate('/feed');
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

  // Image Upload handler for Gazette Creator
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
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

        const compressedDataUrl = canvas.toDataURL('image/webp', 0.6);
        setImagePreview(compressedDataUrl);
        toast.success('Evidence photo compressed and attached!');
      };
    };
    reader.readAsDataURL(file);
  };

  // HD PNG Exporter
  const handleDownload = async () => {
    if (!petitionerName || petitionerName.trim() === '') {
      toast.error('Petitioner Name is compulsory to generate/download the card!');
      return;
    }
    if (!posterRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(posterRef.current, { cacheBust: true, pixelRatio: 3 });
      const link = document.createElement('a');
      link.download = `CJP_NEET_Protest_Gazette_${Date.now().toString().slice(-6)}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Protest Gazette downloaded in Ultra-HD!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export Gazette poster image');
    } finally {
      setDownloading(false);
    }
  };

  // Social Sharing Functions
  const getShareText = () => {
    const titleText = petitionType.includes('Custom') ? (customTitle || 'Citizen Petition') : petitionType;
    return `✊ CJP Protest: "${titleText}"\n\n"${demandContent.slice(0, 120)}..."\n\nDemand accountability for NEET paper leaks! Dharmendra Pradhan must resign. Seal your protest card here:`;
  };

  const handleShareSocial = (platform) => {
    const text = encodeURIComponent(getShareText());
    const url = encodeURIComponent(window.location.origin);
    let shareUrl = '';

    if (platform === 'whatsapp') {
      shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
    } else if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    } else if (platform === 'telegram') {
      shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
    }

    window.open(shareUrl, '_blank');
    toast.success(`Opening ${platform} share portal...`);
  };

  const handleCopyLink = () => {
    const shareLink = publishedPost ? `${window.location.origin}/posts/${publishedPost.id}` : window.location.origin;
    navigator.clipboard.writeText(shareLink);
    toast.success('Protest Petition link copied to clipboard!');
  };

  const handleWebShare = async () => {
    if (!posterRef.current) return;
    try {
      const dataUrl = await toPng(posterRef.current, { cacheBust: true, pixelRatio: 2 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'gazette_protest.png', { type: 'image/png' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'CJP NEET Paper Leak Protest Gazette',
          text: getShareText(),
        });
        toast.success('Protest Gazette shared successfully!');
      } else {
        handleCopyLink();
      }
    } catch (err) {
      console.error(err);
      toast.error('Web Share failed. Copied link instead.');
      handleCopyLink();
    }
  };

  // Submit Gazette Card flow
  const handleSealAndPublish = async (e) => {
    e.preventDefault();
    if (!petitionerName || petitionerName.trim() === '') {
      toast.error('Petitioner Name is compulsory to publish the card!');
      return;
    }
    setPublishing(true);

    let activeUser = user;
    let activeToken = localStorage.getItem('unfiltered_token');

    // 1. If not logged in, perform authentication (optional inline credentials)
    if (!activeUser) {
      const isGuest = !inlineEmail.trim() || !inlinePassword.trim();
      const finalEmail = inlineEmail.trim() || `guest_${Math.floor(100000 + Math.random() * 900000)}@guest.com`;
      const finalPassword = inlinePassword.trim() || `guest_${Math.floor(100000 + Math.random() * 900000)}`;
      const finalCollege = inlineCollege || 'Guest Benches';
      const finalUsername = inlineUsername.trim() || petitionerName.trim().replace(/\s+/g, '_') || 'Guest_Delegate';
      const finalMode = isGuest ? 'signup' : inlineAuthMode;
      
      const res = await login(
        finalEmail, 
        finalCollege, 
        finalPassword, 
        finalUsername, 
        finalMode
      );

      if (res.success) {
        activeUser = res.user;
        activeToken = localStorage.getItem('unfiltered_token');
        
        // Show recovery modal only for real users who explicitly signed up
        if (!isGuest && inlineAuthMode === 'signup' && res.recoveryKey) {
          setGeneratedKey(res.recoveryKey);
          setShowRecoveryModal(true);
        }
        if (!isGuest) {
          toast.success(`Authenticated delegate: ${res.user.anonymousName}`);
        }
      } else {
        toast.error(res.error || 'Authentication failed. Please verify credentials.');
        setPublishing(false);
        return;
      }
    }

    // 2. Publish Gazette Card as a Post
    try {
      const finalTitle = petitionType.includes('Custom') ? (customTitle || 'Citizen Petition') : petitionType;
      // Combine petition title and statement into content block
      const fullPostContent = `[${finalTitle}] ${demandContent}`;

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          content: fullPostContent,
          category: 'NEET Paper Leak & NTA Reforms',
          college: activeUser?.college || 'Opposition Benches',
          image: imagePreview || null
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Your Gazette card is successfully sealed and published! ✊');
        setPublishedPost(data.post || data);
      } else {
        toast.error(data.error || 'Failed to publish Gazette card');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server connection error while publishing');
    } finally {
      setPublishing(false);
    }
  };

  // Reset creator to draft another card
  const handleResetCreator = () => {
    setPublishedPost(null);
    setDemandContent('We hereby petition the Parliament for immediate accountability, dismantling of NTA, and the resignation of Education Minister Dharmendra Pradhan over NEET-UG leaks.');
    setCustomTitle('');
    setImagePreview(null);
  };

  // Theme borders & colors for live card canvas preview
  const themeStyles = {
    gold: { border: 'border-[#9A6B32]', text: 'text-[#9A6B32]', bg: 'bg-[#9A6B32]', glow: 'shadow-[0_0_50px_rgba(154,107,50,0.3)]', badge: 'bg-[#9A6B32]/10 border-[#9A6B32]/30 text-[#9A6B32]' },
    emerald: { border: 'border-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-600', glow: 'shadow-[0_0_50px_rgba(16,185,129,0.3)]', badge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
    crimson: { border: 'border-red-500', text: 'text-red-500', bg: 'bg-red-600', glow: 'shadow-[0_0_50px_rgba(239,68,68,0.3)]', badge: 'bg-red-500/10 border-red-500/30 text-red-500' },
    monochrome: { border: 'border-neutral-300', text: 'text-white', bg: 'bg-white text-black', glow: 'shadow-[0_0_50px_rgba(255,255,255,0.2)]', badge: 'bg-white/10 border-white/20 text-neutral-300' }
  }[themeMode];

  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const tempGazetteId = `GAZ-2026-${Math.floor(10000 + Math.random() * 90000)}`;

  return (
    <div className="w-full flex flex-col space-y-16 py-8 bg-grid-pattern animate-fadeIn">
      {/* 1. MARQUEE ANNOUNCEMENT BAR */}
      <div className="w-full overflow-hidden bg-primary border-t border-b border-bronze/40 py-3 relative select-none">
        <div className="animate-marquee whitespace-nowrap flex gap-10 text-[11px] font-mono uppercase font-black tracking-widest text-bronze">
          <span>🚨 CJP Protest: Chalo Sansad March Active ✊</span>
          <span>•</span>
          <span>Dharmendra Pradhan Must Resign! 📢</span>
          <span>•</span>
          <span>Dismantle NTA (National Testing Agency) 🏛️</span>
          <span>•</span>
          <span>2.4 Million NEET Aspirants Demand Justice 🎓</span>
          <span>•</span>
          <span>Underground Delegate Sabha Floor Online 🪳</span>
          <span>•</span>
          <span>CJP Protest: Chalo Sansad March Active ✊</span>
          <span>•</span>
          <span>Dharmendra Pradhan Must Resign! 📢</span>
          <span>•</span>
          <span>Dismantle NTA (National Testing Agency) 🏛️</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 w-full space-y-20">

        {/* 2. HERO SECTION GRID */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center text-left py-6">
          {/* Left Column: Hero Content & CTAs */}
          <div className="lg:col-span-7 space-y-7">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-black text-red-500 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span>CJP Student Satyagraha Movement</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-primary uppercase leading-[1.05] font-sans">
                NEET LEAKED.<br />
                NTA SOLD OUT.<br />
                <span className="text-red-500 block mt-1">PRADHAN RESIGN!</span>
              </h1>
              <p className="text-base sm:text-lg text-secondary/90 max-w-2xl leading-relaxed font-medium font-sans">
                The National Testing Agency (NTA) has compromised the future of 24 lakh Indian students. The Cockroach Janta Party (CJP) is mobilising India's youth and GenZ to demand the immediate resignation of Union Education Minister Dharmendra Pradhan and the complete restructuring of national examination systems.
              </p>
            </div>

            {/* PROTEST TARGET PROFILE */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-5 bg-card border-2 border-red-500/30 rounded-[20px] shadow-sm max-w-xl">
              <img
                src="/dharmendra_pradhan.png"
                alt="Union Minister of Education Dharmendra Pradhan"
                className="w-24 h-24 rounded-xl object-cover border-2 border-red-500 shrink-0 shadow-sm"
              />
              <div className="space-y-1.5 text-left">
                <span className="text-[10px] font-mono font-black text-red-500 uppercase tracking-widest block">PROTEST TARGET</span>
                <h3 className="text-lg font-black text-primary uppercase">Dharmendra Pradhan</h3>
                <p className="text-xs text-secondary font-semibold font-mono">Union Minister of Education, Government of India</p>
                <p className="text-[11px] text-secondary/80 leading-relaxed font-sans font-medium">
                  Accountable for NTA NEET-UG paper leaks and systemic exam corruption. Demanded to step down immediately by 2.4 million student delegates.
                </p>
              </div>
            </div>

            {/* LIVE PROTEST INDICATORS */}
            <div className="grid grid-cols-3 gap-4 max-w-lg">
              <div className="bg-card border border-red-500/35 rounded-[18px] p-4 text-center space-y-1 shadow-sm">
                <span className="text-3xl sm:text-4xl font-black text-red-500 block leading-none">2.4M</span>
                <span className="text-[10px] text-secondary/80 font-mono font-bold uppercase tracking-wider block mt-1">Aspirants Betrayed</span>
              </div>
              <div className="bg-card border border-bronze/35 rounded-[18px] p-4 text-center space-y-1 shadow-sm">
                <span className="text-3xl sm:text-4xl font-black text-bronze block leading-none">47+</span>
                <span className="text-[10px] text-secondary/80 font-mono font-bold uppercase tracking-wider block mt-1">NTA Officials Axed</span>
              </div>
              <div className="bg-card border border-primary/20 rounded-[18px] p-4 text-center space-y-1 shadow-sm">
                <span className="text-3xl sm:text-4xl font-black text-primary block leading-none">98%</span>
                <span className="text-[10px] text-secondary/80 font-mono font-bold uppercase tracking-wider block mt-1">GenZ Support</span>
              </div>
            </div>

            {/* ACTION BUTTONS IN BODY */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="#gazette-creator"
                className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-black py-3.5 px-6 rounded-button text-xs transition-all shadow-md hover:scale-[1.02] uppercase tracking-wider"
              >
                <span>📜 Issue Protest Gazette Card</span>
                <ArrowRight size={15} />
              </a>

              <button
                onClick={() => navigate('/feed')}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-background font-black py-3.5 px-6 rounded-button text-xs transition-all shadow-md hover:scale-[1.02] uppercase tracking-wider border border-bronze/50"
              >
                <span>🏛️ Enter Sabha Floor</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* Right Column: Hero Protest Graphic Illustration */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative rounded-[28px] overflow-hidden border-2 border-bronze/40 bg-card p-3.5 shadow-xl hover:border-bronze transition-all duration-300 group max-w-md w-full">
              <img
                src="/student_protest_illustration.png"
                alt="Student Satyagraha Movement Illustration"
                className="w-full h-auto rounded-[20px] object-cover border border-border group-hover:scale-[1.02] transition duration-300"
              />
              <div className="p-4 space-y-1 bg-background/90 backdrop-blur-md rounded-[16px] mt-3 border border-border text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-black text-red-500 uppercase tracking-widest">CJP YOUTH ASSEMBLY</span>
                  <span className="text-[10px] font-mono text-bronze font-bold">LIVE SATYAGRAHA</span>
                </div>
                <h4 className="text-sm font-black uppercase text-primary">2.4 Million Aspirants Reclaiming Future</h4>
                <p className="text-[11px] text-secondary font-medium leading-relaxed">
                  Official student protest movement mobilizing youth nationwide against NEET paper leaks and exam corruption.
                </p>
              </div>
            </div>
          </div>
        </section>



        {/* 3. PARLIAMENTARY GAZETTE STUDIO SECTION */}
        <section id="gazette-creator" className="pt-8 border-t border-border space-y-10 scroll-mt-20">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-black uppercase text-red-500 tracking-wider">CJP Official Petition Studio</span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-primary tracking-tight font-sans">Live Gazette Card Generator</h2>
            <p className="text-sm sm:text-base text-secondary/90 leading-relaxed font-sans font-medium">
              Generate an official Parliamentary Gazette Card to broadcast your protest. Publish it directly to the Cockroach Sabha floor, download in HD, and share it on any social media platform!
            </p>
          </div>

          <div className="bg-card border-2 border-bronze rounded-[32px] p-6 sm:p-10 shadow-2xl relative grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column: Form & Customize Controls */}
            <div className="lg:col-span-6 space-y-6 text-left">
              {publishedPost ? (
                // SUCCESS SCREEN INSIDE CREATOR
                <div className="bg-background border-2 border-emerald-500/30 rounded-[20px] p-8 space-y-6 text-center my-auto flex flex-col justify-center h-full">
                  <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
                    ✓
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-base uppercase text-primary tracking-wider font-sans">Gazette Card Sealed!</h3>
                    <p className="text-sm text-secondary/90 leading-relaxed font-medium">
                      Your protest petition has been successfully signed, stamped, and posted on the Live Sabha Floor. You can now download it and share it with the world!
                    </p>
                  </div>

                  {/* HD Download & Direct Share Buttons */}
                  <div className="space-y-4 pt-2">
                    <button
                      onClick={handleDownload}
                      disabled={downloading}
                      className="w-full bg-primary hover:opacity-90 text-background font-black py-4 rounded-button text-xs flex items-center justify-center gap-2 border border-bronze shadow-md"
                    >
                      <Download size={15} />
                      <span>{downloading ? 'Generating Ultra-HD PNG...' : 'Download Gazette PNG (4K)'}</span>
                    </button>

                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-border"></div>
                      <span className="flex-shrink mx-3 text-[9px] font-mono text-muted uppercase font-bold tracking-wider">SHARE TO SOCIAL PLATFORMS</span>
                      <div className="flex-grow border-t border-border"></div>
                    </div>

                    {/* PLATFORM SPECIFIC BUTTONS */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleShareSocial('whatsapp')}
                        className="bg-[#25D366] text-white py-3 rounded-button text-[11px] font-black transition-all hover:opacity-90 shadow-sm"
                      >
                        WhatsApp
                      </button>
                      <button
                        onClick={() => handleShareSocial('twitter')}
                        className="bg-[#1DA1F2] text-white py-3 rounded-button text-[11px] font-black transition-all hover:opacity-90 shadow-sm"
                      >
                        X / Twitter
                      </button>
                      <button
                        onClick={() => handleShareSocial('telegram')}
                        className="bg-[#0088cc] text-white py-3 rounded-button text-[11px] font-black transition-all hover:opacity-90 shadow-sm"
                      >
                        Telegram
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleWebShare}
                        className="bg-card border border-border text-primary py-3 rounded-button text-[11px] font-bold hover:bg-background transition flex items-center justify-center gap-1.5"
                      >
                        <Share2 size={13} />
                        <span>System Share</span>
                      </button>
                      <button
                        onClick={handleCopyLink}
                        className="bg-card border border-border text-primary py-3 rounded-button text-[11px] font-bold hover:bg-background transition flex items-center justify-center gap-1.5"
                      >
                        <Copy size={13} />
                        <span>Copy Link</span>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleResetCreator}
                    className="w-full text-center text-xs font-bold text-bronze hover:underline pt-2"
                  >
                    ← Issue Another Protest Gazette Card
                  </button>
                </div>
              ) : (
                // GAZETTE DRAFT FORM
                <form onSubmit={handleSealAndPublish} className="space-y-5">
                  {/* COMPULSORY PETITIONER NAME */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono font-black text-red-500 uppercase tracking-wider">
                      👤 Petitioner Name (Compulsory)
                    </label>
                    <input
                      type="text"
                      value={petitionerName}
                      onChange={(e) => setPetitionerName(e.target.value)}
                      placeholder="Enter your name to be printed on Card"
                      required
                      className="w-full bg-background border border-red-500 rounded-[10px] p-3 text-xs text-primary font-bold focus:outline-none focus:ring-1 focus:ring-red-500 transition"
                    />
                  </div>

                  {/* QUICK DEMAND CHIPS */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-black text-bronze uppercase tracking-wider block">QUICK SELECT TITLE & DEMANDS</span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setPetitionType("📜 Resignation of Education Minister Dharmendra Pradhan");
                          setDemandContent("We hereby petition the Parliament for immediate accountability, dismantling of NTA, and the resignation of Education Minister Dharmendra Pradhan over NEET-UG leaks.");
                        }}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase border transition-all ${
                          petitionType === "📜 Resignation of Education Minister Dharmendra Pradhan"
                            ? "bg-red-500 text-white border-red-500 shadow-sm"
                            : "bg-card text-secondary border-border hover:border-bronze"
                        }`}
                      >
                        ✊ Resign
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPetitionType("📜 CJP Chalo Sansad Petition: Re-conduct NEET-UG under Judicial Probe");
                          setDemandContent("We demand a complete judicial probe into exam rigging and the immediate re-conduct of the NEET-UG examination for all affected students.");
                        }}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase border transition-all ${
                          petitionType === "📜 CJP Chalo Sansad Petition: Re-conduct NEET-UG under Judicial Probe"
                            ? "bg-red-500 text-white border-red-500 shadow-sm"
                            : "bg-card text-secondary border-border hover:border-bronze"
                        }`}
                      >
                        🏛 Chalo Sansad
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPetitionType("📜 Complete Overhaul & Dismantling of NTA (National Testing Agency)");
                          setDemandContent("The National Testing Agency has repeatedly failed. We call for the complete dismantling of NTA and restructuring under public academic control.");
                        }}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase border transition-all ${
                          petitionType === "📜 Complete Overhaul & Dismantling of NTA (National Testing Agency)"
                            ? "bg-red-500 text-white border-red-500 shadow-sm"
                            : "bg-card text-secondary border-border hover:border-bronze"
                        }`}
                      >
                        🚨 NTA Overhaul
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPetitionType("✍ Custom");
                          setDemandContent("Enter custom demands here...");
                        }}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase border transition-all ${
                          petitionType.includes("Custom") || petitionType.includes("✍")
                            ? "bg-red-500 text-white border-red-500 shadow-sm"
                            : "bg-card text-secondary border-border hover:border-bronze"
                        }`}
                      >
                        ✍ Custom
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-black uppercase text-bronze tracking-wider block">STEP 1: CHOOSE TARGET DEMAND</span>
                    <select
                      value={petitionType}
                      onChange={(e) => setPetitionType(e.target.value)}
                      className="w-full bg-background border border-border rounded-[10px] p-3 text-xs text-primary font-extrabold focus:outline-none focus:border-bronze"
                    >
                      {gazettePetitionTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {petitionType.includes('Custom') && (
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase text-secondary font-mono tracking-wider">Custom Gazette Title</label>
                      <input
                        type="text"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        placeholder="e.g. Demanding Immediate NTA Restructuring Act"
                        required
                        className="w-full bg-background border border-border rounded-[10px] p-3 text-xs text-primary focus:outline-none focus:border-bronze transition"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-black uppercase text-bronze tracking-wider block">STEP 2: DEMANDS & STATEMENT</span>
                    <textarea
                      value={demandContent}
                      onChange={(e) => setDemandContent(e.target.value)}
                      rows={3}
                      maxLength={180}
                      placeholder="Write your unfiltered statement..."
                      className="w-full bg-background border border-border rounded-[10px] p-3 text-xs text-primary focus:outline-none focus:border-bronze resize-none leading-relaxed transition"
                    />
                    <div className="text-right text-[10px] text-muted font-mono">
                      {demandContent.length}/180 chars
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono font-black uppercase text-bronze block tracking-wider">PETITIONER TITLE</span>
                      <input
                        type="text"
                        value={delegateTitle}
                        onChange={(e) => setDelegateTitle(e.target.value)}
                        placeholder="e.g. NEET Aspirant MP"
                        className="w-full bg-background border border-border rounded-[10px] p-3 text-xs text-primary focus:outline-none focus:border-bronze transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono font-black uppercase text-bronze block tracking-wider">OFFICIAL SEAL</span>
                      <select
                        value={stampType}
                        onChange={(e) => setStampType(e.target.value)}
                        className="w-full bg-background border border-border rounded-[10px] p-3 text-xs text-primary focus:outline-none focus:border-bronze"
                      >
                        {gazetteStamps.map((s) => (
                          <option key={s} value={s}>{s.split(' ')[0]} SEAL</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-black uppercase text-bronze tracking-wider block">STEP 3: POSTER STYLING</span>
                    <div className="grid grid-cols-4 gap-1.5 p-1.5 bg-background border border-border rounded-[10px] text-[10px] font-bold text-center">
                      <button
                        type="button"
                        onClick={() => setThemeMode('crimson')}
                        className={`py-2 rounded-[7px] transition-all ${themeMode === 'crimson' ? 'bg-red-500 text-white shadow-sm font-black' : 'text-secondary hover:text-primary'}`}
                      >
                        🚨 Crimson
                      </button>
                      <button
                        type="button"
                        onClick={() => setThemeMode('gold')}
                        className={`py-2 rounded-[7px] transition-all ${themeMode === 'gold' ? 'bg-bronze text-white shadow-sm font-black' : 'text-secondary hover:text-primary'}`}
                      >
                        👑 Imperial
                      </button>
                      <button
                        type="button"
                        onClick={() => setThemeMode('emerald')}
                        className={`py-2 rounded-[7px] transition-all ${themeMode === 'emerald' ? 'bg-emerald-600 text-white shadow-sm font-black' : 'text-secondary hover:text-primary'}`}
                      >
                        🏛 Eco
                      </button>
                      <button
                        type="button"
                        onClick={() => setThemeMode('monochrome')}
                        className={`py-2 rounded-[7px] transition-all ${themeMode === 'monochrome' ? 'bg-primary text-background shadow-sm font-black' : 'text-secondary hover:text-primary'}`}
                      >
                        📜 Brutalist
                      </button>
                    </div>
                  </div>

                  {/* Photo attachment option */}
                  <div className="space-y-1.5">
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
                      className="w-full bg-background border border-dashed border-bronze/45 text-bronze hover:bg-card py-3 rounded-[10px] transition text-xs font-black flex items-center justify-center gap-1.5"
                    >
                      <ImageIcon size={14} />
                      <span>{imagePreview ? '✓ Evidence Photo Attached' : 'Attach Protest Photo / Evidence'}</span>
                    </button>
                  </div>

                  {/* INLINE AUTHENTICATION SUB-WIDGET */}
                  {!user && (
                    <div className="p-4.5 bg-background border border-bronze/35 rounded-[18px] space-y-4">
                      <div className="flex items-center justify-between border-b border-border pb-2.5">
                        <span className="text-[10px] font-mono font-black text-bronze uppercase flex items-center gap-1.5 tracking-wider">
                          <Lock size={12} />
                          <span>DELEGATE PASS (100% OPTIONAL)</span>
                        </span>
                        <div className="flex gap-2 text-[10px]">
                          <button
                            type="button"
                            onClick={() => setInlineAuthMode('signup')}
                            className={`font-black ${inlineAuthMode === 'signup' ? 'text-red-500 underline' : 'text-muted'}`}
                          >
                            New Sign Up
                          </button>
                          <span>|</span>
                          <button
                            type="button"
                            onClick={() => setInlineAuthMode('login')}
                            className={`font-black ${inlineAuthMode === 'login' ? 'text-red-500 underline' : 'text-muted'}`}
                          >
                            Log In
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <input
                            type="text"
                            value={inlineEmail}
                            onChange={(e) => setInlineEmail(e.target.value)}
                            placeholder="Email / Phone (Optional)"
                            className="w-full bg-card border border-border rounded-[8px] p-2.5 text-xs text-primary focus:outline-none focus:border-bronze transition"
                          />
                        </div>
                        <div>
                          <input
                            type="password"
                            value={inlinePassword}
                            onChange={(e) => setInlinePassword(e.target.value)}
                            placeholder="Password (Optional)"
                            className="w-full bg-card border border-border rounded-[8px] p-2.5 text-xs text-primary focus:outline-none focus:border-bronze transition"
                          />
                        </div>
                      </div>

                      {inlineAuthMode === 'signup' && (
                        <div>
                          <input
                            type="text"
                            value={inlineUsername}
                            onChange={(e) => setInlineUsername(e.target.value)}
                            placeholder="Custom Handle (Optional)"
                            className="w-full bg-card border border-border rounded-[8px] p-2.5 text-xs text-primary focus:outline-none focus:border-bronze transition"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Publish action button */}
                  <button
                    type="submit"
                    disabled={publishing}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-button text-xs transition flex items-center justify-center gap-2 border border-red-600 shadow-md disabled:opacity-50"
                  >
                    <span>✊ {publishing ? 'Sealing Gazette Notification...' : 'Seal & Publish Gazette Card'}</span>
                  </button>
                </form>
              )}
            </div>

            {/* Right Column: Live Poster Preview Render Frame */}
            <div className="lg:col-span-6 flex flex-col justify-center items-center relative">
              <span className="text-[10px] font-mono font-bold tracking-widest text-bronze uppercase mb-3">
                LIVE PETITION CARD NOTIFICATION
              </span>

              {/* CARD CONTAINER CANVAS */}
              <div
                ref={posterRef}
                className={`w-full max-w-[370px] rounded-[24px] p-7 text-white space-y-5 relative flex flex-col justify-between border-4 bg-[#0a0a0a] transition-all duration-300 ${themeStyles.border} ${themeStyles.glow}`}
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                {/* GAZETTE HEADER */}
                <div className={`pb-4 space-y-2.5 text-center border-b-2 ${themeStyles.border}`}>
                  <div className="flex items-center justify-center gap-2.5">
                    <span className="text-3xl">🪳</span>
                    <span className="font-black text-xl sm:text-2xl tracking-[0.15em] uppercase text-white" style={{ fontFamily: 'Cinzel, serif' }}>
                      COCKROACH SABHA
                    </span>
                  </div>

                  <div className={`flex items-center justify-center gap-1 text-[10px] font-mono font-black uppercase tracking-[0.25em] ${themeStyles.text}`}>
                    <span>• OFFICIAL PROTEST NOTIFICATION •</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-[#CCCCCC] pt-2 border-t border-[#292929]">
                    <span>NO: #{tempGazetteId}</span>
                    <span>DATE: {formattedDate}</span>
                  </div>
                </div>

                {/* PETITION TITLE BADGE */}
                <div className="space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-mono font-black uppercase tracking-wider ${themeStyles.text}`}>
                      📜 CITIZEN PETITION / MOTION
                    </span>
                    <span className="text-[9px] text-emerald-400 font-mono font-bold uppercase tracking-wider">Verified Live</span>
                  </div>

                  <div className={`p-3.5 rounded-[12px] bg-[#121212] border-l-4 ${themeStyles.border}`}>
                    <h4 className="font-extrabold text-sm sm:text-[15px] text-white uppercase tracking-wide leading-snug" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {petitionType.includes('Custom') ? (customTitle || 'Citizen Petition Motion') : petitionType}
                    </h4>
                  </div>
                </div>

                {/* STATEMENT OF DEMANDS */}
                <div className="p-4 rounded-[12px] bg-[#121212] border border-[#292929] space-y-2 text-left">
                  <span className="text-[10px] text-[#A1A1AA] font-mono uppercase font-black tracking-wider block">DECREE & STATEMENT OF DEMANDS:</span>
                  <p className="text-sm font-semibold text-neutral-100 leading-relaxed font-sans">
                    "{demandContent}"
                  </p>
                </div>

                {/* EVIDENCE IMAGE (IF ATTACHED) */}
                {imagePreview && (
                  <div className="rounded-[12px] overflow-hidden border border-[#292929] max-h-40 bg-black flex items-center justify-center">
                    <img src={imagePreview} alt="Evidence" className="w-full h-auto max-h-40 object-contain rounded-[12px]" />
                  </div>
                )}

                {/* PETITIONER & STAMP FOOTER */}
                <div className={`pt-4 flex items-center justify-between text-[10px] font-mono text-[#CCCCCC] border-t-2 ${themeStyles.border}`}>
                  <div className="text-left space-y-1">
                    <p className="text-white font-black uppercase text-[11px] tracking-wide" style={{ fontFamily: 'Cinzel, serif' }}>
                      🪳 {petitionerName || '[ENTER PETITIONER NAME]'}
                    </p>
                    <p className={`font-bold text-[9px] tracking-wider ${themeStyles.text}`}>
                      cockroachsabha.com
                    </p>
                  </div>

                  <div className={`px-3 py-2 rounded-[8px] uppercase font-black text-[9px] tracking-widest border-2 flex items-center gap-0.5 bg-[#121212] ${themeStyles.border} ${themeStyles.text}`}>
                    <span>{stampType.split(' ')[0]}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 4. LOGICAL FACTS & SCANDAL CHARGE SHEET */}
        <section className="pt-8 border-t border-border space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-black uppercase text-red-500 tracking-wider">Documented Evidence & Irrefutable Anomalies</span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-primary tracking-tight font-sans">NTA & Govt Failure Charge Sheet</h2>
            <p className="text-xs sm:text-sm text-secondary/90 leading-relaxed font-medium">
              Key admissions in the Supreme Court of India, police investigations, and official government cancellations detailing systemic negligence under Education Minister Dharmendra Pradhan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-[20px] bg-card border-2 border-red-500/25 space-y-2 text-left shadow-sm hover:border-red-500 transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black text-red-500 uppercase tracking-widest">FACT 01 • SCORE ANOMALY</span>
                <span className="text-xs text-red-500">🚨</span>
              </div>
              <h3 className="text-base font-black text-primary uppercase">Unprecedented 67 AIR-1 Perfect Scores</h3>
              <p className="text-xs text-secondary leading-relaxed font-medium">
                67 candidates scored a perfect 720/720 marks in NEET-UG 2024 (compared to 2 in 2023). 6 candidates from a single exam center in Jhajjar, Haryana shared identical consecutive roll numbers.
              </p>
            </div>

            <div className="p-5 rounded-[20px] bg-card border-2 border-bronze/30 space-y-2 text-left shadow-sm hover:border-bronze transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black text-bronze uppercase tracking-widest">FACT 02 • PAPER LEAK CONFIRMED</span>
                <span className="text-xs text-bronze">⚖️</span>
              </div>
              <h3 className="text-base font-black text-primary uppercase">Police Arrests & Recovered Burnt Papers</h3>
              <p className="text-xs text-secondary leading-relaxed font-medium">
                Bihar Police Economic Offences Unit (EOU) arrested 13 individuals in Patna. Confession statements confirmed candidates received pre-solved question papers 24 hours before the exam for ₹30-40 Lakhs.
              </p>
            </div>

            <div className="p-5 rounded-[20px] bg-card border-2 border-bronze/30 space-y-2 text-left shadow-sm hover:border-bronze transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black text-bronze uppercase tracking-widest">FACT 03 • NATIONAL CANCELLED EXAMS</span>
                <span className="text-xs text-bronze">📢</span>
              </div>
              <h3 className="text-base font-black text-primary uppercase">UGC-NET Cancelled & NEET-PG Postponed</h3>
              <p className="text-xs text-secondary leading-relaxed font-medium">
                UGC-NET was scrapped within 24 hours of conduct after MHA confirmed darknet paper leaks. NEET-PG was postponed 12 hours prior to conduct, stranding 2 Lakh doctors across test centers.
              </p>
            </div>

            <div className="p-5 rounded-[20px] bg-card border-2 border-red-500/25 space-y-2 text-left shadow-sm hover:border-red-500 transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black text-red-500 uppercase tracking-widest">FACT 04 • SUPREME COURT SCROLL</span>
                <span className="text-xs text-red-500">🏛️</span>
              </div>
              <h3 className="text-base font-black text-primary uppercase">Arbitrary Grace Marks Withdrawn</h3>
              <p className="text-xs text-secondary leading-relaxed font-medium">
                Under Supreme Court questioning, NTA admitted its secret formula awarding 'grace marks' to 1,563 candidates lacked statutory provision, forcing them to cancel the grace marks.
              </p>
            </div>
          </div>
        </section>

      </div>

      {/* Secret Recovery Key Modal */}
      {showRecoveryModal && (
        <div className="fixed inset-0 bg-background/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
              }}
              className="w-full bg-primary hover:bg-primary/95 text-background text-xs font-black uppercase py-3 rounded-[12px] transition"
            >
              I Have Saved My Key
            </button>
          </div>
        </div>
      )}

      {/* PREMIUM CAMPAIGN FOOTER */}
      <footer className="border-t border-border pt-12 pb-8 max-w-6xl mx-auto px-6 w-full space-y-8 text-left">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Col 1: Platform Overview */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🪳</span>
              <span className="font-black text-base tracking-wider uppercase text-primary">COCKROACH SABHA</span>
            </div>
            <p className="text-xs text-secondary/80 leading-relaxed font-medium">
              An underground, zero-trust digital satyagraha platform for India's student community. Demanding immediate accountability for NTA exam leaks and structural systemic reforms.
            </p>
          </div>

          {/* Col 2: Campaign Credits */}
          <div className="md:col-span-4 space-y-3">
            <span className="text-[10px] font-mono font-black text-red-500 uppercase tracking-widest block">CAMPAIGN LEADERSHIP</span>
            <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-[14px] space-y-2">
              <p className="text-xs text-secondary/90 leading-relaxed font-bold">
                CJP NEET Protest Campaign is organized and led by:
              </p>
              <a
                href="https://x.com/CEO_chintu"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-black text-red-500 hover:text-red-600 transition bg-white border border-red-500/20 px-3 py-1.5 rounded-button shadow-sm"
              >
                <span>𝕏</span>
                <span>CEO Chintu (@CEO_chintu)</span>
              </a>
            </div>
          </div>

          {/* Col 3: Standing Rules */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-[10px] font-mono font-black text-bronze uppercase tracking-widest block">SABHA RULES</span>
            <ul className="text-xs text-secondary/80 space-y-1.5 font-mono font-bold uppercase">
              <li>• 100% Anonymous</li>
              <li>• Zero Clout / No Follows</li>
              <li>• Unfiltered Student Debates</li>
            </ul>
          </div>
        </div>

        {/* Copyright Lower Bar */}
        <div className="border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted gap-4">
          <p>© 2026 Cockroach Sabha. Campaign organized under CJP Student Satyagraha.</p>
          <div className="flex gap-4 font-bold text-secondary">
            <a href="https://x.com/CEO_chintu" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
              𝕏 Twitter
            </a>
            <span>•</span>
            <span className="text-bronze">NEET Protest Floor</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
