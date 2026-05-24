import { Navigate, useLocation } from 'react-router-dom';
import { type SessionUser } from '../utils/useSession';

interface ProtectedRouteProps {
  user: SessionUser | null;
  loading: boolean;
  children: React.ReactNode;
  requireAdmin?: boolean;
}

/**
 * Route guard for protected pages.
 * - Unauthenticated users are redirected to /login.
 * - Non-admin users attempting to access admin routes are redirected to /.
 */
export default function ProtectedRoute({
  user,
  loading,
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
