import { useState, useCallback, useEffect } from 'react';
import {
  Search, Users, Shield, UserX, KeyRound, Check, X, RefreshCw,
  ChevronLeft, ChevronRight, Eye, EyeOff, Sparkles, Clock,
  Sparkle, History,
} from 'lucide-react';

// ---- Types ----

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  userType: string;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  disabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  subscriptionStatus: string;
  subscriptionEndsAt: string | null;
  schoolName: string | null;
  // Full detail fields (only populated in detail view)
  passwordHash?: string;
  gradYear?: number | null;
  counselorSpecialty?: string | null;
  teacherSubject?: string | null;
  customNote?: string | null;
}

interface ListResponse {
  users: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
}

interface SubscriptionHistoryEntry {
  id: string;
  userId: string;
  changedBy: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  reason: string | null;
  createdAt: string;
}

const API = '/api/admin/users';

// ---- Badge helpers ----

const roleBadge = (role: string) => {
  switch (role) {
    case 'ADMIN': return 'bg-purple-100 text-purple-700';
    case 'PRO': return 'bg-emerald-100 text-emerald-700';
    case 'FREE': return 'bg-slate-100 text-slate-600';
    case 'GUEST': return 'bg-amber-100 text-amber-700';
    default: return 'bg-slate-100 text-slate-500';
  }
};

const fmtDate = (d: string | null) => {
  if (!d) return 'Never';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const fmtDateTime = (d: string | null) => {
  if (!d) return 'Never';
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// ---- Main Component ----

export default function AdminUserManagement() {
  // List state
  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [page, setPage] = useState(1);

  // Detail drawer state
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<AdminUser | null>(null);

  // Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null); // id of loading action
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Subscription management state
  const [subHistory, setSubHistory] = useState<SubscriptionHistoryEntry[]>([]);
  const [subHistoryLoading, setSubHistoryLoading] = useState(false);
  const [subStatusUpdating, setSubStatusUpdating] = useState(false);
  const [trialGranting, setTrialGranting] = useState(false);
  const [historyCollapsed, setHistoryCollapsed] = useState(false);

  // Fetch list
  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '20' });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (roleFilter) params.set('role', roleFilter);
      if (userTypeFilter) params.set('userType', userTypeFilter);
      if (verifiedFilter) params.set('emailVerified', verifiedFilter);

      const res = await fetch(`${API}?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error('Failed to fetch users:', e);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, roleFilter, userTypeFilter, verifiedFilter]);

  useEffect(() => { fetchList(); }, [fetchList]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [roleFilter, userTypeFilter, verifiedFilter]);

  // Fetch subscription history
  const fetchSubHistory = useCallback(async (userId: string) => {
    setSubHistoryLoading(true);
    try {
      const res = await fetch(`${API}/${userId}/subscription-history`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setSubHistory(json.history || []);
    } catch (e) {
      console.error('Failed to fetch subscription history:', e);
    } finally {
      setSubHistoryLoading(false);
    }
  }, []);

  // Fetch detail
  const openDetail = useCallback(async (user: AdminUser) => {
    setSelectedUser(user);
    setDetailData(null);
    setNewPassword('');
    setShowPassword(false);
    setSubHistory([]);
    setHistoryCollapsed(false);
    setDetailLoading(true);
    try {
      const res = await fetch(`${API}/${user.id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const userData = await res.json();
      setDetailData(userData);
      // Fetch subscription history in parallel
      fetchSubHistory(user.id);
    } catch (e) {
      console.error('Failed to fetch user detail:', e);
    } finally {
      setDetailLoading(false);
    }
  }, [fetchSubHistory]);

  // Toast helper
  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Action: update role
  const updateRole = useCallback(async (userId: string, role: string) => {
    setActionLoading(`role-${userId}`);
    try {
      const res = await fetch(`${API}/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed'); }
      showToast('Role updated successfully');
      fetchList();
      if (detailData?.id === userId) {
        openDetail(detailData);
      }
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to update role', 'error');
    } finally {
      setActionLoading(null);
    }
  }, [fetchList, showToast, detailData, openDetail]);

  // Action: toggle disabled
  const toggleDisabled = useCallback(async (userId: string, disabled: boolean) => {
    setActionLoading(`disable-${userId}`);
    try {
      const res = await fetch(`${API}/${userId}/disable`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disabled }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed'); }
      showToast(disabled ? 'User disabled' : 'User enabled');
      fetchList();
      if (detailData?.id === userId) {
        openDetail(detailData);
      }
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to toggle disabled', 'error');
    } finally {
      setActionLoading(null);
    }
  }, [fetchList, showToast, detailData, openDetail]);

  // Action: reset password
  const resetPassword = useCallback(async () => {
    if (!detailData) return;
    if (!newPassword || newPassword.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }
    setActionLoading(`password-${detailData.id}`);
    try {
      const res = await fetch(`${API}/${detailData.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed'); }
      showToast('Password reset successfully. All sessions revoked.');
      setNewPassword('');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to reset password', 'error');
    } finally {
      setActionLoading(null);
    }
  }, [detailData, newPassword, showToast]);

  // Generate random password
  const generatePassword = useCallback(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let pw = '';
    for (let i = 0; i < 14; i++) pw += chars[Math.floor(Math.random() * chars.length)];
    setNewPassword(pw);
    setShowPassword(true);
  }, []);

  // Action: update subscription status/endsAt
  const updateSubscription = useCallback(async (userId: string, updates: { subscriptionStatus?: string; subscriptionEndsAt?: string }) => {
    setSubStatusUpdating(true);
    try {
      const res = await fetch(`${API}/${userId}/subscription`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed'); }
      showToast('Subscription updated');
      fetchList();
      if (detailData?.id === userId) {
        openDetail(detailData);
      }
      fetchSubHistory(userId);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to update subscription', 'error');
    } finally {
      setSubStatusUpdating(false);
    }
  }, [fetchList, showToast, detailData, openDetail, fetchSubHistory]);

  // Action: grant trial
  const grantTrial = useCallback(async (userId: string) => {
    setTrialGranting(true);
    try {
      const res = await fetch(`${API}/${userId}/trial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed'); }
      showToast('14-day trial granted');
      fetchList();
      if (detailData?.id === userId) {
        openDetail(detailData);
      }
      fetchSubHistory(userId);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to grant trial', 'error');
    } finally {
      setTrialGranting(false);
    }
  }, [fetchList, showToast, detailData, openDetail, fetchSubHistory]);

  // Pagination
  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[60] px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Users className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-bold text-slate-900">Admin User Management</h2>
        {data && (
          <span className="text-xs text-slate-400 ml-auto">{data.total} users total</span>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by email or name..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Role filter */}
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="PRO">Pro</option>
          <option value="FREE">Free</option>
          <option value="GUEST">Guest</option>
        </select>

        {/* UserType filter */}
        <select
          value={userTypeFilter}
          onChange={e => setUserTypeFilter(e.target.value)}
          className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          <option value="STUDENT">Student</option>
          <option value="TEACHER">Teacher</option>
          <option value="COUNSELOR">Counselor</option>
          <option value="PARENT">Parent</option>
          <option value="OTHER">Other</option>
        </select>

        {/* Verified filter */}
        <select
          value={verifiedFilter}
          onChange={e => setVerifiedFilter(e.target.value)}
          className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Verified</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </select>
      </div>

      {/* User Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="text-left py-3 px-4 font-semibold text-slate-600">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600">Type</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-600">Verified</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-600">Disabled</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600 hidden lg:table-cell">Last Login</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8} className="text-center py-12 text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Loading users...
                  </div>
                </td></tr>
              )}
              {!loading && data?.users.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-slate-400">No users found</td></tr>
              )}
              {!loading && data?.users.map(user => (
                <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4 font-mono text-slate-700 text-[11px]">{user.email}</td>
                  <td className="py-2.5 px-4 text-slate-700">{user.name || '—'}</td>
                  <td className="py-2.5 px-4">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${roleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-500">{user.userType}</td>
                  <td className="py-2.5 px-4 text-center">
                    {user.emailVerified
                      ? <Check className="w-3.5 h-3.5 text-emerald-500 inline" />
                      : <X className="w-3.5 h-3.5 text-slate-300 inline" />
                    }
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <button
                      onClick={() => toggleDisabled(user.id, !user.disabled)}
                      disabled={actionLoading === `disable-${user.id}`}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        user.disabled ? 'bg-red-400' : 'bg-emerald-400'
                      } ${actionLoading === `disable-${user.id}` ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                        user.disabled ? 'translate-x-1' : 'translate-x-4'
                      }`} />
                    </button>
                  </td>
                  <td className="py-2.5 px-4 text-slate-400 hidden lg:table-cell">{fmtDateTime(user.lastLoginAt)}</td>
                  <td className="py-2.5 px-4 text-right">
                    <button
                      onClick={() => openDetail(user)}
                      className="text-blue-600 hover:text-blue-800 font-medium transition-colors cursor-pointer"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/30">
            <span className="text-xs text-slate-500">
              Page {data.page} of {totalPages} ({data.total} users)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Smart page window
                let p = i + 1;
                if (totalPages > 5) {
                  p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                }
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      p === page
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Drawer / Sidebar */}
      {selectedUser && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => { setSelectedUser(null); setDetailData(null); }}
          />
          {/* Sidebar */}
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">User Details</h3>
                <button
                  onClick={() => { setSelectedUser(null); setDetailData(null); }}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {detailLoading && (
                <div className="text-center py-8 text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" /> Loading...
                </div>
              )}

              {detailData && (
                <>
                  {/* Basic Info */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Basic Info</h4>
                    <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Email</span>
                        <span className="font-mono text-slate-900">{detailData.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Name</span>
                        <span className="text-slate-900">{detailData.name || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">User Type</span>
                        <span className="text-slate-900">{detailData.userType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">School</span>
                        <span className="text-slate-900">{detailData.schoolName || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Created</span>
                        <span className="text-slate-900">{fmtDate(detailData.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Last Login</span>
                        <span className="text-slate-900">{fmtDateTime(detailData.lastLoginAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Email Verified</span>
                        <span>
                          {detailData.emailVerified
                            ? <Check className="w-4 h-4 text-emerald-500 inline" />
                            : <X className="w-4 h-4 text-slate-300 inline" />
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Subscription</span>
                        <span className="text-slate-900">{detailData.subscriptionStatus}</span>
                      </div>
                      {detailData.disabled && (
                        <div className="flex items-center gap-1.5 text-red-600 text-xs font-bold">
                          <UserX className="w-3.5 h-3.5" /> Account Disabled
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Role Management */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <Shield className="w-4 h-4" /> Role
                    </h4>
                    <div className="flex items-center gap-2">
                      <select
                        value={detailData.role}
                        onChange={e => updateRole(detailData.id, e.target.value)}
                        disabled={actionLoading === `role-${detailData.id}`}
                        className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <option value="GUEST">GUEST</option>
                        <option value="FREE">FREE</option>
                        <option value="PRO">PRO</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                      {actionLoading === `role-${detailData.id}` && (
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Disable Toggle */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <UserX className="w-4 h-4" /> Account Status
                    </h4>
                    <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
                      <span className="text-sm text-slate-700">
                        {detailData.disabled ? 'Account is disabled' : 'Account is active'}
                      </span>
                      <button
                        onClick={() => toggleDisabled(detailData.id, !detailData.disabled)}
                        disabled={actionLoading === `disable-${detailData.id}`}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          detailData.disabled ? 'bg-red-400' : 'bg-emerald-400'
                        } ${actionLoading === `disable-${detailData.id}` ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                      >
                        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          detailData.disabled ? 'translate-x-1.5' : 'translate-x-6'
                        }`} />
                      </button>
                    </div>
                  </div>

                  {/* Password Reset */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <KeyRound className="w-4 h-4" /> Reset Password
                    </h4>
                    <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="Enter new password (min 8 chars)"
                            className="w-full px-3 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <button
                          onClick={generatePassword}
                          className="p-2.5 border border-slate-200 rounded-lg hover:bg-white transition-colors cursor-pointer"
                          title="Generate random password"
                        >
                          <Sparkles className="w-4 h-4 text-purple-500" />
                        </button>
                      </div>
                      <button
                        onClick={resetPassword}
                        disabled={!newPassword || newPassword.length < 8 || actionLoading === `password-${detailData.id}`}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {actionLoading === `password-${detailData.id}` ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <KeyRound className="w-4 h-4" />
                        )}
                        Reset Password
                      </button>
                      <p className="text-[10px] text-slate-400">
                        This will update the password hash and revoke all active sessions for this user.
                      </p>
                    </div>
                  </div>

                  {/* Subscription Management */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Subscription
                    </h4>
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 space-y-4">
                      {/* Status dropdown */}
                      <div>
                        <label className="text-xs font-medium text-slate-600 mb-1 block">Status</label>
                        <div className="flex items-center gap-2">
                          <select
                            value={detailData.subscriptionStatus}
                            onChange={e => updateSubscription(detailData.id, { subscriptionStatus: e.target.value })}
                            disabled={subStatusUpdating}
                            className="flex-1 px-3 py-2 border border-amber-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
                          >
                            <option value="none">None</option>
                            <option value="trialing">Trialing</option>
                            <option value="active">Active</option>
                            <option value="canceled">Canceled</option>
                          </select>
                          {subStatusUpdating && <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />}
                        </div>
                      </div>

                      {/* End date picker */}
                      <div>
                        <label className="text-xs font-medium text-slate-600 mb-1 block">Ends At</label>
                        <input
                          type="date"
                          value={detailData.subscriptionEndsAt ? new Date(detailData.subscriptionEndsAt).toISOString().split('T')[0] : ''}
                          onChange={e => {
                            const newDate = e.target.value ? new Date(e.target.value + 'T00:00:00') : null;
                            updateSubscription(detailData.id, {
                              subscriptionEndsAt: newDate ? newDate.toISOString() : '',
                            });
                          }}
                          className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-400"
                        />
                      </div>

                      {/* Grant trial button */}
                      <button
                        onClick={() => grantTrial(detailData.id)}
                        disabled={trialGranting}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {trialGranting ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkle className="w-4 h-4" />
                        )}
                        Grant 14-Day Trial
                      </button>

                      {/* Subscription history */}
                      <div className="pt-2 border-t border-amber-200">
                        <button
                          onClick={() => setHistoryCollapsed(!historyCollapsed)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
                        >
                          <History className="w-3.5 h-3.5" />
                          History ({subHistory.length})
                          <ChevronRight className={`w-3 h-3 transition-transform ${historyCollapsed ? '' : 'rotate-90'}`} />
                        </button>
                        {!historyCollapsed && (
                          <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto">
                            {subHistoryLoading && (
                              <div className="text-xs text-slate-400 flex items-center gap-1">
                                <RefreshCw className="w-3 h-3 animate-spin" /> Loading...
                              </div>
                            )}
                            {!subHistoryLoading && subHistory.length === 0 && (
                              <p className="text-xs text-slate-400 italic">No changes yet</p>
                            )}
                            {!subHistoryLoading && subHistory.map((entry) => (
                              <div key={entry.id} className="text-[11px] bg-white/70 rounded-lg p-2 space-y-0.5">
                                <div className="flex items-center justify-between text-slate-500">
                                  <span>{fmtDateTime(entry.createdAt)}</span>
                                  <span className="font-mono text-[10px]">{entry.changedBy}</span>
                                </div>
                                <div className="text-slate-700">
                                  <span className="font-medium">{entry.field}</span>:{' '}
                                  <span className="text-red-500">{entry.oldValue || '—'}</span>
                                  {' → '}
                                  <span className="text-emerald-600">{entry.newValue || '—'}</span>
                                </div>
                                {entry.reason && (
                                  <p className="text-slate-400 italic">{entry.reason}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
