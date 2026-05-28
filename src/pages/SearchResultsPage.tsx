/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ArrowLeft, Search, BookOpen, School, BarChart3, Lock, TrendingUp, Users, Vote } from 'lucide-react';
import { motion } from 'motion/react';
import { searchSeedData, SearchResultMajor, SearchResultUniversity, SearchResultComparison } from '../utils/searchSeed';

interface SearchResultsPageProps {
  query: string;
  isLoggedIn: boolean;
  language: 'zh' | 'zht' | 'en';
  onBack: () => void;
  onTriggerAuth: () => void;
  onNavigateToMajor: (majorId: string) => void;
  onNavigateToUniversity: (universityId: string) => void;
}

const t = (zh: string, en: string, language: 'zh' | 'zht' | 'en'): string => {
  if (language === 'zh') return zh;
  if (language === 'zht') return zh; // Simplified for now; could add traditional mapping
  return en;
};

export default function SearchResultsPage({
  query,
  isLoggedIn,
  language,
  onBack,
  onTriggerAuth,
  onNavigateToMajor,
  onNavigateToUniversity,
}: SearchResultsPageProps) {
  const [results, setResults] = useState<ReturnType<typeof searchSeedData> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Small delay for perceived search effort
    const timer = setTimeout(() => {
      setResults(searchSeedData(query));
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const tr = (zh: string, en: string) => t(zh, en, language);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500">{tr('搜索中...', 'Searching...')}</p>
        </div>
      </div>
    );
  }

  const hasResults = results && (results.majors.length > 0 || results.universities.length > 0 || results.comparisons.length > 0);

  if (!hasResults) {
    return renderGapState({ query, language, onBack, onTriggerAuth });
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Back button + query header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {tr('返回首页', 'Back to Home')}
          </button>
          <div className="flex-1 text-center">
            <span className="text-sm text-slate-400">{tr('搜索结果', 'Results for')}</span>
            <span className="ml-2 font-bold text-slate-900">&ldquo;{query}&rdquo;</span>
          </div>
        </div>

        {/* Matched Universities */}
        {results!.universities.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <School className="w-5 h-5 text-amber-500" />
              {tr('匹配院校', 'Matched Universities')}
              <span className="text-sm font-normal text-slate-400">({results!.universities.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {results!.universities.map((u) => (
                <UniversityCard key={u.id} uni={u} isLoggedIn={isLoggedIn} language={language} onNavigate={onNavigateToUniversity} onTriggerAuth={onTriggerAuth} />
              ))}
            </div>
          </section>
        )}

        {/* Matched Majors */}
        {results!.majors.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              {tr('匹配专业', 'Matched Majors')}
              <span className="text-sm font-normal text-slate-400">({results!.majors.length})</span>
            </h2>
            <div className="space-y-3">
              {results!.majors.map((m) => (
                <MajorCard key={m.id} major={m} isLoggedIn={isLoggedIn} language={language} onNavigate={onNavigateToMajor} onTriggerAuth={onTriggerAuth} />
              ))}
            </div>
          </section>
        )}

        {/* Comparisons */}
        {results!.comparisons.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              {tr('推荐对比', 'Suggested Comparisons')}
            </h2>
            <div className="space-y-3">
              {results!.comparisons.map((c) => (
                <ComparisonCard key={c.id} comp={c} isLoggedIn={isLoggedIn} onTriggerAuth={onTriggerAuth} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function UniversityCard({ uni, isLoggedIn, language, onNavigate, onTriggerAuth }: {
  uni: SearchResultUniversity;
  isLoggedIn: boolean;
  language: 'zh' | 'zht' | 'en';
  onNavigate: (id: string) => void;
  onTriggerAuth: () => void;
}) {
  const tr = (zh: string, en: string) => t(zh, en, language);
  const name = language === 'en' ? uni.nameEn : uni.nameZh;

  return (
    <div
      onClick={() => {
        if (!isLoggedIn) {
          onTriggerAuth();
          return;
        }
        onNavigate(uni.id);
      }}
      className={`relative bg-white rounded-xl border p-4 transition-all hover:shadow-md ${isLoggedIn ? 'border-slate-200 hover:border-blue-400 cursor-pointer' : 'border-slate-200 cursor-pointer'}`}
    >
      <h3 className="font-bold text-slate-900 text-sm">{name}</h3>
      <p className="text-xs text-slate-500 mt-1">{uni.shortNameEn}</p>
      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
        <span className="flex items-center gap-1"><School className="w-3 h-3" /> {uni.schoolCount} {tr('学院', 'schools')}</span>
        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {uni.majorCount} {tr('专业', 'majors')}</span>
      </div>
      {!isLoggedIn && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2 text-blue-700 font-semibold text-xs">
            <Lock className="w-4 h-4" />
            {tr('登录查看详情', 'Log in to view details')}
          </div>
        </div>
      )}
    </div>
  );
}

function MajorCard({ major, isLoggedIn, language, onNavigate, onTriggerAuth }: {
  major: SearchResultMajor;
  isLoggedIn: boolean;
  language: 'zh' | 'zht' | 'en';
  onNavigate: (id: string) => void;
  onTriggerAuth: () => void;
}) {
  const tr = (zh: string, en: string) => t(zh, en, language);
  const name = language === 'en' ? major.nameEn : major.nameZh;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-400 transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 text-sm">{name}</h3>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">{major.auditCode}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-sm font-bold text-emerald-600">{major.salary}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">{tr('起薪中位数', 'Median starting')}</p>
        </div>
      </div>
      {/* ROI curve teaser — locked for anonymous */}
      {!isLoggedIn && (
        <div
          onClick={onTriggerAuth}
          className="mt-3 relative rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-3 cursor-pointer hover:border-blue-300 group"
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-slate-300" />
            <span className="text-xs text-slate-400">{tr('40年 ROI 生命周期曲线', '40-Year ROI Lifecycle Curve')}</span>
          </div>
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] rounded-lg flex items-center justify-center group-hover:bg-white/50 transition-colors">
            <div className="flex items-center gap-1.5 text-blue-700 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              {tr('登录解锁', 'Log in to unlock')}
            </div>
          </div>
        </div>
      )}
      {isLoggedIn && (
        <div
          onClick={() => onNavigate(major.id)}
          className="mt-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-3 cursor-pointer hover:border-blue-300 transition-colors"
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-blue-600 font-semibold">{tr('查看完整 ROI 分析与课程流', 'View full ROI analysis & course flow')}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ComparisonCard({ comp, isLoggedIn, onTriggerAuth }: {
  comp: SearchResultComparison;
  isLoggedIn: boolean;
  onTriggerAuth: () => void;
}) {
  return (
    <div
      onClick={comp.locked && !isLoggedIn ? onTriggerAuth : undefined}
      className={`relative bg-white rounded-xl border p-4 transition-all ${comp.locked && !isLoggedIn ? 'border-slate-200' : 'border-slate-200 hover:border-emerald-400 cursor-pointer hover:shadow-md'}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-900 text-sm">{comp.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{comp.description}</p>
        </div>
        {comp.locked && !isLoggedIn && (
          <Lock className="w-4 h-4 text-slate-300" />
        )}
      </div>
    </div>
  );
}

function renderGapState({ query, language, onBack, onTriggerAuth }: {
  query: string;
  language: 'zh' | 'zht' | 'en';
  onBack: () => void;
  onTriggerAuth: () => void;
}) {
  const tr = (zh: string, en: string) => t(zh, en, language);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-6"
      >
        <div className="mx-auto w-16 h-16 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center">
          <Search className="w-8 h-8 text-amber-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            {tr('暂未收录', 'Not Yet in Our Database')}
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            {tr('我们暂未收录「', 'We haven\'t yet recorded data for "')}
            <span className="font-bold text-slate-700">{query}</span>
            {tr('」的相关数据。CollegeFlow 坚持数据真实性原则，所有数据均来自 IPEDS、CDS 等权威来源。', '" at CollegeFlow. We maintain strict data authenticity — all data comes from authoritative sources like IPEDS and CDS.')}
          </p>
        </div>

        {/* Benchmark suggestions */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-left">
          <p className="text-xs font-bold text-slate-500 uppercase mb-3">
            {tr('推荐标杆院校', 'Recommended Benchmark Universities')}
          </p>
          <div className="space-y-2">
            <div
              onClick={onTriggerAuth}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 cursor-pointer hover:border-blue-200 transition-colors"
            >
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {language === 'en' ? 'University of Michigan' : '密歇根大学 (UMich)'}
                </p>
                <p className="text-xs text-slate-400">
                  {language === 'en' ? 'Top 25 National · 200+ Majors' : '全美 Top 25 · 200+ 专业'}
                </p>
              </div>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div
              onClick={onTriggerAuth}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 cursor-pointer hover:border-blue-200 transition-colors"
            >
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {language === 'en' ? 'Rice University' : '莱斯大学 (Rice)'}
                </p>
                <p className="text-xs text-slate-400">
                  {language === 'en' ? 'Top 20 National · Elite ROI' : '全美 Top 20 · 精英回报'}
                </p>
              </div>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Demand vote */}
        <button
          onClick={onTriggerAuth}
          className="w-full py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Vote className="w-4 h-4" />
          {tr('投票收录该院校/专业', 'Vote to add this university/major')}
        </button>

        {/* Back to home */}
        <button
          onClick={onBack}
          className="text-sm text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
        >
          {tr('返回首页', 'Back to Home')}
        </button>
      </motion.div>
    </div>
  );
}
