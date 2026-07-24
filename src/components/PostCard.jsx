import React, { useState } from 'react';
import { MessageSquare, Flag, Building, ThumbsUp, Share2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import AuthModal from './AuthModal';
import ExportGazetteModal from './ExportGazetteModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';

export default function PostCard({ post, onReportSubmitted, onDelete }) {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [supported, setSupported] = useState(false);
  const [supportCount, setSupportCount] = useState(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isGazetteOpen, setIsGazetteOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const sarcasticToasts = [
    "Trying to vote without a Delegate Pass? Register on Cockroach Sabha first! 🪳",
    "Shouting from the visitor gallery is easy! Sign in to step onto the Sabha Floor! 🏛",
    "Show your Delegate Pass before joining the debate! 📜",
    "Running for election without filing nomination papers? Login first! 🗳"
  ];

  const getRandomToast = () => sarcasticToasts[Math.floor(Math.random() * sarcasticToasts.length)];

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      const authHeader = token?.startsWith('Bearer ') ? token : `Bearer ${token}`;
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': authHeader },
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Motion withdrawn from Sabha Floor');
        setIsDeleteModalOpen(false);
        if (onDelete) onDelete(post.id);
        else if (onReportSubmitted) onReportSubmitted();
      } else {
        toast.error(data.error || 'Failed to delete motion');
      }
    } catch (err) {
      toast.error('Error connecting to Sabha server');
    } finally {
      setDeleting(false);
    }
  };

  const handleSupport = (e) => {
    e.stopPropagation();
    if (!token || !user) {
      toast.error(getRandomToast());
      setIsAuthModalOpen(true);
      return;
    }
    if (supported) {
      setSupportCount(prev => prev - 1);
      setSupported(false);
      toast.info('Support withdrawn');
    } else {
      setSupportCount(prev => prev + 1);
      setSupported(true);
      toast.success('Support recorded on floor');
    }
  };

  const handleReport = (e) => {
    e.stopPropagation();
    if (!token || !user) {
      toast.error(getRandomToast());
      setIsAuthModalOpen(true);
      return;
    }
    toast.success('Objection filed to Speaker\'s Office');
    if (onReportSubmitted) onReportSubmitted();
  };

  const handleCommentClick = (e) => {
    e.stopPropagation();
    navigate(`/posts/${post.id}`);
  };

  const formattedDate = new Date(post.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <>
      <div
        onClick={() => {
          navigate(`/posts/${post.id}`);
        }}
        className="bg-card border border-border rounded-[12px] p-5 hover:border-bronze/60 transition cursor-pointer space-y-3 shadow-sm text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-background border border-bronze/40 flex items-center justify-center font-bold text-xs text-primary">
              🪳
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-primary">{post.user?.anonymousName || 'Delegate Cockroach'}</span>
                <span className="text-[10px] bg-background text-bronze border border-bronze/30 px-2 py-0.5 rounded-full font-mono">
                  {post.category}
                </span>
              </div>
              {post.college && (
                <div className="flex items-center gap-1 text-[11px] text-muted mt-0.5">
                  <Building size={11} />
                  <span>{post.college}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted font-mono">{formattedDate}</span>
            {/* SUBTLE UN-OBVIOUS TRASH ICON IN TOP-RIGHT FOR AUTHOR OR ADMIN */}
            {user && (user.id === post.userId || user.id === post.user?.id || user.role === 'ADMIN') && (
              <button
                onClick={handleDeleteClick}
                title="Delete Motion"
                className="text-muted hover:text-red-400 p-1.5 rounded-md hover:bg-background transition"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-primary leading-relaxed font-sans font-medium whitespace-pre-wrap">
          {post.content}
        </p>

        {post.image && (
          <div className="rounded-[10px] overflow-hidden border border-border max-h-60 bg-background flex items-center justify-center">
            <img src={post.image} alt="Attachment" className="w-full h-auto max-h-60 object-contain rounded-[10px]" />
          </div>
        )}

        {/* FOOTER ACTIONS */}
        <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-border/50">
          <div className="flex items-center gap-4">
            <button
              onClick={handleSupport}
              className={`flex items-center gap-1.5 transition ${
                supported ? 'text-bronze font-bold' : 'hover:text-primary'
              }`}
            >
              <ThumbsUp size={14} />
              <span>🏛 Support ({supportCount})</span>
            </button>

            <button
              onClick={handleCommentClick}
              className="flex items-center gap-1.5 hover:text-primary transition"
            >
              <MessageSquare size={14} />
              <span>{post._count?.comments || 0} Arguments</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* ONLY SHOW SHARE GAZETTE BUTTON IF LOGGED-IN USER IS THE AUTHOR OF THIS POST */}
            {user && (user.id === post.userId || user.id === post.user?.id) && (
              <button 
                onClick={(e) => { e.stopPropagation(); setIsGazetteOpen(true); }}
                title="Share Official Gazette Poster" 
                className="flex items-center gap-1 hover:text-bronze transition text-[11px] font-bold text-primary bg-background border border-bronze/40 px-2.5 py-1 rounded-[6px]"
              >
                <Share2 size={12} className="text-bronze" />
                <span>Share Gazette</span>
              </button>
            )}

            <button 
              onClick={handleReport}
              title="Raise Objection" 
              className="flex items-center gap-1 hover:text-red-400 transition text-[11px]"
            >
              <Flag size={13} />
              <span>Raise Objection</span>
            </button>
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      <ExportGazetteModal
        isOpen={isGazetteOpen}
        onClose={() => setIsGazetteOpen(false)}
        post={post}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        deleting={deleting}
      />
    </>
  );
}
