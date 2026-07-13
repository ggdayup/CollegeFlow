import { X, Check, ArrowRight, Users } from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (plan: 'pro' | 'counselor') => void;
  onAskParent?: () => void;
  featureName?: string;
  triggerContext?: 'comparison' | 'roi' | 'prerequisite' | 'report' | 'student_limit';
  userRole?: string;
  userType?: string;
}

const ROLE_MESSAGES: Record<string, Record<string, string>> = {
  student: {
    title: 'Unlock {feature}',
    subtitle: 'Ask a parent to upgrade your workspace',
  },
  counselor: {
    title: 'Upgrade to serve more students',
    subtitle: 'Your students and families will benefit from these features',
  },
  default: {
    title: 'Unlock {feature}',
    subtitle: 'Upgrade your plan to access this feature',
  },
};

const CONTEXT_MESSAGES: Record<string, string> = {
  comparison: 'Create unlimited school comparisons',
  roi: 'View full 40-year ROI projections',
  prerequisite: 'Explore complete prerequisite pathways',
  report: 'Generate branded PDF reports',
  student_limit: 'Invite more students to your workspace',
};

export default function PaywallModal({
  isOpen, onClose, onUpgrade, onAskParent,
  featureName = 'this feature',
  triggerContext,
  userRole = 'student',
  userType = 'STUDENT',
}: PaywallModalProps) {
  if (!isOpen) return null;

  const isStudent = userRole === 'FREE' && userType === 'STUDENT';
  const messageKey = isStudent ? 'student' : 'counselor';
  const messages = ROLE_MESSAGES[messageKey] || ROLE_MESSAGES.default;
  const title = messages.title.replace('{feature}', featureName);
  const contextHint = triggerContext ? CONTEXT_MESSAGES[triggerContext] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-slate-900 mb-1">{title}</h2>
        {contextHint && <p className="text-sm text-indigo-600 font-medium mb-1">{contextHint}</p>}
        <p className="text-sm text-slate-500 mb-6">{messages.subtitle}</p>

        <div className="space-y-3 mb-6">
          {[
            { plan: 'Pro', price: '$19/mo', features: ['Unlimited comparisons', 'Branded PDF reports', 'Full ROI analysis'] },
            { plan: 'Counselor', price: '$49/mo', features: ['Up to 50 students', 'Branded reports', 'CRM dashboard', 'Priority support'] },
          ].map(tier => (
            <div key={tier.plan} className="border border-slate-200 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-slate-900">{tier.plan}</span>
                <span className="text-sm text-slate-500">{tier.price}</span>
              </div>
              <ul className="space-y-1">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onUpgrade('pro')}
            className="flex-1 py-2.5 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1 cursor-pointer"
          >
            Upgrade to Pro <ArrowRight className="w-4 h-4" />
          </button>
          {isStudent && onAskParent && (
            <button
              onClick={onAskParent}
              className="py-2.5 px-4 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-xl text-sm font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-4 h-4" /> Ask Parent
            </button>
          )}
          <button onClick={onClose} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold cursor-pointer">
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
