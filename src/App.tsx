/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { broadFields, detailedFields, majors, highlightMajors } from './data/majorsData';
import AnalyticsCharts from './components/AnalyticsCharts';
import MajorsDirectory from './components/MajorsDirectory';
import UniversityNavigator from './components/UniversityNavigator';
import ROICharts from './components/ROICharts';
import LandingPage from './components/LandingPage';
import { 
  Cpu, 
  TrendingUp, 
  Activity, 
  Brain, 
  Compass, 
  Wrench, 
  Palette, 
  GraduationCap, 
  Trophy, 
  AlertTriangle, 
  Sparkles, 
  Globe, 
  RefreshCw, 
  BookOpen, 
  Check, 
  Info,
  DollarSign,
  X,
  School,
  User as UserIcon,
  Home,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Maps Broad Fields ID to corresponding icon React component
const fieldIcons: Record<string, React.ReactElement> = {
  stem: <Cpu className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />,
  business_comms: <TrendingUp className="w-5 h-5 text-blue-650 group-hover:scale-110 transition-transform" />,
  healthcare: <Activity className="w-5 h-5 text-rose-600 group-hover:scale-110 transition-transform" />,
  social_sciences: <Brain className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />,
  multidisciplinary: <Compass className="w-5 h-5 text-teal-600 group-hover:scale-110 transition-transform" />,
  career_focused: <Wrench className="w-5 h-5 text-orange-600 group-hover:scale-110 transition-transform" />,
  humanities_arts: <Palette className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />,
  education_public_service: <GraduationCap className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
};

export default function App() {
  const [language, setLanguage] = useState<'zh' | 'zht' | 'en'>('zh');
  const [activeView, setActiveView] = useState<'national' | 'benchmark'>('national');
  const [selectedBroadField, setSelectedBroadField] = useState<string | null>(null);
  const [selectedDetailedField, setSelectedDetailedField] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const [userProfile, setUserProfile] = useState<any>(null);
  const [authStep, setAuthStep] = useState<1 | 2 | 3>(1);
  const [regRole, setRegRole] = useState<'STUDENT' | 'TEACHER' | 'COUNSELOR' | 'PARENT' | 'OTHER'>('STUDENT');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regSchool, setRegSchool] = useState('');
  const [regGradYear, setRegGradYear] = useState('2028');
  const [regSubject, setRegSubject] = useState('STEM');
  const [regSpecialty, setRegSpecialty] = useState('Global');
  const [regNote, setRegNote] = useState('');

  const fetchUserProfile = async (email: string) => {
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(email)}`);
      if (res.ok) {
        const profile = await res.json();
        setUserProfile(profile);
      } else {
        setUserProfile({
          email,
          name: email.split('@')[0],
          userType: email === 'demo@college.edu' ? 'COUNSELOR' : 'STUDENT',
        });
      }
    } catch (err) {
      setUserProfile({
        email,
        name: email.split('@')[0],
        userType: 'STUDENT',
      });
    }
  };

  // Multi-level state handlers
  const handleSelectBroadField = (id: string | null) => {
    setSelectedBroadField(id);
    setSelectedDetailedField(null); // Reset detailed category on parent select
  };

  const handleSelectDetailedField = (id: string | null) => {
    setSelectedDetailedField(id);
    if (id) {
      // Find its corresponding parent BroadField to keep filters synchronized
      const det = detailedFields.find(d => d.id === id);
      if (det) {
        setSelectedBroadField(det.broadFieldId);
      }
    }
  };

  const handleLinkNationalMajor = (nationalId: string) => {
    const targetMajor = majors.find(m => m.id === nationalId);
    if (targetMajor) {
      setSelectedBroadField(targetMajor.broadFieldId);
      setSelectedDetailedField(targetMajor.detailedFieldId);
      setActiveView('national');
      // Scroll to Step 2 Majors Directory header
      setTimeout(() => {
        const el = document.getElementById('majors-directory-heading');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
    }
  };

  const resetAllFieldFilters = () => {
    setSelectedBroadField(null);
    setSelectedDetailedField(null);
  };

  // Quick stats computed
  const filteredMajorsCount = useMemo(() => {
    return majors.filter(m => {
      if (selectedBroadField && m.broadFieldId !== selectedBroadField) return false;
      if (selectedDetailedField && m.detailedFieldId !== selectedDetailedField) return false;
      return true;
    }).length;
  }, [selectedBroadField, selectedDetailedField]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900 pb-20">
      
      {/* Top Professional Header Bar */}
      <header className="border-b border-rose-100/10 border-slate-200 bg-white/95 backdrop-blur-xl sticky top-0 z-50 transition-all duration-200 shadow-xs" id="main-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo & Headline */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl shadow-xs">
              <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-wider uppercase text-blue-600">
                  {language === 'zh' ? '本科专业数据库' : 'Bachelor Majors DB'}
                </span>
                <span className="px-1.5 py-0.5 bg-blue-50 border border-blue-150 text-[9px] text-blue-700 rounded font-mono font-bold tracking-widest uppercase">152 MAJORS</span>
              </div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none mt-0.5">
                {language === 'zh' ? '高校毕业生薪资与行业人才供卷分析系统' : 'Careers Selection & Industry Dynamics Engine'}
              </h1>
            </div>
          </div>

          {/* Bilingual Toggle & Authentication Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage(prev => prev === 'zh' ? 'zht' : prev === 'zht' ? 'en' : 'zh')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl border border-slate-200 text-xs font-semibold transition-all shadow-xs cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>
                {language === 'zh' ? '简体中文' : language === 'zht' ? '繁體中文' : 'English'}
              </span>
            </button>

            {!isLoggedIn ? (
              <button
                onClick={() => {
                  setAuthStep(1);
                  setShowAuthModal(true);
                }}
                className="flex items-center gap-1 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                {language === 'zh' ? '登录账号' : 'Sign In'}
              </button>
            ) : (
              <div className="flex items-center gap-2.5">
                {userProfile && (
                  <div className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 border border-blue-100 text-[10px] text-blue-700 rounded-lg font-bold shadow-xs">
                    {userProfile.userType === 'STUDENT' && <span>🎓 {language === 'zh' ? '学生' : language === 'zht' ? '學生' : 'Student'}</span>}
                    {userProfile.userType === 'TEACHER' && <span>🍎 {language === 'zh' ? '教师' : language === 'zht' ? '教師' : 'Teacher'}</span>}
                    {userProfile.userType === 'COUNSELOR' && <span>🗺️ {language === 'zh' ? '升学指导' : language === 'zht' ? '升學指導' : 'Counselor'}</span>}
                    {userProfile.userType === 'PARENT' && <span>🏠 {language === 'zh' ? '家长' : language === 'zht' ? '家長' : 'Parent'}</span>}
                    {userProfile.userType === 'OTHER' && <span>💼 {language === 'zh' ? '其他' : language === 'zht' ? '其他' : 'Other'}</span>}
                  </div>
                )}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl">
                  <UserIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-[11px] font-bold text-slate-700">{userProfile?.name || userEmail || 'demo@college.edu'}</span>
                </div>
                <button
                  onClick={() => {
                    setIsLoggedIn(false);
                    setSearchQuery('');
                    setUserEmail('');
                    setUserProfile(null);
                  }}
                  className="text-xs font-semibold text-rose-650 hover:text-rose-700 px-2 py-1.5 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 cursor-pointer"
                >
                  {language === 'zh' ? '退出' : 'Logout'}
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-10">

        {!isLoggedIn ? (
          <>
            {/* Brand Landing Page Entry Portal */}
            <LandingPage
              language={language}
              isLoggedIn={isLoggedIn}
              onTriggerAuth={() => setShowAuthModal(true)}
              onSearch={setSearchQuery}
              onNavigateToDashboard={(view) => setActiveView(view)}
              onTriggerMajorLink={handleLinkNationalMajor}
            />

            {/* Locked State paywall visual lock overlay */}
            <div className="relative border-t border-slate-200/60 pt-16 pb-20 text-center bg-slate-100/35 rounded-2xl border border-slate-200">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent pointer-events-none -mt-40" />
              <div className="max-w-md mx-auto space-y-6 relative z-10 px-4">
                <div className="w-14 h-14 bg-amber-50 border border-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <TrendingUp className="w-7 h-7 text-amber-500 animate-bounce" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 font-outfit">
                  {language === 'zh' ? '🔑 登录解锁完整多维分析大厅' : '🔑 Log In to Unlock Interactive Dashboards'}
                </h3>
                <p className="text-slate-550 text-slate-500 text-sm leading-relaxed">
                  {language === 'zh'
                    ? '我们的全美专业透视、标杆院校地图（UMich / Rice）、学分课程依赖流及折线收益 ROI 工具仅限注册用户使用。您可以一键登录体验完整版！'
                    : 'Access to detailed major comparisons, UMich/Rice network maps, lifecycle curves and credit bento flows requires a free account.'}
                </p>
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="px-8 py-3.5 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  {language === 'zh' ? '一键登录体验' : 'Sign In Now'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div id="interactive-dashboard-anchor" className="pt-4 border-t border-slate-200" />

            {/* Modern Segmented Tab Switcher */}
            <div className="flex border border-slate-200 bg-white/85 p-1.5 rounded-2xl max-w-2xl mx-auto shadow-xs gap-1.5">
          <button
            onClick={() => setActiveView('national')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeView === 'national'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Compass className="w-4 h-4 shrink-0" />
            <span>
              {language === 'zh' ? '全美专业近况透视' : 'National Career Outlook'}
            </span>
          </button>
          
          <button
            onClick={() => setActiveView('benchmark')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeView === 'benchmark'
                ? 'bg-slate-950 text-white shadow-md border-slate-905'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <School className={`w-4 h-4 shrink-0 transition-colors ${activeView === 'benchmark' ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
            <span>
              {language === 'zh' ? '标杆院校专业地图 (UMich / Rice)' : 'Benchmark Universities (UMich / Rice)'}
            </span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeView === 'benchmark' ? (
            <motion.div
              key="benchmark-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <div id="university-navigator-heading">
                <UniversityNavigator 
                  language={language}
                  onLinkNationalMajor={handleLinkNationalMajor}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="national-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-10"
            >
              {/* Dynamic Multi-Bento Stat Summary Card Row */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="metric-bento-cards">
          
          {/* Card 1: Highest Single Major Spotlight */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between shadow-xs relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-350" />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1 px-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-[9px] font-bold text-emerald-705 text-emerald-800 tracking-widest uppercase">
                  {language === 'zh' ? '薪资之冠' : 'PEAK EARNER'}
                </div>
                <Trophy className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-slate-900 font-extrabold text-lg mt-1 tracking-tight">
                {language === 'zh' ? '石油工程 / 药学' : 'Petroleum Eng & Pharmacy'}
              </h3>
              <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                {language === 'zh' 
                  ? '黄金工作年龄 (25-54) 中位数收入高达 $146,000 / $145,000 冠绝大学目录。' 
                  : 'Highest paying standalone majors for prime-age workers hitting $146,000 and $145,000.'}
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-baseline gap-1 mt-4">
              <span className="font-mono text-xl font-bold text-emerald-600">$146,000</span>
              <span className="text-slate-400 text-xs">/ {language === 'zh' ? '年薪中位数' : 'year median'}</span>
            </div>
          </div>

          {/* Card 2: Lowest Single Major Spotlight */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between shadow-xs relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-rose-500/10 transition-all duration-350" />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1 px-2.5 bg-rose-50 border border-rose-100 rounded-lg text-[9px] font-bold text-rose-700 tracking-widest uppercase">
                  {language === 'zh' ? '收入预警' : 'CAUTION BASE'}
                </div>
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              </div>
              <h3 className="text-slate-900 font-extrabold text-lg mt-1 tracking-tight">
                {language === 'zh' ? '学前教育 / 咨询心理学' : 'Early Childhood / Counseling'}
              </h3>
              <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                {language === 'zh' 
                  ? '中位数工作周期收入仅为 $51,000 - $55,000，属于本科平均回报最低节点。' 
                  : 'Bottom single earners with median earnings capped at $1,050 a week.'}
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-baseline gap-1 mt-4">
              <span className="font-mono text-xl font-bold text-rose-500">$51,000</span>
              <span className="text-slate-400 text-xs">/ {language === 'zh' ? '年薪中位数' : 'year median'}</span>
            </div>
          </div>

          {/* Card 3: Highest Demand Exploder */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between shadow-xs relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-blue-500/10 transition-all duration-350" />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1 px-2.5 bg-blue-50 border border-blue-100 rounded-lg text-[9px] font-bold text-blue-700 tracking-widest uppercase">
                  {language === 'zh' ? '扩招最为剧烈' : 'DEMAND SWELL'}
                </div>
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-slate-900 font-extrabold text-lg mt-1 tracking-tight">
                {language === 'zh' ? '计算机、统计与数学' : 'Computers, Stats, & Math'}
              </h3>
              <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                {language === 'zh' 
                  ? '学位产出增加幅度位居所有细分学科绝对头牌，在 2009-2023 之间暴涨 +159%。' 
                  : 'Massive surge in student demand with degree production scaling a record +159%.'}
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-baseline gap-1 mt-4">
              <span className="font-mono text-xl font-bold text-blue-600">+159%</span>
              <span className="text-slate-400 text-xs">/ {language === 'zh' ? '学位产出激增' : 'output grow'}</span>
            </div>
          </div>

          {/* Card 4: Shrinking Discipline Star */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between shadow-xs relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-amber-500/10 transition-all duration-350" />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1 px-2.5 bg-amber-50 border border-amber-100 rounded-lg text-[9px] font-bold text-amber-800 tracking-widest uppercase">
                  {language === 'zh' ? '学位严重萎缩' : 'TALENT RECEDE'}
                </div>
                <TrendingUp className="w-4 h-4 text-amber-600 hover:rotate-180 transition-transform duration-350" />
              </div>
              <h3 className="text-slate-900 font-extrabold text-lg mt-1 tracking-tight">
                {language === 'zh' ? '人文与自由艺术' : 'Humanities & Liberal Arts'}
              </h3>
              <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                {language === 'zh' 
                  ? '毕业生名额在 14 年间骤减三分之一，是向实用科技人才转移的重灾区。' 
                  : 'Fewer students choosing classical language & liberal arts, receding by a massive -33%.'}
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-baseline gap-1 mt-4">
              <span className="font-mono text-xl font-bold text-amber-600">-33%</span>
              <span className="text-slate-400 text-xs">/ {language === 'zh' ? '招生规模缩水' : 'recession'}</span>
            </div>
          </div>

        </section>

        {/* Interactive Industry Pill Core selector (8 Broad Fields) */}
        <section aria-labelledby="broad-fields-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="broad-fields-heading" className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                {language === 'zh' ? '第一步：按 8 大行业门类筛选透视' : 'Step 1: Segment & Filter by 8 Broad Industry Fields'}
              </h2>
              <p className="text-slate-550 text-slate-500 text-xs mt-1">
                {language === 'zh' 
                  ? '点击下方门类卡片，可一键过滤下方两个大版块的学术细项与全部 152 个大学专业的具体归类。' 
                  : 'Select any card below to focus the entire interactive database and dashboard specifically on that segment.'}
              </p>
            </div>

            {selectedBroadField && (
              <button
                onClick={resetAllFieldFilters}
                className="text-xs text-rose-650 text-rose-600 hover:bg-rose-100/50 hover:text-rose-700 transition-all font-semibold flex items-center gap-1 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                {language === 'zh' ? '清除筛选 (还原 152 个专业)' : 'Clear Select (Reset All)'}
              </button>
            )}
          </div>

          {/* Grid Bento Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {broadFields.map((field) => {
              const isSelected = selectedBroadField === field.id;
              
              // Mapping count of individual majors and sub field
              const countOfMajorsInside = majors.filter(m => m.broadFieldId === field.id).length;

              return (
                <div
                  key={field.id}
                  onClick={() => handleSelectBroadField(isSelected ? null : field.id)}
                  className={`group relative p-5 rounded-2xl cursor-pointer border transition-all duration-200 select-none ${
                    isSelected
                      ? 'bg-blue-50/75 border-blue-600 ring-1 ring-blue-600/30 shadow-md shadow-blue-100/50'
                      : 'bg-white border-slate-200 hover:bg-slate-50/50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-slate-50 group-hover:bg-white rounded-xl border border-slate-100 shadow-inner transition-colors">
                      {fieldIcons[field.id]}
                    </div>
                    {isSelected ? (
                      <span className="bg-blue-600 text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <Check className="w-2.5 h-2.5" />
                        {language === 'zh' ? '已选中' : 'Viewing'}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-50 border border-slate-150 text-slate-500 rounded-full text-[10px] font-mono">
                        {countOfMajorsInside} {language === 'zh' ? '专业' : 'majors'}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight line-clamp-1">
                    {language === 'zh' ? field.nameZh : field.nameEn}
                  </h3>
                  
                  {/* Key Earnings Metrics Preview inside the filter card */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[9.5px] font-bold uppercase tracking-wide">
                        {language === 'zh' ? '起步中位数' : 'Recent Grad'}
                      </span>
                      <strong className="text-slate-700 mt-0.5 block font-semibold">{field.recentMedianEarningsEn}/年</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9.5px] font-bold uppercase tracking-wide">
                        {language === 'zh' ? '黄金成熟期' : 'Prime-Age'}
                      </span>
                      <strong className="text-blue-650 mt-0.5 block font-bold text-blue-600">{field.primeMedianEarningsEn}/年</strong>
                    </div>
                  </div>

                  {/* Graduate premium tooltip metadata display */}
                  <div className="mt-3.5 flex items-center gap-2 text-[10px] text-slate-500 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    <Check className="w-3.5 h-3.5 text-blue-650 text-blue-650 text-blue-600 shrink-0" />
                    <span>
                      {language === 'zh' 
                        ? `读研加成 +${field.gradPremiumPercent}% | 硕博率 ${field.gradDegreePercent}%`
                        : `Grad premium +${field.gradPremiumPercent}% | Holds degree ${field.gradDegreePercent}%`
                      }
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section: Secondary Detailed Interactive Visual Charts Overlay */}
        <section aria-labelledby="visual-metrics-heading">
          <AnalyticsCharts
            selectedFieldId={selectedDetailedField}
            onSelectField={handleSelectDetailedField}
            language={language}
          />
        </section>

        {/* Section: Lifetime ROI curves with Cost-of-Living adjustment */}
        <section aria-labelledby="roi-metrics-heading" id="roi-charts-heading">
          <ROICharts language={language} />
        </section>

        {/* Section: Standard 152 Majors Main Table/Grid Filtering Directory */}
        <section aria-labelledby="majors-directory-heading" className="space-y-4">
          <div className="border-t border-slate-200 pt-8 mt-5">
            <h2 id="majors-directory-heading" className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-600" />
              {language === 'zh' ? '第二步：在 152 个专业列表作相应筛选' : 'Step 2: Explore Details of 152 Professional Bachelor Majors'}
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              {language === 'zh'
                ? '支持基于上方选中的大行业门类进行深层交集联动，您可以自由输入拼写搜索或切换网格、表格布局模式浏览。'
                : 'Enjoy dual linkage filtration across selected segments and detailed categories. Switch between clean grids or master-index rows.'}
            </p>
          </div>

          <MajorsDirectory
            selectedBroadFieldId={selectedBroadField}
            onSelectBroadField={handleSelectBroadField}
            selectedDetailedFieldId={selectedDetailedField}
            onSelectDetailedField={handleSelectDetailedField}
            language={language}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
          />
        </section>

        {/* Supplementary Academic Data Explanation Footnotes - Multi-User Verification */}
        <footer className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-4 text-xs text-slate-500 leading-relaxed mt-16 shadow-xs" id="dataset-disclaimer">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-3">
              <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-widest">{language === 'zh' ? '关于本数据库及相关统计口径说明' : 'Database Documentation & Statistical Baseline Methodology'}</h4>
              <p className="text-slate-600">
                {language === 'zh'
                  ? '本多层级轻量数据库源于针对全球高校毕业生群体职场发展报告的脱敏提炼。数据库采用三层交叉模式架构（8大产业板块 ➔ 16大细分专业方向 ➔ 152个具体合规学士学位名称）。'
                  : 'This hierarchical database models verified alumni outcomes. The underlying data structure links three distinct layers of mapping (8 Broad Fields ➔ 16 Detailed Academic Fields ➔ 152 Individual Approved Degrees).'}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 border border-slate-150 rounded-xl">
                <div>
                  <h5 className="font-bold text-slate-700 mb-1">{language === 'zh' ? '📊 定义指标 ➔ 近期毕业生' : '📊 Index ➔ Recent Graduates'}</h5>
                  <p className="text-slate-600">{language === 'zh' ? '年龄介于 22–26 岁的青年群体，展示了各专业的「入行起跑线」水平。' : 'Represents early career professionals from ages 22–26 (representing the standard immediate start point).'}</p>
                </div>
                <div>
                  <h5 className="font-bold text-slate-705 text-slate-700 mb-1">{language === 'zh' ? '📊 定义指标 ➔ 黄金劳动年龄' : '📊 Index ➔ Prime-Age Worker'}</h5>
                  <p className="text-slate-600">{language === 'zh' ? '核心成员年龄介于 25–54 岁，展示了工作成熟起飞期、能够发挥学科沉淀的最大平均职场回报。' : 'Represents age cohorts of 25–54 years, representing stabilized long-term occupational yield.'}</p>
                </div>
              </div>

              <div className="text-[11px] text-amber-700 border-l-2 border-amber-500/50 pl-3 italic">
                {language === 'zh'
                  ? '🔍 技术校准提示：高校毕业生数据在针对「教育与公共服务」的研究报告中存在微幅统计差异（具体文本声称读研比重 education 领先处于 50%，而附表图示整理由于年龄加权在 37%，此处系统对上述冲突在数据库详情气泡已做出自适应双边兼容性容错）。'
                  : '🔍 Discrepancy Calibration notice: The source report contains minor discrepancies regarding graduate degree attainment. While graphic indices list Education at 37%, text arguments cite 50%. This system handles both gracefully within tooltips.'}
              </div>
            </div>
          </div>
        </footer>
            </motion.div>
          )}
        </AnimatePresence>
          </>
        )}

        {/* Sleek Custom Sign In / Sign Up Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full border border-slate-200 shadow-2xl relative text-left"
            >
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="space-y-6 mt-2">
                
                {/* Step Progress Indicators */}
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${
                    authStep === 1 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  }`}>
                    {authStep > 1 ? <Check className="w-4 h-4" /> : '1'}
                  </div>
                  <div className="h-0.5 w-12 bg-slate-200" />
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${
                    authStep === 2 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : authStep > 2 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}>
                    {authStep > 2 ? <Check className="w-4 h-4" /> : '2'}
                  </div>
                  <div className="h-0.5 w-12 bg-slate-200" />
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${
                    authStep === 3 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}>
                    3
                  </div>
                </div>

                {/* STEP 1: Basic Credentials */}
                {authStep === 1 && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="flex justify-center mb-2">
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl shadow-xs">
                          <GraduationCap className="w-8 h-8 text-blue-600" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 font-outfit tracking-tight">
                        {language === 'zh' ? '开启 MajorAnalytics 之旅' : 'Join MajorAnalytics'}
                      </h3>
                      <p className="text-slate-500 text-xs mt-1">
                        {language === 'zh' ? '请输入您的基础信息以创建个人档案' : 'Enter your details to construct your profile'}
                      </p>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const emailVal = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
                      const nameVal = (e.currentTarget.elements.namedItem('name') as HTMLInputElement).value;
                      
                      if (emailVal.trim() && nameVal.trim()) {
                        setRegEmail(emailVal);
                        setRegName(nameVal);
                        
                        // Direct bypass for fast demo login
                        if (emailVal.toLowerCase() === 'demo@college.edu') {
                          setUserEmail(emailVal);
                          fetchUserProfile(emailVal);
                          setIsLoggedIn(true);
                          setShowAuthModal(false);
                          setTimeout(() => {
                            const el = document.getElementById('interactive-dashboard-anchor');
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }, 200);
                        } else {
                          setAuthStep(2);
                        }
                      }
                    }} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 px-0.5">
                          {language === 'zh' ? '您的姓名 / 昵称' : 'Your Name / Nickname'}
                        </label>
                        <input 
                          name="name"
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={language === 'zh' ? '例如：张同学、李老师' : 'e.g. John Doe'}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 px-0.5">
                          {language === 'zh' ? '邮箱地址' : 'Email Address'}
                        </label>
                        <input 
                          name="email"
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="name@example.com"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full py-3 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer mt-2"
                      >
                        {language === 'zh' ? '下一步：选择您的身份' : 'Next: Select Your Identity'}
                      </button>
                      
                      <div className="relative my-4 flex items-center justify-center">
                        <div className="absolute border-t border-slate-200 w-full z-0" />
                        <span className="px-3 bg-white text-[10px] text-slate-400 font-bold uppercase relative z-10 tracking-widest">
                          {language === 'zh' ? '或者一键快速体验' : 'OR QUICK EXPERIENCE'}
                        </span>
                      </div>
                      
                      <button 
                        type="button"
                        onClick={() => {
                          setRegEmail('demo@college.edu');
                          setRegName('Demo Student');
                          setUserEmail('demo@college.edu');
                          fetchUserProfile('demo@college.edu');
                          setIsLoggedIn(true);
                          setShowAuthModal(false);
                          setTimeout(() => {
                            const el = document.getElementById('interactive-dashboard-anchor');
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }, 200);
                        }}
                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                      >
                        🚀 {language === 'zh' ? '一键演示登录 (免注册直接进入)' : 'One-Click Demo Login'}
                      </button>
                    </form>
                  </div>
                )}

                {/* STEP 2: Role Card Selection */}
                {authStep === 2 && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-xl font-black text-slate-900 font-outfit tracking-tight">
                        {language === 'zh' ? '请选择您的专属身份' : 'Select Your Professional Identity'}
                      </h3>
                      <p className="text-slate-500 text-xs mt-1">
                        {language === 'zh' ? '身份将用于定制化多维 analysis 大厅的指引与报告' : 'This role will adapt interactive widgets and reports for you'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5 max-h-72 overflow-y-auto pr-1">
                      
                      {/* Student Card */}
                      <button
                        onClick={() => { setRegRole('STUDENT'); setAuthStep(3); }}
                        className="flex items-center gap-3.5 p-3.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all group cursor-pointer"
                      >
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-xl group-hover:scale-105 transition-all">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">
                            {language === 'zh' ? '🎓 学生 (Student)' : '🎓 Student'}
                          </h4>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                            {language === 'zh' ? '探索本科学科方向、起薪分布与毕业职业流向。' : 'Explore major categories, peak earnings, and career paths.'}
                          </p>
                        </div>
                      </button>

                      {/* Parent Card */}
                      <button
                        onClick={() => { setRegRole('PARENT'); setAuthStep(3); }}
                        className="flex items-center gap-3.5 p-3.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all group cursor-pointer"
                      >
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl group-hover:scale-105 transition-all">
                          <Home className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">
                            {language === 'zh' ? '🏠 家长 (Parent)' : '🏠 Parent'}
                          </h4>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                            {language === 'zh' ? '科学规划教育资金投入产出比，把关职业中后期收益。' : 'Evaluate college tuition ROI and prime-age wage metrics.'}
                          </p>
                        </div>
                      </button>

                      {/* Counselor Card */}
                      <button
                        onClick={() => { setRegRole('COUNSELOR'); setAuthStep(3); }}
                        className="flex items-center gap-3.5 p-3.5 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl text-left transition-all group cursor-pointer"
                      >
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-xl group-hover:scale-105 transition-all">
                          <Compass className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">
                            {language === 'zh' ? '🗺️ 升学指导 (College Counselor)' : '🗺️ College Counselor'}
                          </h4>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                            {language === 'zh' ? '协助学生对照各校荣誉课程与选专业网格，精准择校择系。' : 'Guide students using major mapping grids and benchmark stats.'}
                          </p>
                        </div>
                      </button>

                      {/* Teacher Card */}
                      <button
                        onClick={() => { setRegRole('TEACHER'); setAuthStep(3); }}
                        className="flex items-center gap-3.5 p-3.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-xl text-left transition-all group cursor-pointer"
                      >
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-xl group-hover:scale-105 transition-all">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">
                            {language === 'zh' ? '🍎 教师 (Teacher)' : '🍎 Teacher'}
                          </h4>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                            {language === 'zh' ? '掌握社会宏观学科人才缺口与大类产出，微调教学设计。' : 'Understand macroeconomic talent gaps and curriculum alignment.'}
                          </p>
                        </div>
                      </button>

                      {/* Other Card */}
                      <button
                        onClick={() => { setRegRole('OTHER'); setAuthStep(3); }}
                        className="flex items-center gap-3.5 p-3.5 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-xl text-left transition-all group cursor-pointer"
                      >
                        <div className="p-2 bg-rose-100 text-rose-600 rounded-xl group-hover:scale-105 transition-all">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">
                            {language === 'zh' ? '💼 其他 (Other / General)' : '💼 Other / General'}
                          </h4>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                            {language === 'zh' ? '调研行业流动性趋势、地区生活开销指数等专业分析。' : 'Track regional index benchmarks and career analytics.'}
                          </p>
                        </div>
                      </button>

                    </div>

                    <button 
                      type="button"
                      onClick={() => setAuthStep(1)}
                      className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold transition-all cursor-pointer mt-1"
                    >
                      {language === 'zh' ? '返回上一步' : 'Back'}
                    </button>
                  </div>
                )}

                {/* STEP 3: Differentiated Role Details Input */}
                {authStep === 3 && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-xs font-bold text-blue-700">
                        {regRole === 'STUDENT' && <span>🎓 {language === 'zh' ? '学生信息录入' : 'Student Setup'}</span>}
                        {regRole === 'PARENT' && <span>🏠 {language === 'zh' ? '家长信息录入' : 'Parent Setup'}</span>}
                        {regRole === 'COUNSELOR' && <span>🗺️ {language === 'zh' ? '指导员信息录入' : 'Counselor Setup'}</span>}
                        {regRole === 'TEACHER' && <span>🍎 {language === 'zh' ? '教师信息录入' : 'Teacher Setup'}</span>}
                        {regRole === 'OTHER' && <span>💼 {language === 'zh' ? '其他身份录入' : 'Other Setup'}</span>}
                      </div>
                      <h3 className="text-lg font-black text-slate-900 font-outfit mt-2 tracking-tight">
                        {language === 'zh' ? '完善您的专属画像' : 'Refine Your Identity Profile'}
                      </h3>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {language === 'zh' ? '几项专属配置将有助于我们呈现更精准的数据' : 'Provide these options to enable tailored dashboard parameters'}
                      </p>
                    </div>

                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      
                      try {
                        // Call Express BFF POST /api/users to store in Postgres
                        const response = await fetch('/api/users', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            email: regEmail,
                            name: regName,
                            userType: regRole,
                            schoolName: regSchool || null,
                            gradYear: (regRole === 'STUDENT' || regRole === 'PARENT') ? regGradYear : null,
                            counselorSpecialty: regRole === 'COUNSELOR' ? regSpecialty : null,
                            teacherSubject: regRole === 'TEACHER' ? regSubject : null,
                            customNote: regRole === 'OTHER' ? regNote : null
                          })
                        });

                        if (response.ok) {
                          const data = await response.json();
                          setUserProfile(data);
                        } else {
                          // Fallback manually
                          setUserProfile({
                            email: regEmail,
                            name: regName,
                            userType: regRole,
                            schoolName: regSchool || null,
                            gradYear: parseInt(regGradYear, 10) || null
                          });
                        }
                      } catch (err) {
                        setUserProfile({
                          email: regEmail,
                          name: regName,
                          userType: regRole,
                          schoolName: regSchool || null,
                          gradYear: parseInt(regGradYear, 10) || null
                        });
                      }

                      setUserEmail(regEmail);
                      setIsLoggedIn(true);
                      setShowAuthModal(false);

                      setTimeout(() => {
                        const el = document.getElementById('interactive-dashboard-anchor');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 200);

                    }} className="space-y-4">
                      
                      {/* 1. School / Institution name input (Common for most) */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 px-0.5">
                          {regRole === 'STUDENT' ? (language === 'zh' ? '就读/目标学校名称' : 'Current / Target School') :
                           regRole === 'PARENT' ? (language === 'zh' ? '孩子当前就读学校' : 'Child\'s Current School') :
                           regRole === 'TEACHER' ? (language === 'zh' ? '任教学校名称' : 'School / Institution Name') :
                           regRole === 'COUNSELOR' ? (language === 'zh' ? '服务机构/学校名称' : 'Agency / High School Name') :
                           (language === 'zh' ? '所在单位 / 组织' : 'Organization Name')}
                        </label>
                        <input 
                          type="text"
                          value={regSchool}
                          onChange={(e) => setRegSchool(e.target.value)}
                          required
                          className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={language === 'zh' ? '例如：密歇根大学、北京四中、某某留学机构' : 'e.g. University of Michigan'}
                        />
                      </div>

                      {/* 2. Target graduation / Entry year select (Only for Students and Parents) */}
                      {(regRole === 'STUDENT' || regRole === 'PARENT') && (
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 px-0.5">
                            {language === 'zh' ? '目标大学入学/毕业年份' : 'Target College Entry Year'}
                          </label>
                          <select
                            value={regGradYear}
                            onChange={(e) => setRegGradYear(e.target.value)}
                            className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="2026">2026</option>
                            <option value="2027">2027</option>
                            <option value="2028">2028</option>
                            <option value="2029">2029</option>
                            <option value="2030">2030</option>
                            <option value="2031">2031</option>
                          </select>
                        </div>
                      )}

                      {/* 3. Teaching Subject select (Only for Teachers) */}
                      {regRole === 'TEACHER' && (
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 px-0.5">
                            {language === 'zh' ? '主要授课领域 / 学科' : 'Teaching Subject Field'}
                          </label>
                          <select
                            value={regSubject}
                            onChange={(e) => setRegSubject(e.target.value)}
                            className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="STEM">{language === 'zh' ? '数理化与工程科学 (STEM)' : 'STEM & Science'}</option>
                            <option value="Humanities">{language === 'zh' ? '人文社会科学与自由艺术' : 'Humanities & Arts'}</option>
                            <option value="Business">{language === 'zh' ? '经济学与商科管理' : 'Business & Economics'}</option>
                            <option value="Healthcare">{language === 'zh' ? '医学与健康生命科学' : 'Healthcare & Medicine'}</option>
                            <option value="Other">{language === 'zh' ? '其他跨学科领域' : 'Other Subjects'}</option>
                          </select>
                        </div>
                      )}

                      {/* 4. Counselor Specialty focus select (Only for Counselors) */}
                      {regRole === 'COUNSELOR' && (
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 px-0.5">
                            {language === 'zh' ? '核心咨询与指导方向' : 'Counseling Specialization'}
                          </label>
                          <select
                            value={regSpecialty}
                            onChange={(e) => setRegSpecialty(e.target.value)}
                            className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="Global">{language === 'zh' ? '全球多国联合申请 (Global)' : 'Global Admissions'}</option>
                            <option value="US">{language === 'zh' ? '美国精英本科申请 (US Focus)' : 'US Admissions'}</option>
                            <option value="UK">{language === 'zh' ? '英国及英联邦高校 (UK Focus)' : 'UK Admissions'}</option>
                            <option value="Arts">{language === 'zh' ? '艺术与创意设计专业 (Arts Portfolio)' : 'Arts & Design Portfolio'}</option>
                            <option value="General">{language === 'zh' ? '综合职业生涯规划咨询' : 'General Career Planning'}</option>
                          </select>
                        </div>
                      )}

                      {/* 5. Custom Note (Only for Other) */}
                      {regRole === 'OTHER' && (
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 px-0.5">
                            {language === 'zh' ? '备注信息 / 研究兴趣' : 'Additional Notes / Research Interests'}
                          </label>
                          <textarea
                            value={regNote}
                            onChange={(e) => setRegNote(e.target.value)}
                            rows={3}
                            className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={language === 'zh' ? '选填：写下您关注的专业方向或具体研究指标' : 'Optional: e.g. focusing on high-ROI STEM outcomes'}
                          />
                        </div>
                      )}

                      <button 
                        type="submit"
                        className="w-full py-3.5 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer mt-2"
                      >
                        🌟 {language === 'zh' ? '立即完成注册并解锁' : 'Complete Registration & Unlock'}
                      </button>

                      <button 
                        type="button"
                        onClick={() => setAuthStep(2)}
                        className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                      >
                        {language === 'zh' ? '返回身份选择' : 'Back'}
                      </button>

                    </form>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}

      </main>
    </div>
  );
}
