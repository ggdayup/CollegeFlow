import { useState, useRef, useEffect } from 'react';
import { X, User, Shield, Users, CreditCard, Bookmark, AlertTriangle } from 'lucide-react';
import ProfileTab from './ProfileTab';
import SecurityTab from './SecurityTab';
import UserTypeTab from './UserTypeTab';
import SubscriptionTab from './SubscriptionTab';
import BookmarksTab from './BookmarksTab';
import DangerZoneTab from './DangerZoneTab';
import { type SessionUser } from '../../utils/useSession';

type TabId = 'profile' | 'security' | 'usertype' | 'subscription' | 'bookmarks' | 'danger';

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  user: SessionUser;
  language: 'zh' | 'zht' | 'en';
  onUserUpdate: () => void;
}

const tabs: { id: TabId; icon: React.ReactElement; zh: string; en: string }[] = [
  { id: 'profile', icon: <User className="w-4 h-4" />, zh: '个人资料', en: 'Profile' },
  { id: 'security', icon: <Shield className="w-4 h-4" />, zh: '安全设置', en: 'Security' },
  { id: 'usertype', icon: <Users className="w-4 h-4" />, zh: '用户类型', en: 'User Type' },
  { id: 'subscription', icon: <CreditCard className="w-4 h-4" />, zh: '订阅状态', en: 'Subscription' },
  { id: 'bookmarks', icon: <Bookmark className="w-4 h-4" />, zh: '我的收藏', en: 'Bookmarks' },
  { id: 'danger', icon: <AlertTriangle className="w-4 h-4" />, zh: '危险操作', en: 'Danger Zone' },
];

export default function SettingsDrawer({ open, onClose, user, language, onUserUpdate }: SettingsDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Reset tab when drawer opens
  useEffect(() => {
    if (open) setActiveTab('profile');
  }, [open]);

  if (!open) return null;

  const t = (zh: string, en: string) => language === 'en' ? en : zh;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      {/* Drawer Panel */}
      <div
        ref={panelRef}
        className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right"
        style={{ animation: 'slideInRight 0.25s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">{t('账号设置', 'Account Settings')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label={t('关闭', 'Close')}
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-slate-100 px-2 pt-2 bg-slate-50/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab.icon}
              <span>{language === 'en' ? tab.en : tab.zh}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'profile' && <ProfileTab user={user} language={language} onUserUpdate={onUserUpdate} />}
          {activeTab === 'security' && <SecurityTab language={language} />}
          {activeTab === 'usertype' && <UserTypeTab user={user} language={language} onUserUpdate={onUserUpdate} />}
          {activeTab === 'subscription' && <SubscriptionTab user={user} language={language} />}
          {activeTab === 'bookmarks' && <BookmarksTab language={language} />}
          {activeTab === 'danger' && <DangerZoneTab language={language} />}
        </div>
      </div>
    </div>
  );
}
