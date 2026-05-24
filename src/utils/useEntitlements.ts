import { useMemo } from 'react';
import { type SessionUser } from './useSession';

export interface Entitlements {
  canViewRadarChart: boolean;
  canCreatePrerequisiteLinks: boolean;
  maxBookmarksCount: number;
  showPremiumAdBlockers: boolean;
  tierName: string;
  tierColor: string;
}

const GUEST_ENTITLEMENTS: Entitlements = {
  canViewRadarChart: false,
  canCreatePrerequisiteLinks: false,
  maxBookmarksCount: 2,
  showPremiumAdBlockers: false,
  tierName: 'Guest Mode',
  tierColor: 'from-slate-500 to-slate-700',
};

const FREE_ENTITLEMENTS: Entitlements = {
  canViewRadarChart: true,
  canCreatePrerequisiteLinks: false,
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
 * Compute entitlements from a session user (or null for guest).
 * No localStorage; all state comes from the BFF session.
 */
export function computeEntitlements(user: SessionUser | null): Entitlements {
  if (!user) return GUEST_ENTITLEMENTS;
  switch (user.role) {
    case 'ADMIN': return ADMIN_ENTITLEMENTS;
    case 'PRO': return PRO_ENTITLEMENTS;
    case 'FREE': return FREE_ENTITLEMENTS;
    default: return GUEST_ENTITLEMENTS;
  }
}

/**
 * React hook: derives entitlements from a session user.
 * Accepts `user` from useSession so caller controls fetch lifecycle.
 */
export function useEntitlements(user: SessionUser | null): {
  entitlements: Entitlements;
  isLoggedIn: boolean;
} {
  const entitlements = useMemo(() => computeEntitlements(user), [user]);
  const isLoggedIn = user !== null && user.role !== 'GUEST';

  return { entitlements, isLoggedIn };
}
