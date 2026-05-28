/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link } from 'react-router-dom';
import {
  Trophy,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Search,
  BarChart3,
  BookOpen,
  Star,
  GraduationCap,
  DollarSign,
  Target,
} from 'lucide-react';
import { useSession } from '../utils/useSession';
import { broadFields } from '../data/majorsData';
import { toTraditional } from '../utils/chineseLocalization';

interface StudentDashboardPageProps {
  language: 'zh' | 'zht' | 'en';
  onNavigateToExplore: () => void;
  onNavigateToCompare: () => void;
}

const t = (zh: string, en: string, lang: 'zh' | 'zht' | 'en') => (lang === 'en' ? en : lang === 'zht' ? toTraditional(zh) : zh);

/**
 * Market Signals — 4 compact cards showing global market trends.
 * Extracted from the current App.tsx national view bento cards.
 */
function MarketSignals({ language }: { language: 'zh' | 'zht' | 'en' }) {
  const tr = (zh: string, en: string) => t(zh, en, language);
  const signals = [
    {
      badge: tr('薪资之冠', 'PEAK EARNER'),
      badgeClass: 'bg-emerald-50 border-emerald-100 text-emerald-800',
      icon: <Trophy className="w-4 h-4 text-emerald-600" />,
      title: tr('石油工程 / 药学', 'Petroleum Eng & Pharmacy'),
      desc: tr('黄金工作年龄中位数收入高达 $146,000', 'Prime-age median earnings hitting $146,000'),
      value: '$146,000',
      valueClass: 'text-emerald-600',
    },
    {
      badge: tr('收入预警', 'CAUTION BASE'),
      badgeClass: 'bg-rose-50 border-rose-100 text-rose-700',
      icon: <AlertTriangle className="w-4 h-4 text-rose-500" />,
      title: tr('学前教育 / 咨询心理学', 'Early Childhood / Counseling'),
      desc: tr('本科平均回报最低的节点', 'Bottom single earners for bachelor degrees'),
      value: '$51,000',
      valueClass: 'text-rose-500',
    },
    {
      badge: tr('扩招最为剧烈', 'DEMAND SWELL'),
      badgeClass: 'bg-blue-50 border-blue-100 text-blue-700',
      icon: <TrendingUp className="w-4 h-4 text-blue-600" />,
      title: tr('计算机、统计与数学', 'Computers, Stats, & Math'),
      desc: tr('2009-2023 学位产出暴涨 +159%', 'Degree production scaling +159% since 2009'),
      value: '+159%',
      valueClass: 'text-blue-600',
    },
    {
      badge: tr('学位严重萎缩', 'TALENT RECEDE'),
      badgeClass: 'bg-amber-50 border-amber-100 text-amber-800',
      icon: <TrendingUp className="w-4 h-4 text-amber-600 rotate-180" />,
      title: tr('人文与自由艺术', 'Humanities & Liberal Arts'),
      desc: tr('14 年间招生规模骤减三分之一', 'Enrollment receding by -33% in 14 years'),
      value: '-33%',
      valueClass: 'text-amber-600',
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {signals.map((s) => (
        <div
          key={s.badge}
          className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs relative overflow-hidden group hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase border ${s.badgeClass}`}>
              {s.badge}
            </span>
            {s.icon}
          </div>
          <h3 className="text-slate-900 font-bold text-sm mt-1">{s.title}</h3>
          <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{s.desc}</p>
          <div className="flex items-baseline gap-1 mt-3 pt-3 border-t border-slate-100">
            <span className={`font-mono text-lg font-bold ${s.valueClass}`}>{s.value}</span>
          </div>
        </div>
      ))}
    </section>
  );
}

/**
 * Recommended Majors — personalized suggestions based on profile.
 */
function RecommendedMajors({ language }: { language: 'zh' | 'zht' | 'en' }) {
  const tr = (zh: string, en: string) => t(zh, en, language);
  // Show top 3 broad fields as starting recommendations
  const recommended = broadFields.slice(0, 3);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          {t('为你推荐', 'Recommended for You', language)}
        </h2>
        <Link to="/dashboard/student/explore" className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
          {t('查看全部', 'View All', language)}
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {recommended.map((field) => (
          <Link
            key={field.id}
            to="/dashboard/student/explore"
            className="bg-white border border-slate-200 p-4 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group"
          >
            <h3 className="font-bold text-slate-900 text-sm">
              {t(field.nameZh, field.nameEn, language)}
            </h3>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-500" />
                {field.recentMedianEarningsEn}
              </span>
              <span>{tr('起薪中位数', 'median starting')}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/**
 * Quick Actions — shortcut buttons.
 */
function QuickActions({
  language,
  onNavigateToExplore,
  onNavigateToCompare,
}: {
  language: 'zh' | 'zht' | 'en';
  onNavigateToExplore: () => void;
  onNavigateToCompare: () => void;
}) {
  const tr = (zh: string, en: string) => t(zh, en, language);
  const actions = [
    {
      label: tr('搜索专业', 'Search Majors'),
      icon: <Search className="w-4 h-4" />,
      path: '/search',
      color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
    },
    {
      label: tr('探索专业', 'Explore Majors'),
      icon: <BookOpen className="w-4 h-4" />,
      action: onNavigateToExplore,
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100',
    },
    {
      label: tr('对比专业', 'Compare'),
      icon: <BarChart3 className="w-4 h-4" />,
      action: onNavigateToCompare,
      color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
    },
    {
      label: tr('我的收藏', 'Saved'),
      icon: <Star className="w-4 h-4" />,
      path: '/dashboard/student/saved',
      color: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100',
    },
  ];

  return (
    <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {actions.map((a) =>
        'path' in a ? (
          <Link
            key={a.label}
            to={a.path}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${a.color}`}
          >
            {a.icon}
            {a.label}
          </Link>
        ) : (
          <button
            key={a.label}
            onClick={a.action}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${a.color}`}
          >
            {a.icon}
            {a.label}
          </button>
        )
      )}
    </section>
  );
}

/**
 * Competitiveness Overview — shows profile completeness and next steps.
 */
function CompetitivenessOverview({ language }: { language: 'zh' | 'zht' | 'en' }) {
  const { user } = useSession();
  const tr = (zh: string, en: string) => t(zh, en, language);

  // Check what profile fields are missing
  const missingFields: string[] = [];
  if (!user?.schoolName) missingFields.push(tr('学校名称', 'School Name'));

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-blue-600" />
          {tr('你的学术档案', 'Your Academic Profile')}
        </h2>
        <Link
          to="/dashboard/student/profile"
          className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
        >
          {tr('完善档案', 'Complete Profile')}
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {missingFields.length === 0 ? (
        <p className="text-sm text-emerald-600 font-medium flex items-center gap-2">
          <Target className="w-4 h-4" />
          {tr('档案已完善！开始探索专业吧。', 'Profile complete! Start exploring majors.')}
        </p>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">
            {tr('补全以下信息，获得更精准的推荐：', 'Complete the following for better recommendations:')}
          </p>
          <div className="flex flex-wrap gap-2">
            {missingFields.map((f) => (
              <span key={f} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 font-medium">
                {f}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default function StudentDashboardPage({
  language,
  onNavigateToExplore,
  onNavigateToCompare,
}: StudentDashboardPageProps) {
  const tr = (zh: string, en: string) => t(zh, en, language);
  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {tr('欢迎回来', 'Welcome Back')}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {tr('高校毕业生薪资与行业人才供求透视', 'College Major ROI & Career Intelligence')}
        </p>
      </div>

      {/* Market Signals */}
      <MarketSignals language={language} />

      {/* Recommended Majors */}
      <RecommendedMajors language={language} />

      {/* Quick Actions */}
      <QuickActions
        language={language}
        onNavigateToExplore={onNavigateToExplore}
        onNavigateToCompare={onNavigateToCompare}
      />

      {/* Competitiveness Overview */}
      <CompetitivenessOverview language={language} />
    </div>
  );
}
