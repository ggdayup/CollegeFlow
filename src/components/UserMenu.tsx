import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, Shield, ChevronDown } from 'lucide-react';
import { type SessionUser } from '../utils/useSession';

interface UserMenuProps {
  user: SessionUser;
  language: 'zh' | 'zht' | 'en';
}

export default function UserMenu({ user, language }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/sign-out', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Best-effort logout; clear client state regardless
    }
    setOpen(false);
    window.location.href = '/';
  };

  const t = (zh: string, en: string) => (language === 'en' ? en : zh);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors cursor-pointer"
      >
        <User className="w-4 h-4 text-blue-600" />
        <span className="text-[11px] font-bold text-slate-700 max-w-24 truncate">
          {user.name || user.email}
        </span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-800 truncate">{user.name || user.email}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
            {user.role === 'ADMIN' && (
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-purple-50 border border-purple-200 rounded text-[10px] font-bold text-purple-700">
                <Shield className="w-3 h-3" /> Admin
              </span>
            )}
          </div>

          {/* Menu items */}
          <div className="py-1">
            <button
              onClick={() => { setOpen(false); navigate('/profile'); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <User className="w-4 h-4 text-slate-400" />
              {t('个人资料', 'Profile')}
            </button>
            <button
              onClick={() => { setOpen(false); navigate('/settings'); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              {t('设置', 'Settings')}
            </button>
            {user.role === 'ADMIN' && (
              <button
                onClick={() => { setOpen(false); navigate('/admin/users'); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer"
              >
                <Shield className="w-4 h-4 text-purple-500" />
                Admin Panel
              </button>
            )}
          </div>

          <div className="border-t border-slate-100 py-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              {t('退出登录', 'Logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
