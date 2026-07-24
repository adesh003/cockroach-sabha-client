import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, CheckCircle, XCircle, Trash2, Ban, RefreshCw, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import ErrorState from '../components/ErrorState';

export default function AdminPage() {
  const { isAdmin, token } = useAuth();
  const [activeTab, setActiveTab] = useState('pending'); // 'dashboard', 'pending', 'reports', 'users', 'stats'
  const [pendingPosts, setPendingPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  const fetchAdminData = async () => {
    setError(null);
    try {
      const [pendingRes, allRes, reportsRes, usersRes] = await Promise.all([
        fetch('/api/admin/posts?status=PENDING'),
        fetch('/api/admin/posts'),
        fetch('/api/admin/reports'),
        fetch('/api/admin/users'),
      ]);

      if (pendingRes.ok) setPendingPosts(await pendingRes.json());
      if (allRes.ok) setAllPosts(await allRes.json());
      if (reportsRes.ok) setReports(await reportsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      
      await fetchStats();
    } catch (err) {
      setError("Failed to load Speaker's Office records. Connection error.");
      toast.error('Failed to load Speaker\'s Office data');
    }
  };

  useEffect(() => {
    if (isAdmin) fetchAdminData();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <ErrorState 
        title="Access Denied" 
        message="Speaker's Office privileges are required to view moderation queues and delegate records." 
      />
    );
  }

  if (error) {
    return (
      <ErrorState 
        title="Speaker's Office Error" 
        message={error} 
        onRetry={fetchAdminData} 
      />
    );
  }

  const handleUpdateStatus = async (postId, status) => {
    try {
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(`Motion ${status.toLowerCase()}`);
        fetchAdminData();
      } else {
        toast.error('Operation failed');
      }
    } catch (err) {
      toast.error('Error executing action');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this motion?')) return;
    try {
      const res = await fetch(`/api/admin/posts/${postId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Motion deleted');
        fetchAdminData();
      }
    } catch (err) {
      toast.error('Failed to delete motion');
    }
  };

  const handleBanUser = async (userId) => {
    if (!confirm('Are you sure you want to ban this delegate?')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, { method: 'POST' });
      if (res.ok) {
        toast.success('Delegate banned');
        fetchAdminData();
      }
    } catch (err) {
      toast.error('Failed to ban delegate');
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-lg font-black uppercase text-primary flex items-center gap-2">
            <ShieldAlert size={20} className="text-bronze" />
            <span>Speaker's Office</span>
          </h1>
          <p className="text-xs text-muted">Manage pending motions, ethics objections, and delegates.</p>
        </div>
        <button onClick={fetchAdminData} className="p-2 border border-border bg-card rounded-[8px] text-xs text-secondary hover:text-primary transition-colors">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* ADMIN TABS */}
      <div className="flex items-center gap-2 border-b border-border pb-2 text-xs">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-1.5 rounded-[8px] font-semibold transition ${activeTab === 'dashboard' ? 'bg-primary text-background' : 'text-secondary hover:text-primary'}`}
        >
          All Motions ({allPosts.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-3 py-1.5 rounded-[8px] font-semibold transition ${activeTab === 'pending' ? 'bg-primary text-background' : 'text-secondary hover:text-primary'}`}
        >
          Pending Motions ({pendingPosts.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-3 py-1.5 rounded-[8px] font-semibold transition ${activeTab === 'reports' ? 'bg-primary text-background' : 'text-secondary hover:text-primary'}`}
        >
          Ethics Objections ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-3 py-1.5 rounded-[8px] font-semibold transition ${activeTab === 'users' ? 'bg-primary text-background' : 'text-secondary hover:text-primary'}`}
        >
          Delegates ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-3 py-1.5 rounded-[8px] font-semibold transition ${activeTab === 'stats' ? 'bg-primary text-background' : 'text-secondary hover:text-primary'}`}
        >
          System Stats
        </button>
      </div>

      {/* PENDING MOTIONS TAB */}
      {activeTab === 'pending' && (
        <div className="space-y-3">
          {pendingPosts.length === 0 ? (
            <div className="bg-card border border-border rounded-[12px] p-8 text-center text-xs text-muted">
              No motions pending review.
            </div>
          ) : (
            pendingPosts.map((post) => (
              <div key={post.id} className="bg-card border border-border rounded-[12px] p-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-primary">🪳 {post.user?.anonymousName}</span>
                  <span className="text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded font-mono text-[10px]">PENDING REVIEW</span>
                </div>
                <p className="text-xs text-secondary">{post.content}</p>
                <div className="flex justify-end gap-2 border-t border-border pt-2">
                  <button
                    onClick={() => handleUpdateStatus(post.id, 'APPROVED')}
                    className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-[6px] text-xs flex items-center gap-1 font-semibold hover:bg-emerald-500/30"
                  >
                    <CheckCircle size={12} />
                    <span>Approve Motion</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(post.id, 'REJECTED')}
                    className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-[6px] text-xs flex items-center gap-1 font-semibold hover:bg-yellow-500/30"
                  >
                    <XCircle size={12} />
                    <span>Reject Motion</span>
                  </button>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-[6px] text-xs flex items-center gap-1 font-semibold hover:bg-red-500/30"
                  >
                    <Trash2 size={12} />
                    <span>Delete Motion</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-3">
          {allPosts.map((post) => (
            <div key={post.id} className="bg-card border border-border rounded-[12px] p-4 flex items-center justify-between text-xs">
              <div className="space-y-1 max-w-md">
                <span className="font-bold text-primary">🪳 {post.user?.anonymousName}</span>
                <p className="text-secondary truncate">{post.content}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] ${post.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {post.status}
                </span>
                <button onClick={() => handleDeletePost(post.id)} className="text-red-400 p-1 hover:text-red-300">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ETHICS OBJECTIONS TAB */}
      {activeTab === 'reports' && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="bg-card border border-border rounded-[12px] p-8 text-center text-xs text-muted">
              No ethics objections filed.
            </div>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="bg-card border border-border rounded-[12px] p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-red-400 font-bold">Objection Reason: {report.reason}</span>
                  <span className="text-muted">Filed by: 🪳 {report.user?.anonymousName}</span>
                </div>
                <p className="text-secondary bg-background p-2.5 rounded-[8px] border border-border">{report.post?.content}</p>
                <div className="flex justify-end gap-2 pt-1">
                  <button onClick={() => handleDeletePost(report.postId)} className="bg-red-500/20 text-red-400 px-3 py-1 rounded-[6px] text-xs">
                    Delete Motion
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* DELEGATES TAB */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u.id} className="bg-card border border-border rounded-[12px] p-4 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-primary">🪳 {u.anonymousName}</span>
                <p className="text-muted">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {u.isBanned ? (
                  <span className="text-red-400 bg-red-400/10 px-2 py-0.5 rounded text-[10px]">BANNED</span>
                ) : (
                  <button
                    onClick={() => handleBanUser(u.id)}
                    className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-[6px] text-xs flex items-center gap-1 font-semibold hover:bg-red-500/30"
                  >
                    <Ban size={12} />
                    <span>Ban Delegate</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SYSTEM STATS TAB */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Top Metrics Cards Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-[16px] p-6 space-y-2 shadow-sm text-center">
              <span className="text-[10px] font-mono text-muted uppercase font-bold tracking-wider">Total API Requests</span>
              <p className="text-3xl font-black text-primary">{stats?.totalApiCalls ?? 0}</p>
            </div>
            <div className="bg-card border border-border rounded-[16px] p-6 space-y-2 shadow-sm text-center">
              <span className="text-[10px] font-mono text-muted uppercase font-bold tracking-wider">Unique Visitors</span>
              <p className="text-3xl font-black text-bronze">{stats?.uniqueVisitors ?? 0}</p>
            </div>
          </div>

          {/* API Endpoints Hits breakdown list */}
          <div className="bg-card border border-border rounded-[16px] p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <BarChart3 size={18} className="text-bronze" />
              <h3 className="font-extrabold text-sm uppercase text-primary tracking-wider">API Endpoint Breakdown</h3>
            </div>
            {!stats || !stats.apiCallsByPath || stats.apiCallsByPath.length === 0 ? (
              <p className="text-xs text-muted text-center py-4">No API traffic recorded yet.</p>
            ) : (
              <div className="divide-y divide-border max-h-96 overflow-y-auto pr-1">
                {stats.apiCallsByPath.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-3 text-xs font-mono">
                    <span className="text-secondary truncate max-w-md select-all">{item.path}</span>
                    <span className="font-bold text-primary bg-background border border-border px-2.5 py-1 rounded-[6px] shrink-0">
                      {item.count} hits
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
