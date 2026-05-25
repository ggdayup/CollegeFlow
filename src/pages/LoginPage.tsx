import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setVerificationEmail('');
    setLoading(true);

    // TODO: demo@college.edu bypass — remove after full session migration
    if (email.toLowerCase() === 'demo@college.edu') {
      setLoading(false);
      // For demo bypass, just redirect; session will be null but app shows guest mode
      navigate('/');
      return;
    }

    try {
      const res = await fetch('/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const message = data.message || data.error || 'Login failed. Check your credentials.';
        if (String(message).toLowerCase().includes('email not verified')) {
          setVerificationEmail(email.trim().toLowerCase());
          setError('Please verify your email before signing in.');
        } else {
          setError(message);
        }
        return;
      }

      // Session cookie is set; redirect to home
      navigate('/');
      window.location.reload();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-slate-200 shadow-xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl shadow-xs mb-4">
            <Sparkles className="w-7 h-7 text-blue-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            欢迎回来
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Sign in to your account
          </p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
            {error}
            {verificationEmail && (
              <div className="mt-2">
                <Link
                  to={`/verify-email?email=${encodeURIComponent(verificationEmail)}`}
                  className="font-semibold text-blue-700 hover:text-blue-800"
                >
                  Resend verification email
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 px-0.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-semibold">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
            Create one
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-xs text-slate-400 hover:text-slate-600">
            Continue as Guest
          </Link>
        </div>
      </div>
    </div>
  );
}
