import { CreditCard } from 'lucide-react';
import { type SessionUser } from '../../utils/useSession';

interface SubscriptionTabProps {
  user: SessionUser;
  language: 'zh' | 'zht' | 'en';
}

export default function SubscriptionTab({ user, language }: SubscriptionTabProps) {
  const t = (zh: string, en: string) => language === 'en' ? en : zh;
  const status = user.subscriptionStatus || 'none';
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-1">{t('订阅状态', 'Subscription')}</h3>
        <p className="text-xs text-slate-500">{t('查看当前账号的访问级别', 'Review your current access tier')}</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-50 border border-blue-100"><CreditCard className="w-5 h-5 text-blue-600" /></div>
          <div>
            <div className="text-xs text-slate-500">{t('当前状态', 'Current status')}</div>
            <div className="text-lg font-black text-slate-900 uppercase">{status}</div>
          </div>
        </div>
        <div className="mt-4 text-xs text-slate-500">
          {user.subscriptionEndsAt ? `${t('到期时间', 'Ends at')}: ${new Date(user.subscriptionEndsAt).toLocaleDateString()}` : t('暂无订阅到期时间', 'No subscription end date')}
        </div>
      </div>
    </div>
  );
}
