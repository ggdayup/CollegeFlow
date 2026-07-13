/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, LayoutDashboard, Compass, Star, BarChart3, Settings } from 'lucide-react';
import { useSession } from '../utils/useSession';

interface SidebarProps {
  language: 'zh' | 'zht' | 'en';
  onNavigateToSettings: () => void;
}

interface NavItem {
  labelZh: string;
  labelEn: string;
  path: string;
  icon: React.ReactElement;
}

const t = (zh: string, en: string, lang: 'zh' | 'zht' | 'en') => (lang === 'en' ? en : zh);

function getNavItems(userType: string | null, role: string | null): NavItem[] {
  const isCounselor = userType === 'COUNSELOR' || role === 'COUNSELOR';
  const isParent = userType === 'PARENT' || role === 'PARENT';

  if (isCounselor) {
    return [
      {
        labelZh: '探索',
        labelEn: 'Explore',
        path: '/dashboard/counselor',
        icon: <Compass className="w-5 h-5" />,
      },
      {
        labelZh: '学生管理',
        labelEn: 'Students',
        path: '/dashboard/counselor/students',
        icon: <LayoutDashboard className="w-5 h-5" />,
      },
      {
        labelZh: '工具',
        labelEn: 'Tools',
        path: '/dashboard/counselor/tools',
        icon: <BarChart3 className="w-5 h-5" />,
      },
    ];
  }

  if (isParent) {
    return [
      {
        labelZh: '探索',
        labelEn: 'Explore',
        path: '/dashboard/parent',
        icon: <Compass className="w-5 h-5" />,
      },
      {
        labelZh: '院校筛选',
        labelEn: 'Schools',
        path: '/dashboard/parent/schools',
        icon: <LayoutDashboard className="w-5 h-5" />,
      },
    ];
  }

  // Base is Student
  return [
    {
      labelZh: '探索',
      labelEn: 'Explore',
      path: '/dashboard/student',
      icon: <Compass className="w-5 h-5" />,
    },
    {
      labelZh: '个性化概览',
      labelEn: 'Overview',
      path: '/dashboard/student/overview',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      labelZh: '收藏',
      labelEn: 'Saved',
      path: '/dashboard/student/saved',
      icon: <Star className="w-5 h-5" />,
    },
    {
      labelZh: '对比',
      labelEn: 'Compare',
      path: '/dashboard/student/compare',
      icon: <BarChart3 className="w-5 h-5" />,
    },
  ];
}

export default function Sidebar({ language, onNavigateToSettings }: SidebarProps) {
  const location = useLocation();
  const { user } = useSession();

  const items = getNavItems(user?.userType ?? null, user?.role ?? null);
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + '/');

  return (
    <>
      {/* Desktop sidebar — left side, 240px */}
      <aside className="hidden md:flex md:flex-col md:w-60 md:min-h-screen md:border-r md:border-slate-200 md:bg-white md:sticky md:top-0 md:h-screen">
        {/* Brand */}
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <span className="font-black text-lg tracking-tight text-slate-900">CollegeFlow</span>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 px-3 space-y-1">
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {item.icon}
              <span>{t(item.labelZh, item.labelEn, language)}</span>
            </Link>
          ))}
        </nav>

        {/* Settings at bottom */}
        <div className="px-3 pb-4">
          <button
            onClick={onNavigateToSettings}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <Settings className="w-5 h-5" />
            <span>{t('设置', 'Settings', language)}</span>
          </button>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 flex items-center justify-around px-2 py-1 safe-area-inset-bottom">
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-[10px] font-medium transition-colors min-w-0 flex-1 ${
              isActive(item.path)
                ? 'text-blue-600'
                : 'text-slate-400'
            }`}
          >
            {item.icon}
            <span className="truncate">{t(item.labelZh, item.labelEn, language)}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
