import React from 'react';
import { AlertTriangle, RefreshCw, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ErrorState({ title = "Access Restricted", message = "You do not have permission to access this chamber.", onRetry, showHomeButton = true }) {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-md mx-auto my-12 text-center bg-[#171717] border border-red-500/30 rounded-[12px] shadow-2xl space-y-4">
      <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto text-xl">
        <ShieldAlert size={24} />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-extrabold uppercase text-white tracking-wide">{title}</h3>
        <p className="text-xs text-[#A1A1AA] leading-relaxed">{message}</p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-[8px] text-xs font-semibold bg-[#292929] text-white hover:bg-[#333] transition flex items-center gap-1.5 border border-[#333]"
          >
            <RefreshCw size={13} />
            <span>Try Again</span>
          </button>
        )}

        {showHomeButton && (
          <button
            onClick={() => navigate('/feed')}
            className="px-4 py-2 rounded-[8px] text-xs font-bold bg-white text-black hover:bg-neutral-200 transition flex items-center gap-1.5 border border-[#9A6B32]/40"
          >
            <ArrowLeft size={13} />
            <span>Return to Sabha Floor</span>
          </button>
        )}
      </div>
    </div>
  );
}
