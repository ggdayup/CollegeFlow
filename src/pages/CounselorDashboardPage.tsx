import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSession } from '../utils/useSession';
import { 
  Users, 
  Mail, 
  Plus, 
  Loader2, 
  CheckCircle, 
  Clock, 
  UserPlus, 
  Calendar, 
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import StudentLimitIndicator from '../components/StudentLimitIndicator';
import PaywallModal from '../components/PaywallModal';

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
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    if (!sessionLoading && !user) {
      navigate('/login');
      return;
    }
    if (user && user.userType !== 'COUNSELOR') {
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
      if (data.error === 'STUDENT_LIMIT_EXCEEDED') {
        setShowPaywall(true);
        setError(`You've invited the maximum ${data.limit} students. Upgrade to invite more.`);
      } else if (data.error) {
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

  // Mock static college application deadlines for counselor deadline widget
  const deadlines = [
    { school: 'CMU / Stanford (Early Action)', date: 'Nov 1', daysLeft: 'Nov 1 Deadline' },
    { school: 'UC Berkeley (Regular)', date: 'Nov 30', daysLeft: 'Nov 30 Deadline' },
    { school: 'Harvard / Rice (Regular Decision)', date: 'Jan 1', daysLeft: 'Jan 1 Deadline' }
  ];

  // Dynamically compute student activity logs based on DB state to show authentic activity feed
  const activityLogs = students.flatMap(s => {
    const logs = [];
    if (s.inviteAccepted) {
      logs.push({
        email: s.email,
        text: 'accepted the counselor invitation.',
        time: 'Active student',
        icon: <CheckCircle className="w-3.5 h-3.5 text-green-600" />
      });
    } else {
      logs.push({
        email: s.email,
        text: 'invitation is pending acceptance.',
        time: 'Pending invite',
        icon: <Clock className="w-3.5 h-3.5 text-amber-600" />
      });
    }
    if (s.profileComplete) {
      logs.push({
        email: s.email,
        text: 'completed their Decision Profile & priorities.',
        time: 'Profile updated',
        icon: <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
      });
    }
    if (s.lastComparisonAt) {
      logs.push({
        email: s.email,
        text: 'performed a new university major comparison.',
        time: new Date(s.lastComparisonAt).toLocaleDateString(),
        icon: <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
      });
    }
    return logs;
  }).slice(0, 5); // Limit to top 5 logs

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">Student Management</h2>
        <p className="text-sm text-slate-500 mt-1">Monitor student onboarding status, academic profiles and comparison workflows.</p>
      </div>

      {/* Student Limit Warning Indicator Banner */}
      <StudentLimitIndicator onUpgradeClick={() => setShowPaywall(true)} />

      {/* Stats KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Invited</span>
            <p className="text-3xl font-black text-slate-900 mt-1">{students.length}</p>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Invites Accepted</span>
            <p className="text-3xl font-black text-slate-900 mt-1">{acceptedCount}</p>
          </div>
          <div className="p-3 bg-green-50 border border-green-100 rounded-xl">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Profiles Complete</span>
            <p className="text-3xl font-black text-slate-900 mt-1">{profileCompleteCount}</p>
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
            <UserPlus className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* 3-Column Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left & Middle Column (2/3 Width): Invite Student & Students List */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Invite Student Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              Invite a Student
            </h3>
            
            <form onSubmit={handleInvite} className="flex gap-3">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="student@email.com"
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              />
              <button
                type="submit"
                disabled={inviting || !inviteEmail.trim()}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold text-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-xs"
              >
                {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Send Invite
              </button>
            </form>

            {inviteLink && (
              <div className="mt-4 p-3.5 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-xs text-green-800 font-bold mb-1">Invite link generated! Share it with the student:</p>
                <code className="text-xs bg-white px-3 py-2 rounded-lg border border-green-200 block break-all font-mono font-bold select-all">
                  {inviteLink}
                </code>
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-xs text-red-700 font-semibold">{error}</p>
              </div>
            )}
          </div>

          {/* Students List Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Assigned Students</h3>
              <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded border border-blue-150 font-mono">
                {students.length} TOTAL
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                <span className="text-xs text-slate-400">Loading student roster...</span>
              </div>
            ) : students.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm italic">
                No students invited yet. Use the invitation card above to onboard your first student.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/20">
                      <th className="px-5 py-3">Student Email</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Decisions Profile</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {students.map((s) => (
                      <tr key={s.workspaceId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700 text-xs shadow-xs">
                              {s.email.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-slate-800">{s.email}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {s.inviteAccepted ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                              <Clock className="w-3 h-3" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {s.profileComplete ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                              Profile Complete
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                              Pending Setup
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          {s.inviteAccepted ? (
                            <button
                              onClick={() => navigate(`/dashboard/counselor/student/${s.workspaceId}`)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                            >
                              View Progress <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No workspace yet</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1/3 Width): Deadlines & Dynamic Activity Feed */}
        <div className="space-y-6">
          
          {/* Deadlines Widget Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-600" />
              Upcoming Deadlines
            </h3>

            <div className="space-y-3">
              {deadlines.map((dl, idx) => (
                <div key={idx} className="border-l-2 border-rose-500 pl-3 py-1 bg-slate-50/50 rounded-r-lg p-2.5">
                  <h4 className="text-xs font-bold text-slate-800">{dl.school}</h4>
                  <div className="flex justify-between items-center mt-1 text-[10px] text-slate-500">
                    <span>Deadline: {dl.date}</span>
                    <span className="font-semibold text-rose-600">{dl.daysLeft}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed Widget Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col min-h-[300px]">
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              Activity Logs
            </h3>

            {activityLogs.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center py-6 text-slate-400 text-xs italic">
                No recent activity logged.
              </div>
            ) : (
              <div className="space-y-4 flex-1">
                {activityLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-3 text-xs leading-relaxed">
                    <div className="mt-0.5 shrink-0">{log.icon}</div>
                    <div>
                      <span className="font-bold text-slate-800">{log.email}</span>{' '}
                      <span className="text-slate-500">{log.text}</span>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-wider">{log.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {showPaywall && (
        <PaywallModal
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
          onUpgrade={() => {}}
        />
      )}
    </div>
  );
}
