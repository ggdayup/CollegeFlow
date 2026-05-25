import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Sparkles, Mail, AlertCircle, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { useSession } from '../utils/useSession';

type VerificationState =
  | 'idle'
  | 'verifying'
  | 'success'
  | 'error'
  | 'expired'
  | 'check-email'
  | 'resending'
  | 'resent';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: sessionLoading } = useSession();
  const [state, setState] = useState<VerificationState>('idle');
  const [message, setMessage] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  const token = searchParams.get('token');
  const emailParam = searchParams.get('email')?.trim().toLowerCase() || '';

  // Auto-verify when token is present
  useEffect(() => {
    if (!token || state !== 'idle') return;

    const verify = async () => {
      setState('verifying');
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ token }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const errorMsg = (data.error as string) || 'Verification failed';
          if (
            errorMsg.toLowerCase().includes('expir') ||
            errorMsg.toLowerCase().includes('token') ||
            res.status === 400
          ) {
            setState('expired');
            setMessage('This verification link has expired or already been used.');
          } else {
            setState('error');
            setMessage(errorMsg);
          }
          return;
        }

        setState('success');
        setMessage('Your email has been verified successfully!');

        // Redirect after a short delay
        setTimeout(() => {
          navigate('/');
        }, 2500);
      } catch {
        setState('error');
        setMessage('Network error. Please try again.');
      }
    };

    void verify();
  }, [token, state, navigate]);

  const handleResend = async () => {
    setIsResending(true);
    setResendMessage('');
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setResendMessage((data.error as string) || 'Failed to resend. Please try again.');
        return;
      }

      setResendMessage('A new verification email has been sent!');
    } catch {
      setResendMessage('Network error. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const maskedEmail = (email: string) => {
    const [local, domain] = email.split('@');
    if (local.length <= 2) return email;
    return `${local[0]}***${local[local.length - 1]}@${domain}`;
  };

  // Session still loading
  if (sessionLoading && !token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Token flow: verifying, success, error, expired
  if (token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-slate-200 shadow-xl text-center space-y-6">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl shadow-xs">
            <Sparkles className="w-7 h-7 text-blue-600" />
          </div>

          {state === 'verifying' && (
            <>
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Verifying your email
                </h1>
                <p className="text-slate-500 text-sm mt-2">
                  Please wait while we confirm your email address...
                </p>
              </div>
            </>
          )}

          {state === 'success' && (
            <>
              <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Email verified!
                </h1>
                <p className="text-slate-500 text-sm mt-2">
                  {message}
                </p>
                <p className="text-slate-400 text-xs mt-2">
                  Redirecting you to the dashboard...
                </p>
              </div>
            </>
          )}

          {state === 'expired' && (
            <>
              <Clock className="w-14 h-14 text-amber-500 mx-auto" />
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Link expired
                </h1>
                <p className="text-slate-500 text-sm mt-2">
                  {message}
                </p>
              </div>
              <button
                onClick={handleResend}
                disabled={isResending}
                className="w-full py-3 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isResending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Resend verification email
                  </>
                )}
              </button>
              {resendMessage && (
                <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
                  {resendMessage}
                </div>
              )}
            </>
          )}

          {state === 'error' && (
            <>
              <AlertCircle className="w-14 h-14 text-rose-500 mx-auto" />
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Verification failed
                </h1>
                <p className="text-slate-500 text-sm mt-2">
                  {message}
                </p>
              </div>
              <button
                onClick={handleResend}
                disabled={isResending}
                className="w-full py-3 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isResending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Resend verification email
                  </>
                )}
              </button>
              {resendMessage && (
                <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
                  {resendMessage}
                </div>
              )}
            </>
          )}

          <div className="pt-2">
            <Link to="/" className="text-xs text-slate-400 hover:text-slate-600">
              Return to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // No token: check-email flow (user navigated directly, or expired link)
  const userEmail = user?.email || emailParam;
  const isAlreadyVerified = !!(user as { emailVerified?: boolean } | null)?.emailVerified;

  // If user is logged in or the page has an email query, default to check-email.
  const showCheckEmail = !!userEmail && !isAlreadyVerified;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-slate-200 shadow-xl text-center space-y-6">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl shadow-xs">
          <Sparkles className="w-7 h-7 text-blue-600" />
        </div>

        {/* Not signed in */}
        {!userEmail && (
          <>
            <AlertCircle className="w-14 h-14 text-amber-500 mx-auto" />
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Not signed in
              </h1>
              <p className="text-slate-500 text-sm mt-2">
                You need to be logged in to verify your email.
              </p>
            </div>
            <Link
              to="/login"
              className="w-full py-3 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Sign in to continue
            </Link>
          </>
        )}

        {/* Already verified */}
        {isAlreadyVerified && (
          <>
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Email already verified
              </h1>
              <p className="text-slate-500 text-sm mt-2">
                Your email has already been verified. No action needed.
              </p>
            </div>
          </>
        )}

        {/* Check email / Resent */}
        {showCheckEmail && (
          <>
            {resendMessage ? (
              <>
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    Email sent!
                  </h1>
                  <p className="text-slate-500 text-sm mt-2">
                    {resendMessage}
                  </p>
                  <p className="text-slate-400 text-xs mt-2">
                    Check your spam folder if you do not see it within a few minutes.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    Check your email
                  </h1>
                  <p className="text-slate-500 text-sm mt-2">
                    We sent a verification link to
                  </p>
                  <p className="text-slate-700 font-semibold text-sm mt-1">
                    {maskedEmail(userEmail)}
                  </p>
                  <p className="text-slate-400 text-xs mt-3">
                    Click the link in the email to verify your account. The link expires after 24 hours.
                  </p>
                </div>
              </>
            )}

            <div className="space-y-3">
              <button
                onClick={handleResend}
                disabled={isResending}
                className="w-full py-3 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isResending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Resend verification email
                  </>
                )}
              </button>

              {!resendMessage && (
                <button
                onClick={async () => {
                  if (!user) {
                    window.location.href = '/login';
                    return;
                  }
                  try {
                      const res = await fetch('/api/auth/sign-out', {
                        method: 'POST',
                        credentials: 'include',
                      });
                      if (res.ok) {
                        window.location.href = '/login';
                      }
                    } catch { /* ignore */ }
                  }}
                  className="w-full py-2.5 text-sm text-slate-500 hover:text-slate-700 font-semibold transition-colors cursor-pointer"
                >
                  Not your email? Sign in with a different account
                </button>
              )}
            </div>
          </>
        )}

        <div className="pt-2">
          <Link to="/" className="text-xs text-slate-400 hover:text-slate-600">
            Return to home
          </Link>
        </div>
      </div>
    </div>
  );
}
