import { useMemo } from 'react';
import { type SessionUser } from './useSession';

export interface Entitlements {
  canViewRadarChart: boolean;
  canCreatePrerequisiteLinks: boolean;
  maxBookmarksCount: number;
  showPremiumAdBlockers: boolean;
  tierName: string;
  tierColor: string;
  maxComparisons: number;
  canGenerateReports: boolean;
}

const GUEST_ENTITLEMENTS: Entitlements = {
  canViewRadarChart: false,
  canCreatePrerequisiteLinks: false,
  maxBookmarksCount: 2,
  showPremiumAdBlockers: false,
  tierName: 'Guest Mode',
  tierColor: 'from-slate-500 to-slate-700',
  maxComparisons: 0,
  canGenerateReports: false,
};

const FREE_ENTITLEMENTS: Entitlements = {
  canViewRadarChart: true,
  canCreatePrerequisiteLinks: false,
  maxBookmarksCount: 5,
  showPremiumAdBlockers: false,
  tierName: 'Free Account',
  tierColor: 'from-blue-500 to-indigo-600',
  maxComparisons: 1,
  canGenerateReports: false,
};

const PRO_ENTITLEMENTS: Entitlements = {
  canViewRadarChart: true,
  canCreatePrerequisiteLinks: true,
  maxBookmarksCount: 999,
  showPremiumAdBlockers: true,
  tierName: 'Premium Pro',
  tierColor: 'from-amber-500 via-orange-600 to-rose-600 shadow-amber-500/20',
  maxComparisons: 999,
  canGenerateReports: true,
};

const ADMIN_ENTITLEMENTS: Entitlements = {
  canViewRadarChart: true,
  canCreatePrerequisiteLinks: true,
  maxBookmarksCount: 9999,
  showPremiumAdBlockers: true,
  tierName: 'Administrator',
  tierColor: 'from-purple-600 to-indigo-700 shadow-purple-600/20',
  maxComparisons: 999,
  canGenerateReports: true,
};

const COUNSELOR_ENTITLEMENTS: Entitlements = {
  canViewRadarChart: true,
  canCreatePrerequisiteLinks: true,
  maxBookmarksCount: 9999,
  showPremiumAdBlockers: true,
  tierName: 'Counselor',
  tierColor: 'from-purple-600 to-indigo-700 shadow-purple-600/20',
  maxComparisons: 999,
  canGenerateReports: true,
};

/**
 * Compute entitlements from a session user (or null for guest).
 * No localStorage; all state comes from the BFF session.
 */
export function computeEntitlements(user: SessionUser | null): Entitlements {
  if (!user) return GUEST_ENTITLEMENTS;

  // Check subscription status for active/trialing subscribers
  const isActiveSub = user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing';
  if (isActiveSub && user.role !== 'ADMIN') {
    return user.role === 'COUNSELOR' ? COUNSELOR_ENTITLEMENTS : PRO_ENTITLEMENTS;
  }

  switch (user.role) {
    case 'ADMIN': return ADMIN_ENTITLEMENTS;
    case 'COUNSELOR': return COUNSELOR_ENTITLEMENTS;
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
