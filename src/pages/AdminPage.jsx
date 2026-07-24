import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, CheckCircle, XCircle, Trash2, Ban, RefreshCw, BarChart3, MapPin, Search, Users, FileText, AlertTriangle, Activity } from 'lucide-react';
import { toast } from 'sonner';
import ErrorState from '../components/ErrorState';

export default function AdminPage() {
  const { isAdmin, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'pending', 'all', 'reports', 'users', 'stats'
  const [pendingPosts, setPendingPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
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
        toast.success('Delegate status updated');
        fetchAdminData();
      }
    } catch (err) {
      toast.error('Failed to update delegate');
    }
  };

  const filteredPosts = allPosts.filter(p => 
    p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.user?.anonymousName && p.user.anonymousName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredUsers = users.filter(u =>
    (u.anonymousName && u.anonymousName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto text-left">
      
      {/* SPEAKER'S OFFICE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert size={22} className="text-red-500" />
            <h1 className="text-xl font-black uppercase text-primary tracking-tight">Speaker's Office Admin Command</h1>
          </div>
          <p className="text-xs text-secondary font-medium mt-0.5">Full data insights & total parliamentary control over motions, ethics reports, and delegates.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search motions or delegates..."
              className="bg-card border border-border rounded-[10px] py-1.5 pl-8 pr-3 text-xs text-primary placeholder-muted focus:outline-none focus:border-bronze w-48 sm:w-64"
            />
            <Search size={13} className="absolute left-2.5 top-2.5 text-muted" />
          </div>

          <button onClick={fetchAdminData} className="p-2 border border-border bg-card rounded-[10px] text-xs text-secondary hover:text-primary transition-colors flex items-center gap-1 font-bold">
            <RefreshCw size={14} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* OVERVIEW STATS COMMAND CENTER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border-2 border-red-500/30 rounded-[18px] p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-muted uppercase font-bold tracking-wider">Pending Motions</span>
            <FileText size={16} className="text-red-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-red-500">{pendingPosts.length}</p>
        </div>

        <div className="bg-card border-2 border-bronze/30 rounded-[18px] p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-muted uppercase font-bold tracking-wider">Total Motions</span>
            <Activity size={16} className="text-bronze" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-primary">{allPosts.length}</p>
        </div>

        <div className="bg-card border border-border rounded-[18px] p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-muted uppercase font-bold tracking-wider">Registered Delegates</span>
            <Users size={16} className="text-primary" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-primary">{users.length}</p>
        </div>

        <div className="bg-card border border-border rounded-[18px] p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-muted uppercase font-bold tracking-wider">Active Cities</span>
            <MapPin size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">{stats?.locationBreakdown?.length || 6}</p>
        </div>
      </div>

      {/* ADMIN CONTROL NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-[10px] font-extrabold uppercase tracking-wider transition ${activeTab === 'overview' ? 'bg-primary text-background shadow-sm' : 'text-secondary hover:text-primary bg-card border border-border'}`}
        >
          Overview & Map
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-3.5 py-2 rounded-[10px] font-extrabold uppercase tracking-wider transition ${activeTab === 'pending' ? 'bg-red-500 text-white shadow-sm' : 'text-secondary hover:text-primary bg-card border border-border'}`}
        >
          Pending Review ({pendingPosts.length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-2 rounded-[10px] font-extrabold uppercase tracking-wider transition ${activeTab === 'all' ? 'bg-primary text-background shadow-sm' : 'text-secondary hover:text-primary bg-card border border-border'}`}
        >
          All Motions ({allPosts.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-3.5 py-2 rounded-[10px] font-extrabold uppercase tracking-wider transition ${activeTab === 'reports' ? 'bg-primary text-background shadow-sm' : 'text-secondary hover:text-primary bg-card border border-border'}`}
        >
          Ethics Reports ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-3.5 py-2 rounded-[10px] font-extrabold uppercase tracking-wider transition ${activeTab === 'users' ? 'bg-primary text-background shadow-sm' : 'text-secondary hover:text-primary bg-card border border-border'}`}
        >
          Delegates ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-3.5 py-2 rounded-[10px] font-extrabold uppercase tracking-wider transition ${activeTab === 'stats' ? 'bg-primary text-background shadow-sm' : 'text-secondary hover:text-primary bg-card border border-border'}`}
        >
          API Traffic & Logs
        </button>
      </div>

      {/* TAB 1: OVERVIEW & MAP */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* LIVE PROTESTER CITIES & LOCATION TRACKER WIDGET */}
          <div className="bg-card border-2 border-red-500/30 rounded-[20px] p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <MapPin size={20} className="text-red-500 animate-bounce" />
                <h3 className="font-extrabold text-sm uppercase text-primary tracking-wider">Live City Geolocation Command Map</h3>
              </div>
              <span className="text-[10px] font-mono font-black text-red-500 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20 uppercase tracking-widest">
                Real-Time Protester IP Tracking
              </span>
            </div>

            {!stats || !stats.locationBreakdown || stats.locationBreakdown.length === 0 ? (
              <p className="text-xs text-muted text-center py-6">No location traffic recorded yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {stats.locationBreakdown.map((item, idx) => (
                  <div key={idx} className="p-4 bg-background border border-border rounded-[14px] flex items-center justify-between shadow-xs hover:border-red-500 transition">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">📍</span>
                      <div>
                        <span className="font-extrabold text-xs text-primary uppercase block">{item.city}</span>
                        <span className="text-[9px] text-muted font-mono uppercase font-semibold">Active Protesters</span>
                      </div>
                    </div>
                    <span className="font-mono font-black text-xs text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
                      {item.count} Cards
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PENDING MOTIONS */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingPosts.length === 0 ? (
            <div className="bg-card border border-border rounded-[18px] p-8 text-center space-y-2">
              <CheckCircle size={32} className="text-emerald-500 mx-auto" />
              <h3 className="font-black text-sm uppercase text-primary">Pending Queue Clear</h3>
              <p className="text-xs text-muted">No motions currently waiting for Speaker's approval.</p>
            </div>
          ) : (
            pendingPosts.map((p) => (
              <div key={p.id} className="bg-card border-2 border-red-500/30 rounded-[18px] p-5 space-y-3 shadow-sm text-left">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-[10px] font-mono font-black text-red-500 uppercase">{p.category}</span>
                  <span className="text-[10px] font-mono text-muted">{new Date(p.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-xs font-semibold text-primary">{p.content}</p>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    onClick={() => handleUpdateStatus(p.id, 'APPROVED')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2 rounded-[8px] flex items-center gap-1.5 transition"
                  >
                    <CheckCircle size={14} />
                    <span>Approve Motion</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(p.id, 'REJECTED')}
                    className="bg-red-600 hover:bg-red-700 text-white font-black text-xs px-4 py-2 rounded-[8px] flex items-center gap-1.5 transition"
                  >
                    <XCircle size={14} />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: ALL MOTIONS */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <p className="text-xs text-muted text-center py-8">No motions match your search query.</p>
          ) : (
            filteredPosts.map((p) => (
              <div key={p.id} className="bg-card border border-border rounded-[18px] p-5 space-y-3 shadow-sm text-left">
                <div className="flex items-center justify-between border-b border-border pb-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">🪳 {p.user?.anonymousName || 'Delegate'}</span>
                    <span className="text-[10px] font-mono text-muted">({p.college || 'Opposition Benches'})</span>
                  </div>
                  <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded uppercase ${p.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : p.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'}`}>
                    {p.status}
                  </span>
                </div>

                <p className="text-xs font-medium text-primary">{p.content}</p>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  {p.status !== 'APPROVED' && (
                    <button
                      onClick={() => handleUpdateStatus(p.id, 'APPROVED')}
                      className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 font-bold text-xs px-3 py-1.5 rounded-[6px] border border-emerald-500/30 transition"
                    >
                      Approve
                    </button>
                  )}
                  {p.status !== 'REJECTED' && (
                    <button
                      onClick={() => handleUpdateStatus(p.id, 'REJECTED')}
                      className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 font-bold text-xs px-3 py-1.5 rounded-[6px] border border-amber-500/30 transition"
                    >
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => handleDeletePost(p.id)}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-xs px-3 py-1.5 rounded-[6px] border border-red-500/30 transition flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: ETHICS REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="bg-card border border-border rounded-[18px] p-8 text-center space-y-2">
              <CheckCircle size={32} className="text-emerald-500 mx-auto" />
              <h3 className="font-black text-sm uppercase text-primary">Zero Flagged Reports</h3>
              <p className="text-xs text-muted">No ethics objections filed by delegates.</p>
            </div>
          ) : (
            reports.map((r) => (
              <div key={r.id} className="bg-card border-2 border-red-500/30 rounded-[18px] p-5 space-y-3 shadow-sm text-left">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-[10px] font-mono font-black text-red-500 uppercase">REASON: {r.reason}</span>
                  <span className="text-[10px] font-mono text-muted">{new Date(r.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-xs text-secondary font-medium">Reported by: <span className="font-bold text-primary">{r.user?.anonymousName || 'Anonymous'}</span></p>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    onClick={() => handleDeletePost(r.postId)}
                    className="bg-red-600 hover:bg-red-700 text-white font-black text-xs px-4 py-2 rounded-[8px] flex items-center gap-1.5 transition"
                  >
                    <Trash2 size={14} />
                    <span>Withdraw Motion</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 5: DELEGATES */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          {filteredUsers.length === 0 ? (
            <p className="text-xs text-muted text-center py-8">No delegates match your search.</p>
          ) : (
            filteredUsers.map((u) => (
              <div key={u.id} className="bg-card border border-border rounded-[14px] p-4 flex items-center justify-between text-xs text-left">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-primary">🪳 {u.anonymousName}</span>
                    <span className="text-[10px] font-mono font-bold bg-background border border-border px-2 py-0.5 rounded">{u.role}</span>
                  </div>
                  <p className="text-muted text-[11px] mt-0.5">{u.email}</p>
                </div>
                <div>
                  {u.isBanned ? (
                    <span className="text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-[8px] text-[10px] font-black">BANNED</span>
                  ) : (
                    <button
                      onClick={() => handleBanUser(u.id)}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 px-3.5 py-1.5 rounded-[8px] text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Ban size={13} />
                      <span>Ban Delegate</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 6: STATS & API TRAFFIC */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-[18px] p-6 space-y-2 text-center shadow-sm">
              <span className="text-[10px] font-mono text-muted uppercase font-bold tracking-wider">Total System API Requests</span>
              <p className="text-3xl font-black text-primary">{stats?.totalApiCalls ?? 0}</p>
            </div>
            <div className="bg-card border border-border rounded-[18px] p-6 space-y-2 text-center shadow-sm">
              <span className="text-[10px] font-mono text-muted uppercase font-bold tracking-wider">Unique System Visitors</span>
              <p className="text-3xl font-black text-bronze">{stats?.uniqueVisitors ?? 0}</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-[18px] p-6 space-y-4 shadow-sm text-left">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <BarChart3 size={18} className="text-bronze" />
              <h3 className="font-extrabold text-sm uppercase text-primary tracking-wider">API Endpoint Traffic Breakdown</h3>
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
