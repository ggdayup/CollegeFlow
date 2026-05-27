import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSession } from '../utils/useSession';
import { ArrowRight, School, UserCheck, AlertCircle } from 'lucide-react';

export default function JoinPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: sessionLoading } = useSession();
  const token = searchParams.get('token') || '';

  const [inviteInfo, setInviteInfo] = useState<{
    workspaceId: string;
    inviteAccepted: boolean;
    counselorName: string;
    counselorEmail: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('No invite token found in URL');
      setLoading(false);
      return;
    }

    fetch(`/api/student/invite/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setInviteInfo(data);
        }
      })
      .catch(() => setError('Failed to load invite information'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAccept = async () => {
    if (!token || !inviteInfo?.inviteAccepted === false) return;
    setAccepting(true);
    try {
      const res = await fetch(`/api/student/invite/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        navigate('/onboarding');
      }
    } catch {
      setError('Failed to accept invite. Please try again.');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading invite information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Invite Not Found</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!inviteInfo) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <School className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">You've Been Invited!</h1>
          <p className="text-slate-600 mt-2">
            {inviteInfo.counselorName} has invited you to CollegeFlow
          </p>
        </div>

        {/* Invite Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">{inviteInfo.counselorName}</p>
              <p className="text-sm text-slate-500">{inviteInfo.counselorEmail}</p>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-4">
            <p className="text-sm text-slate-600">
              Accept this invite to start building your college comparison workspace.
              You'll be guided through a quick onboarding to set up your preferences.
            </p>
          </div>
        </div>

        {/* Action */}
        {!sessionLoading && !user ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <p className="text-slate-600 mb-4">Please log in or create an account to accept this invite.</p>
            <button
              onClick={() => navigate(`/login?redirect=/join?token=${token}`)}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              Sign In to Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : inviteInfo.inviteAccepted ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <p className="text-green-600 font-medium mb-4">You've already accepted this invite!</p>
            <button
              onClick={() => navigate('/dashboard/student/profile')}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Go to Your Workspace
            </button>
          </div>
        ) : (
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {accepting ? 'Accepting...' : 'Accept Invite'} <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
