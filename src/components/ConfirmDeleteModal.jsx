import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, deleting }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-card border-2 border-red-500/40 rounded-[20px] w-full max-w-sm p-6 space-y-5 shadow-[0_0_50px_rgba(239,68,68,0.25)] text-left relative animate-fadeIn">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm uppercase text-primary tracking-wider">Withdraw Motion</h3>
              <p className="text-[10px] text-red-400 font-mono">Sabha Floor Action</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-primary p-1 rounded-full hover:bg-background transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONFIRMATION MESSAGE */}
        <p className="text-xs text-secondary leading-relaxed">
          Are you sure you want to withdraw this motion from the Sabha Floor? This action cannot be undone.
        </p>

        {/* DIALOG ACTION BUTTONS */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-[9px] text-xs font-bold border border-border text-secondary hover:text-primary hover:bg-background transition"
          >
            Keep Motion
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="px-5 py-2 rounded-[9px] text-xs font-black bg-red-600 text-white hover:bg-red-500 transition border border-red-400 shadow-lg flex items-center gap-1.5 disabled:opacity-50"
          >
            <Trash2 size={14} />
            <span>{deleting ? 'Withdrawing...' : 'Yes, Withdraw'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
