import { useState, useEffect, useMemo } from 'react';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: 'GUEST' | 'FREE' | 'PRO' | 'ADMIN';
  subscriptionStatus: 'active' | 'trialing' | 'canceled' | 'none';
  subscriptionEndsAt?: string;
}

export interface Entitlements {
  canViewRadarChart: boolean;
  canCreatePrerequisiteLinks: boolean;
  maxBookmarksCount: number;
  showPremiumAdBlockers: boolean;
  tierName: string;
  tierColor: string;
}

const GUEST_ENTITLEMENTS: Entitlements = {
  canViewRadarChart: false, // Locked state paywall gate
  canCreatePrerequisiteLinks: false,
  maxBookmarksCount: 2,
  showPremiumAdBlockers: false,
  tierName: 'Guest Mode',
  tierColor: 'from-slate-500 to-slate-700',
};

const FREE_ENTITLEMENTS: Entitlements = {
  canViewRadarChart: true,
  canCreatePrerequisiteLinks: false, // Gated standard level
  maxBookmarksCount: 5,
  showPremiumAdBlockers: false,
  tierName: 'Free Account',
  tierColor: 'from-blue-500 to-indigo-600',
};

const PRO_ENTITLEMENTS: Entitlements = {
  canViewRadarChart: true,
  canCreatePrerequisiteLinks: true,
  maxBookmarksCount: 999,
  showPremiumAdBlockers: true,
  tierName: 'Premium Pro',
  tierColor: 'from-amber-500 via-orange-600 to-rose-600 shadow-amber-500/20',
};

const ADMIN_ENTITLEMENTS: Entitlements = {
  canViewRadarChart: true,
  canCreatePrerequisiteLinks: true,
  maxBookmarksCount: 9999,
  showPremiumAdBlockers: true,
  tierName: 'Administrator',
  tierColor: 'from-purple-600 to-indigo-700 shadow-purple-600/20',
};

/**
 * React stateful hook to manage client session, mock login operations,
 * and serve structured billing-agnostic entitlements.
 */
export function useEntitlements() {
  const [session, setSession] = useState<UserSession | null>(() => {
    // Load session from localStorage if available
    const saved = localStorage.getItem('college_major_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const isLoggedIn = session !== null && session.role !== 'GUEST';

  const loginDemo = (role: 'FREE' | 'PRO' | 'ADMIN' = 'PRO') => {
    const mockSession: UserSession = {
      id: 'demo-user-id-123',
      email: 'demo@college.edu',
      name: 'Demo Student',
      role,
      subscriptionStatus: role === 'PRO' ? 'active' : 'none',
      subscriptionEndsAt: role === 'PRO' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    };
    localStorage.setItem('college_major_session', JSON.stringify(mockSession));
    setSession(mockSession);
  };

  const logout = () => {
    localStorage.removeItem('college_major_session');
    setSession(null);
  };

  // Compute active entitlements based on user role
  const entitlements: Entitlements = useMemo(() => {
    if (!session) return GUEST_ENTITLEMENTS;
    switch (session.role) {
      case 'ADMIN':
        return ADMIN_ENTITLEMENTS;
      case 'PRO':
        return PRO_ENTITLEMENTS;
      case 'FREE':
        return FREE_ENTITLEMENTS;
      default:
        return GUEST_ENTITLEMENTS;
    }
  }, [session]);

  const setGuestMode = () => {
    const guestSession: UserSession = {
      id: 'guest-session-id',
      email: 'guest@college.edu',
      name: 'Guest Explorer',
      role: 'GUEST',
      subscriptionStatus: 'none',
    };
    localStorage.setItem('college_major_session', JSON.stringify(guestSession));
    setSession(guestSession);
  };

  // Automatically initialize with Guest Mode if no active session
  useEffect(() => {
    if (!session) {
      setGuestMode();
    }
  }, [session]);

  return {
    session,
    isLoggedIn,
    entitlements,
    loginDemo,
    logout,
    setGuestMode
  };
}
