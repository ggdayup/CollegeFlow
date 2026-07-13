import { CheckCircle2, Clock, AlertCircle, AlertTriangle } from 'lucide-react';

interface ConfidenceBadgeProps {
  state: string;
  verificationId?: string | null;
}

export default function ConfidenceBadge({ state, verificationId }: ConfidenceBadgeProps) {
  const config: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    verified: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="w-3 h-3" />, label: 'Verified' },
    stale: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock className="w-3 h-3" />, label: 'Stale' },
    missing: { color: 'bg-slate-50 text-slate-500 border-slate-200', icon: <AlertCircle className="w-3 h-3" />, label: 'No Data' },
    conflicting: { color: 'bg-red-50 text-red-700 border-red-200', icon: <AlertTriangle className="w-3 h-3" />, label: 'Conflict' },
  };
  const c = config[state] || config.missing;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full border ${c.color}`} title={`${c.label}: Data ${state === 'verified' ? 'from authoritative source' : state === 'stale' ? 'older than 2 years' : 'not available'}`}>
        {c.icon} {c.label}
      </span>
      {verificationId && (
        <code className="text-[10px] text-slate-400 font-mono" title={`Source verification: ${verificationId}`}>
          [{verificationId}]
        </code>
      )}
    </span>
  );
}
