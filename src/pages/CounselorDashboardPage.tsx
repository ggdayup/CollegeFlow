import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSession } from '../utils/useSession';
import { Users, Mail, Plus, Loader2, CheckCircle, Clock, UserPlus } from 'lucide-react';

interface StudentRow {
  workspaceId: string;
  email: string;
  inviteAccepted: boolean;
  profileComplete: boolean;
  lastComparisonAt: string | null;
}

export default function CounselorDashboardPage() {
  const { user, loading: sessionLoading } = useSession();
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionLoading && !user) {
      navigate('/login');
      return;
    }
    if (user?.userType !== 'COUNSELOR') {
      navigate('/');
      return;
    }
    fetchStudents();
  }, [user, sessionLoading, navigate]);

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/counselor/students', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setError(null);
    setInviteLink(null);
    try {
      const res = await fetch('/api/counselor/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: inviteEmail }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setInviteLink(data.inviteLink);
        setInviteEmail('');
        fetchStudents();
      }
    } catch {
      setError('Failed to send invite. Please try again.');
    } finally {
      setInviting(false);
    }
  };

  const acceptedCount = students.filter(s => s.inviteAccepted).length;
  const profileCompleteCount = students.filter(s => s.profileComplete).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-xl sticky top-0 z-50 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
            ← Back to Home
          </Link>
          <h1 className="font-semibold text-slate-900">Counselor Dashboard</h1>
          <div className="text-sm text-slate-500">{user?.email}</div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-medium text-slate-600">Total Invited</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{students.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-slate-600">Accepted</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{acceptedCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <UserPlus className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-slate-600">Profiles Complete</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{profileCompleteCount}</p>
          </div>
        </div>

        {/* Invite Student */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5" /> Invite a Student
          </h2>
          <form onSubmit={handleInvite} className="flex gap-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="student@email.com"
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={inviting || !inviteEmail.trim()}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Send Invite
            </button>
          </form>
          {inviteLink && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium mb-1">Invite created! Share this link:</p>
              <code className="text-xs bg-white px-3 py-1.5 rounded border border-green-200 block break-all">
                {inviteLink}
              </code>
            </div>
          )}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Student List */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Students</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading...</div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No students invited yet. Send an invite to get started.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {students.map((s) => (
                <div key={s.workspaceId} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-slate-600">
                        {s.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{s.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {s.inviteAccepted ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3" /> Accepted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                        {s.profileComplete && (
                          <span className="text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                            Profile Complete
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {s.inviteAccepted && (
                    <Link
                      to={`/dashboard/counselor/student/${s.workspaceId}`}
                      className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      View Progress →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
