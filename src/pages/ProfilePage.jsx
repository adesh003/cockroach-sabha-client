import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Edit2, Shield, Award, Save, X, FileText, ArrowLeft, LogOut, Building, CheckCircle } from 'lucide-react';
import { delegateTags, politicalHouses } from '../constants/categories';
import { toast } from 'sonner';
import PostCard from '../components/PostCard';
import ErrorState from '../components/ErrorState';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, token, setUser, logout } = useAuth();

  // Profile edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [delegateTag, setDelegateTag] = useState(user?.delegateTag || delegateTags[0]);
  const [bio, setBio] = useState(user?.bio || '');
  const [college, setCollege] = useState(user?.college || politicalHouses[0]);
  const [saving, setSaving] = useState(false);

  // Delegate Posts & Activity State
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [errorPosts, setErrorPosts] = useState(null);

  const fetchUserPosts = async () => {
    if (!token) return;
    setLoadingPosts(true);
    setErrorPosts(null);
    try {
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      const res = await fetch('/api/users/me/posts', {
        headers: { 'Authorization': authHeader }
      });
      const data = await res.json();
      if (res.ok) {
        setUserPosts(Array.isArray(data) ? data : []);
      } else {
        setErrorPosts(data.error || 'Failed to load delegate motions');
      }
    } catch (err) {
      setErrorPosts('Unable to connect to Sabha server to load your motions.');
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (user) {
      setDelegateTag(user.delegateTag || delegateTags[0]);
      setBio(user.bio || '');
      setCollege(user.college || politicalHouses[0]);
      fetchUserPosts();
    }
  }, [user, token]);

  if (!user) {
    return (
      <ErrorState
        title="Delegate Authentication Required"
        message="Please enter Cockroach SABHA floor as an authenticated delegate to view your profile and motions."
      />
    );
  }

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          delegateTag,
          bio,
          college,
        }),
      });

      const updatedUser = await res.json();
      if (res.ok) {
        setUser(updatedUser);
        toast.success('Delegate Profile updated successfully!');
        setIsEditing(false);
      } else {
        toast.error(updatedUser.error || 'Failed to update profile');
      }
    } catch (err) {
      toast.error('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 text-left">

      {/* TOP BACK BUTTON HEADER */}
      <div className="flex items-center justify-between border-b border-[#292929] pb-3">
        <button
          onClick={() => navigate('/feed')}
          className="flex items-center gap-2 text-xs font-bold text-[#A1A1AA] hover:text-white transition group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition" />
          <span>Back to Sabha Floor</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] text-[#9A6B32] font-mono uppercase tracking-wider font-bold">Delegate ID Active</span>
        </div>
      </div>

      {/* HEADER CARD WITH 2PX BRONZE BORDER & GLOW SHADOW */}
      <div className="bg-[#171717] border-2 border-[#9A6B32] rounded-[18px] p-6 space-y-5 shadow-[0_0_40px_rgba(154,107,50,0.2)] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#292929] pb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={user.avatar}
                alt="Avatar"
                className="w-16 h-16 rounded-full bg-[#0B0B0B] border-2 border-[#9A6B32] p-1 shadow-inner"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#0B0B0B] border border-[#9A6B32] flex items-center justify-center text-[10px]">
                🪳
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-white">{user.anonymousName}</h1>
                {user.role === 'ADMIN' && (
                  <span className="bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                    <Shield size={11} />
                    <span>Speaker's Office</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#9A6B32] font-mono font-bold mt-1.5 flex items-center gap-1.5 flex-wrap">
                <Award size={14} className="shrink-0" />
                <span className="whitespace-normal leading-normal">{user.delegateTag || '🪳 Professional Backbencher Delegate'}</span>
              </p>
            </div>
          </div>

          {!isEditing ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-[#0B0B0B] border border-[#292929] text-white hover:border-[#9A6B32] font-bold py-2 px-4 rounded-[10px] text-xs transition flex items-center gap-2 shadow-sm"
              >
                <Edit2 size={14} />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={logout}
                title="Logout"
                className="bg-[#0B0B0B] border border-red-500/30 text-red-400 hover:bg-red-500/10 py-2 px-3 rounded-[10px] text-xs transition flex items-center gap-1 font-semibold"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="bg-[#0B0B0B] border border-[#292929] text-[#71717A] hover:text-white py-2 px-3 rounded-[10px] text-xs transition flex items-center gap-1"
              >
                <X size={14} />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="bg-white text-black font-black py-2 px-4 rounded-[10px] text-xs transition flex items-center gap-1 hover:bg-neutral-200 border border-[#9A6B32]"
              >
                <Save size={14} />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          )}
        </div>

        {/* PROFILE EDIT FORM / DISPLAY */}
        {isEditing ? (
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-[10px] font-bold uppercase text-[#A1A1AA] mb-1">
                Select Humorous Delegate Tag
              </label>
              <select
                value={delegateTag}
                onChange={(e) => setDelegateTag(e.target.value)}
                className="w-full bg-[#0B0B0B] border border-[#292929] rounded-[10px] p-2.5 text-xs text-white focus:outline-none focus:border-[#9A6B32]"
              >
                {delegateTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-[#A1A1AA] mb-1">
                Parliamentary House / Bench
              </label>
              <select
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full bg-[#0B0B0B] border border-[#292929] rounded-[10px] p-2.5 text-xs text-white focus:outline-none focus:border-[#9A6B32]"
              >
                {politicalHouses.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-[#A1A1AA] mb-1">
                Delegate Motto / Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write your parliamentary motto..."
                rows={2}
                className="w-full bg-[#0B0B0B] border border-[#292929] rounded-[10px] p-2.5 text-xs text-white focus:outline-none focus:border-[#9A6B32] resize-none"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <p className="text-xs text-[#A1A1AA] italic leading-relaxed">
              "{user.bio || 'Delegate sitting on the Cockroach Sabha Floor.'}"
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 font-mono text-xs">
              <div className="bg-[#0B0B0B] border border-[#292929] rounded-[10px] p-3 text-center">
                <p className="text-sm font-black text-[#9A6B32]">{userPosts.length}</p>
                <p className="text-[10px] text-[#71717A]">Motions Raised</p>
              </div>
              <div className="bg-[#0B0B0B] border border-[#292929] rounded-[10px] p-3 text-center">
                <p className="text-sm font-black text-white">{user.college || 'Lok Sabha (Lower House)'}</p>
                <p className="text-[10px] text-[#71717A]">Parliament Bench</p>
              </div>
              <div className="bg-[#0B0B0B] border border-emerald-500/40 rounded-[10px] p-3 text-center col-span-2 sm:col-span-1 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <p className="text-sm font-black text-emerald-400 flex items-center justify-center gap-1">
                  <span>Verified Pass</span>
                  <CheckCircle size={13} className="text-emerald-400" />
                </p>
                <p className="text-[10px] text-emerald-500/80 font-bold">Cockroach SABHA</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* USER MOTIONS & ACTIVITY FEED */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b border-[#292929] pb-3">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-[#9A6B32]" />
            <h2 className="font-extrabold text-sm uppercase tracking-wider text-white">Your Raised Motions & Debates</h2>
          </div>
          <span className="text-xs text-[#71717A] font-mono">{userPosts.length} Motions</span>
        </div>

        {loadingPosts ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-[#171717] border border-[#292929] rounded-[12px] p-5 space-y-3 animate-pulse">
                <div className="h-4 bg-[#292929] rounded w-1/3"></div>
                <div className="h-10 bg-[#292929] rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : errorPosts ? (
          <ErrorState title="Failed to Load Motions" message={errorPosts} onRetry={fetchUserPosts} showHomeButton={false} />
        ) : userPosts.length === 0 ? (
          <div className="bg-[#171717] border border-[#292929] rounded-[14px] p-8 text-center space-y-3">
            {/* <span className="text-3xl block"></span> */}
            <h3 className="font-bold text-sm text-white">No Motions Raised Yet</h3>
            <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto">
              You haven't raised any rants or motions on the Sabha floor yet. Speak your mind and let every cockroach hear your voice!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {userPosts.map((post) => (
              <PostCard key={post.id} post={post} onReportSubmitted={fetchUserPosts} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
