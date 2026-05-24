import { useState, useEffect, useCallback } from 'react';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: 'GUEST' | 'FREE' | 'PRO' | 'ADMIN';
  userType?: string;
  schoolName?: string | null;
  gradYear?: number | null;
  counselorSpecialty?: string | null;
  teacherSubject?: string | null;
  customNote?: string | null;
  subscriptionStatus?: string;
  subscriptionEndsAt?: string | null;
  disabled?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  emailVerified?: boolean;
}

/**
 * Hook that fetches the current session from the BFF /api/auth/me endpoint.
 * Returns { user, loading, refresh }.
 * Cookies are HTTP-only and Secure; the browser sends them automatically.
 */
export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { user, loading, refresh };
}
