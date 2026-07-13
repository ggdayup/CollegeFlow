import { AlertTriangle, ArrowUpRight } from 'lucide-react';
import { useState, useEffect } from 'react';

interface WorkspaceLimits {
  currentStudents: number;
  maxStudents: number;
  tier: string;
  canInviteMore: boolean;
}

interface StudentLimitIndicatorProps {
  onUpgradeClick?: () => void;
}

export default function StudentLimitIndicator({ onUpgradeClick }: StudentLimitIndicatorProps) {
  const [limits, setLimits] = useState<WorkspaceLimits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/counselor/workspace/limits', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setLimits(data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !limits) return null;
  if (limits.maxStudents === -1) return null;

  const ratio = limits.currentStudents / limits.maxStudents;
  const isNearLimit = ratio >= 0.8;
  const isAtLimit = !limits.canInviteMore;

  if (!isNearLimit && !isAtLimit) {
    return (
      <div className="text-sm text-slate-500">
        {limits.currentStudents} / {limits.maxStudents} students
      </div>
    );
  }

  if (isAtLimit) {
    return (
      <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800">
            Student limit reached ({limits.currentStudents}/{limits.maxStudents})
          </p>
          <p className="text-xs text-red-600 mt-0.5">Upgrade to invite more students</p>
        </div>
        <button
          onClick={onUpgradeClick}
          className="flex items-center gap-1 text-sm font-medium text-red-700 hover:text-red-900 transition-colors"
        >
          Upgrade <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-amber-800">
          {limits.currentStudents} / {limits.maxStudents} students
        </p>
        <p className="text-xs text-amber-600 mt-0.5">
          {limits.maxStudents - limits.currentStudents} invite{limits.maxStudents - limits.currentStudents !== 1 ? 's' : ''} remaining
        </p>
      </div>
    </div>
  );
}
