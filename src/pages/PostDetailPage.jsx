import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import ErrorState from '../components/ErrorState';
import AuthModal from '../components/AuthModal';

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const fetchPostDetail = async () => {
    setError(null);
    try {
      const res = await fetch(`/api/posts/${id}`);
      const data = await res.json();
      if (res.ok) {
        setPost(data);
      } else {
        setError(data.error || "This chamber or motion doesn't exist on the Sabha Floor.");
      }
    } catch (err) {
      setError("Unable to connect to Sabha Floor server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostDetail();
  }, [id]);

  const sarcasticToasts = [
    "Trying to vote without a Delegate Pass? Register on Cockroach Sabha first! 🪳",
    "Shouting from the visitor gallery is easy! Sign in to step onto the Sabha Floor! 🏛",
    "Show your Delegate Pass before joining the debate! 📜",
    "Running for election without filing nomination papers? Login first! 🗳"
  ];

  const getRandomToast = () => sarcasticToasts[Math.floor(Math.random() * sarcasticToasts.length)];

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!token || !user) {
      toast.error(getRandomToast());
      setIsAuthModalOpen(true);
      return;
    }
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({ postId: id, content: commentText }),
      });
      if (res.ok) {
        toast.success('Argument submitted to floor.');
        setCommentText('');
        fetchPostDetail();
      } else {
        toast.error('Failed to submit argument');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-[#71717A] space-y-2">
        <div className="text-2xl animate-bounce">🪳</div>
        <p>Entering chamber...</p>
      </div>
    );
  }

  if (!post || error) {
    return (
      <ErrorState
        title="Chamber Not Found"
        message={error || "This motion or chamber doesn't exist on the Sabha Floor."}
        onRetry={fetchPostDetail}
      />
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-xl mx-auto">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-xs text-[#A1A1AA] hover:text-white transition"
      >
        <ArrowLeft size={16} />
        <span>Return to Sabha Floor</span>
      </button>

      {/* MOTION CONTAINER */}
      <div className="bg-[#171717] border border-[#292929] rounded-[12px] p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#0B0B0B] border border-[#9A6B32]/40 flex items-center justify-center font-bold text-sm text-white">
            🪳
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-white">{post.user?.anonymousName}</span>
              <span className="text-[10px] bg-[#0B0B0B] text-[#9A6B32] border border-[#9A6B32]/30 px-2 py-0.5 rounded-full font-mono">
                {post.category}
              </span>
            </div>
            {post.college && (
              <p className="text-[11px] text-[#71717A]">{post.college}</p>
            )}
          </div>
        </div>

        <p className="text-sm text-white leading-relaxed">{post.content}</p>

        {post.image && (
          <div className="rounded-[10px] overflow-hidden border border-[#292929] bg-[#0B0B0B] flex items-center justify-center max-h-[550px]">
            <img src={post.image} alt="Attachment" className="w-full h-auto max-h-[550px] object-contain rounded-[10px]" />
          </div>
        )}
      </div>

      {/* ARGUMENTS SECTION */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-white flex items-center gap-2">
          <MessageSquare size={15} className="text-[#9A6B32]" />
          <span>Arguments ({post.comments?.length || 0})</span>
        </h3>

        {/* ADD ARGUMENT INPUT */}
        <form onSubmit={handleAddComment} className="flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="State your counter argument..."
            className="flex-1 bg-[#171717] border border-[#292929] rounded-[10px] px-3 py-2 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#9A6B32]"
          />
          <button
            type="submit"
            disabled={submitting || !commentText.trim()}
            className="bg-white text-black font-bold text-xs px-4 py-2 rounded-[10px] hover:bg-neutral-200 transition disabled:opacity-50 flex items-center gap-1 border border-[#9A6B32]/30"
          >
            <Send size={12} />
            <span>Argue</span>
          </button>
        </form>

        {/* ARGUMENTS LIST */}
        <div className="space-y-3 pt-2">
          {post.comments?.length === 0 ? (
            <p className="text-xs text-[#71717A] italic py-2">No arguments yet. Start the debate.</p>
          ) : (
            post.comments?.map((comment) => (
              <div key={comment.id} className="bg-[#171717]/80 border border-[#292929] rounded-[10px] p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#A1A1AA]">🪳 {comment.user?.anonymousName || 'Delegate'}</span>
                  <span className="text-[10px] text-[#71717A] font-mono">{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-xs text-neutral-200 leading-normal">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
}
