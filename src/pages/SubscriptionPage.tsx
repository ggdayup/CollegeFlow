import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';

const PLANS = [
  { id: 'free', name: 'Free', price: '$0', period: 'forever', features: ['1 student workspace', '1 comparison session', 'Basic data access'], cta: null },
  { id: 'pro', name: 'Pro', price: '$19', period: '/month', features: ['Unlimited students', 'Unlimited comparisons', 'Branded PDF reports', 'Full data access'], cta: 'Upgrade to Pro' },
  { id: 'counselor', name: 'Counselor', price: '$49', period: '/month', features: ['Up to 50 students', 'Branded reports', 'CRM dashboard', 'Priority support'], cta: 'Upgrade to Counselor' },
];

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<{ status: string; planType: string | null }>({ status: 'none', planType: null });
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    fetch('/api/subscription/status', { credentials: 'include' })
      .then(res => res.json())
      .then(setStatus)
      .finally(() => setLoading(false));
  }, []);

  const handleCheckout = async (planType: 'pro' | 'counselor') => {
    setCheckoutLoading(planType);
    try {
      const res = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ planType }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch {
      setCheckoutLoading(null);
    }
  };

  const handleManage = async () => {
    try {
      const res = await fetch('/api/subscription/manage', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.manageUrl) {
        window.location.href = data.manageUrl;
      }
    } catch {
      // error
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Subscription</h1>
        {status.status !== 'none' && (
          <p className="text-sm text-slate-500 mb-8">
            Current plan: <span className="font-semibold capitalize">{status.planType || status.status}</span>
            {status.status === 'active' && <Check className="w-4 h-4 text-emerald-600 inline ml-1" />}
          </p>
        )}

        {sessionId && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-700">
            Payment successful! Your subscription is being activated.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(plan => (
            <div key={plan.id} className={`bg-white rounded-2xl border p-6 ${status.planType === plan.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'}`}>
              <h2 className="text-lg font-bold text-slate-900">{plan.name}</h2>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-black text-slate-900">{plan.price}</span>
                <span className="text-sm text-slate-500">{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span className="text-slate-600">{f}</span>
                  </li>
                ))}
              </ul>
              {plan.cta && status.planType !== plan.id && (
                <button
                  onClick={() => handleCheckout(plan.id as 'pro' | 'counselor')}
                  disabled={checkoutLoading !== null}
                  className="w-full py-2.5 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold cursor-pointer"
                >
                  {checkoutLoading === plan.id ? <Loader2 className="w-4 h-4 animate-spin inline" /> : plan.cta}
                </button>
              )}
              {status.planType === plan.id && (
                <button onClick={handleManage} className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold cursor-pointer">
                  Manage Subscription
                </button>
              )}
              {status.planType === plan.id && plan.id === 'free' && (
                <p className="text-xs text-slate-400 text-center">No payment required</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
