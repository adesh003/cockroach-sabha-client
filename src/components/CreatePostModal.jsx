import React, { useState, useRef } from 'react';
import { X, Send, Image as ImageIcon, Plus } from 'lucide-react';
import { categories } from '../constants/categories';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function CreatePostModal({ isOpen, onClose, onPostCreated }) {
  const { user, token } = useAuth();
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const processImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
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

        const compressedBase64 = canvas.toDataURL('image/webp', 0.7);
        setImageUrl(compressedBase64);
        toast.success('Image processed and attached');
      };
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e) => {
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
          processImageFile(blob);
          break;
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Please enter Sabha as a delegate');
      return;
    }
    if (!content.trim()) {
      toast.error('Motion content cannot be empty');
      return;
    }
    if (content.length > 300) {
      toast.error('Motion exceeds 300 characters limit');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          category,
          college: user?.college || null,
          image: imageUrl || null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Motion accepted.');
        setContent('');
        setImageUrl('');
        onClose();
        if (onPostCreated) onPostCreated();
      } else {
        toast.error(data.error || 'Failed to submit motion');
      }
    } catch (err) {
      toast.error('Server connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-[12px] w-full max-w-2xl p-6 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🪳</span>
            <div>
              <h3 className="font-extrabold text-sm text-primary uppercase tracking-wider">Raise New Motion</h3>
              <p className="text-[11px] text-muted">Posting as <span className="text-bronze font-semibold">{user?.anonymousName || 'Delegate'}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted hover:text-primary p-1">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onPaste={handlePaste}
              placeholder="State your motion clearly for the Sabha Floor..."
              maxLength={300}
              rows={6}
              className="w-full bg-background border border-border rounded-[10px] p-4 text-sm text-primary placeholder-muted focus:outline-none focus:border-bronze resize-none leading-relaxed"
            />
            <div className="absolute bottom-3 right-3 text-xs text-muted">
              <span className={content.length >= 280 ? 'text-red-400 font-bold' : ''}>{content.length}</span>/300
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-secondary mb-1.5">Select Committee</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-background border border-border rounded-[10px] p-3 text-xs text-primary focus:outline-none focus:border-bronze"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-card text-primary">{cat}</option>
              ))}
            </select>
          </div>

          {/* IMAGE UPLOAD WITH LARGE POSTER BOX */}
          <div>
            <label className="block text-xs font-semibold uppercase text-secondary mb-1.5">Attach Poster / Image</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />

            {imageUrl ? (
              <div className="relative rounded-[10px] overflow-hidden border border-border h-56 bg-background flex items-center justify-center">
                <img src={imageUrl} alt="Attached Poster" className="w-full h-full object-contain" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-3 right-3 bg-black/80 text-white p-1.5 rounded-full hover:bg-red-500 transition"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-40 bg-background border border-dashed border-border hover:border-bronze rounded-[10px] p-6 flex flex-col items-center justify-center gap-2 text-xs text-secondary transition group"
              >
                <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center group-hover:border-bronze text-primary">
                  <Plus size={20} />
                </div>
                <span className="font-semibold text-primary">Click plus button to attach Poster / Image</span>
                <span className="text-[10px] text-muted">Automatic WebP compression applied (Max 10MB)</span>
              </button>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-[10px] text-xs font-semibold border border-border text-secondary hover:text-primary hover:bg-background transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="px-4 py-2 rounded-[10px] text-xs font-bold bg-primary text-background hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50 border border-bronze/40"
            >
              <Send size={13} />
              <span>{loading ? 'Submitting...' : 'Raise Motion'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
