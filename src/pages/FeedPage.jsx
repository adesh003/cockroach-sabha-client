import React, { useState, useEffect, useRef } from 'react';
import PostCard from '../components/PostCard';
import ErrorState from '../components/ErrorState';
import { Image as ImageIcon, X, Send, Lock, Sparkles, Building, Award } from 'lucide-react';
import { categories, politicalHouses } from '../constants/categories';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function FeedPage({ onOpenCreatePost, selectedCategory = 'All' }) {
  const { user, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Expanded Inline Tweet Box States
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = selectedCategory === 'All'
        ? '/api/posts'
        : `/api/posts?category=${encodeURIComponent(selectedCategory)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setPosts(data);
      } else {
        setError(data.error || 'Unable to fetch motions from Sabha Floor');
      }
    } catch (err) {
      setError('Connection failed. Unable to reach the Sabha Floor server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  const processImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
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
        toast.success('Image pasted from clipboard!');
      };
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    processImageFile(file);
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          e.preventDefault();
          setIsExpanded(true);
          processImageFile(blob);
          break;
        }
      }
    }
  };

  const handleInlineSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Motion text cannot be empty');
      return;
    }

    if (!token || !user) {
      toast.error('Please sign in or register to raise a motion');
      onOpenCreatePost();
      return;
    }

    setSubmitting(true);
    try {
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({
          content,
          category: category || categories[0],
          college: politicalHouses[0],
          image: imagePreview,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Motion submitted cleanly to Sabha Floor!');
        setContent('');
        setImagePreview(null);
        setIsExpanded(false);
        fetchPosts();
      } else {
        toast.error(data.error || 'Failed to submit motion');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error submitting motion to Sabha server');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-5 max-w-xl mx-auto text-left">

      {/* EXPANDABLE INLINE TWEET-STYLE CREATE MOTION BOX */}
      <div
        className={`bg-card border-2 transition-all duration-300 rounded-[18px] p-4 shadow-lg text-left ${isExpanded
          ? 'border-bronze ring-2 ring-bronze/30 shadow-[0_0_40px_rgba(154,107,50,0.2)]'
          : 'border-border hover:border-bronze/80 cursor-pointer'
          }`}
        onClick={() => {
          if (!isExpanded) setIsExpanded(true);
        }}
      >
        <div className="flex items-start gap-3">
          <img
            src={user?.avatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=guest'}
            alt="Avatar"
            className="w-10 h-10 rounded-full bg-background border border-bronze shrink-0"
          />

          <div className="flex-1 space-y-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              onPaste={handlePaste}
              placeholder="What's your rant or motion, Delegate? (Tip: You can paste images directly with Ctrl+V)"
              rows={isExpanded ? 4 : 1}
              className="w-full bg-transparent text-sm text-primary placeholder-muted focus:outline-none resize-none font-sans leading-relaxed"
            />

            {/* ATTACHED IMAGE PREVIEW */}
            {imagePreview && (
              <div className="relative rounded-[12px] overflow-hidden border border-border bg-background max-h-48 flex items-center justify-center">
                <img src={imagePreview} alt="Preview" className="w-full h-auto max-h-48 object-contain rounded-[12px]" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 bg-black/80 text-white p-1.5 rounded-full hover:bg-red-600 transition"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* EXPANDED CONTROLS & OPTIONS */}
            {isExpanded ? (
              <div className="space-y-3 border-t border-border pt-3 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-bronze mb-1 font-mono">
                      Select Committee
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-background border border-border rounded-[8px] p-2 text-xs text-primary focus:outline-none focus:border-bronze"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat} className="bg-card text-primary">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-bronze mb-1 font-mono">
                      Parliamentary House / Bench
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="flex items-center gap-1.5 text-xs text-bronze hover:text-primary bg-background border border-bronze/40 px-3 py-1.5 rounded-[8px] transition font-bold"
                    >
                      <ImageIcon size={14} />
                      <span>Attach Photo</span>
                    </button>
                    <span className="text-[10px] text-muted font-mono hidden sm:inline">• 100% Anonymous</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(false);
                      }}
                      className="text-xs text-muted hover:text-primary px-3 py-1.5 rounded-[8px]"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleInlineSubmit}
                      disabled={submitting || !content.trim()}
                      className="bg-primary text-background font-black text-xs px-5 py-1.5 rounded-[9px] hover:opacity-90 transition border border-bronze shadow-md disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Send size={13} />
                      <span>{submitting ? 'Submitting...' : 'Raise Motion'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between border-t border-border pt-2.5">
                <div className="flex items-center gap-2 text-xs text-bronze font-mono font-bold">
                  <span>➕ Attach Image</span>
                  <span className="text-muted font-normal">• 100% Anonymous</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(true);
                  }}
                  className="bg-primary text-background font-black text-xs px-4 py-1.5 rounded-[9px] hover:opacity-90 transition border border-bronze"
                >
                  Raise Motion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* COMMITTEE HEADER */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏛</span>
          <div>
            <h1 className="text-base font-black tracking-tight text-primary uppercase leading-none">Sabha Floor</h1>
            <p className="text-[11px] text-bronze font-mono mt-1 font-bold">
              {selectedCategory === 'All' ? 'All Motions & Debates' : `Committee: ${selectedCategory}`}
            </p>
          </div>
        </div>
        <span className="text-xs text-muted font-mono">{posts.length} Motions</span>
      </div>

      {/* FEED CONTENT */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-[12px] p-5 space-y-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-border"></div>
                <div className="h-4 bg-border rounded w-1/3"></div>
              </div>
              <div className="h-12 bg-border rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState
          title="Sabha Connection Error"
          message={error}
          onRetry={fetchPosts}
          showHomeButton={false}
        />
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-[12px] p-6 space-y-3">
          <div className="text-3xl mb-1">🪳</div>
          <p className="text-secondary text-sm font-medium">No motions raised in this committee yet.</p>
          <button
            onClick={() => setIsExpanded(true)}
            className="text-xs text-bronze font-bold underline hover:text-primary transition"
          >
            Be the first delegate to raise a motion →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onReportSubmitted={fetchPosts} />
          ))}
        </div>
      )}
    </div>
  );
}
