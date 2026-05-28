/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { broadFields, detailedFields, majors } from './data/majorsData';
import AnalyticsCharts from './components/AnalyticsCharts';
import MajorsDirectory from './components/MajorsDirectory';
import UniversityNavigator from './components/UniversityNavigator';
import ROICharts from './components/ROICharts';
import LandingPage from './components/LandingPage';
import IPEDSAdminAudit from './components/IPEDSAdminAudit';
import AdminUserManagement from './components/AdminUserManagement';
import ProtectedRoute from './components/ProtectedRoute';
import UserMenu from './components/UserMenu';
import { useSession } from './utils/useSession';
import { useEntitlements } from './utils/useEntitlements';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import OnboardingPage from './pages/OnboardingPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import JoinPage from './pages/JoinPage';
import CounselorDashboardPage from './pages/CounselorDashboardPage';
import StudentProfilePage from './pages/StudentProfilePage';
import ComparisonPage from './pages/ComparisonPage';
import UniversityDetailPage from './pages/UniversityDetailPage';
import SubscriptionPage from './pages/SubscriptionPage';
import SearchResultsPage from './pages/SearchResultsPage';
import PaywallModal from './components/PaywallModal';
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
  Shield,
  Globe,
  BookOpen,
  Eye,
  Check,
  Info,
  X,
  School,
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

/**
 * Admin page wrapper with router context.
 */
function AdminPage({ language }: { language: 'zh' | 'zht' | 'en' }) {
  const navigate = useNavigate();
  const { user, loading: sessionLoading } = useSession();
  const { isLoggedIn } = useEntitlements(user);

  return (
    <ProtectedRoute user={user} loading={sessionLoading} requireAdmin>
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white/95 backdrop-blur-xl sticky top-0 z-50 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="text-sm text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Back to Dashboard
              </button>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-sm text-slate-900">Admin Panel</span>
              </div>
            </div>
            {isLoggedIn && user && <UserMenu user={user} language={language} />}
          </div>
        </header>
        <AdminUserManagement />
      </div>
    </ProtectedRoute>
  );
}

/**
 * Inner app component that has access to router context.
 * Receives session and entitlements from above.
 */
function AppContent({
  language,
  setLanguage,
  user,
  sessionLoading,
  entitlements,
  isLoggedIn,
}: {
  language: 'zh' | 'zht' | 'en';
  setLanguage: React.Dispatch<React.SetStateAction<'zh' | 'zht' | 'en'>>;
  user: ReturnType<typeof useSession>['user'];
  sessionLoading: boolean;
  entitlements: ReturnType<typeof useEntitlements>['entitlements'];
  isLoggedIn: boolean;
}) {
  const [activeView, setActiveView] = useState<'national' | 'benchmark' | 'ipeds-admin'>('national');
  const [selectedBroadField, setSelectedBroadField] = useState<string | null>(null);
  const [selectedDetailedField, setSelectedDetailedField] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResultsQuery, setSearchResultsQuery] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Email verification guard: redirect unverified logged-in users to /verify-email
  // demo@college.edu is a bypass (handled server-side)
  const isDemoEmail = user?.email?.toLowerCase() === 'demo@college.edu';
  const needsVerification =
    isLoggedIn &&
    user &&
    !isDemoEmail &&
    !(user as { emailVerified?: boolean }).emailVerified &&
    location.pathname !== '/verify-email';

  if (needsVerification) {
    return <Navigate to="/verify-email" state={{ from: location }} replace />;
  }

  // Onboarding guard: redirect verified users who haven't completed role setup
  const isDemoBypass = user?.email?.toLowerCase() === 'demo@college.edu';
  const isEmailVerified = isDemoBypass || !!user?.emailVerified;
  const hasUserType = !!user?.userType;
  const hasRoleFields = (() => {
    switch (user?.userType) {
      case 'STUDENT': return !!user.schoolName;
      case 'TEACHER': return !!user.teacherSubject;
      case 'COUNSELOR': return !!user.counselorSpecialty;
      case 'PARENT':
      case 'OTHER': return true;
      default: return false;
    }
  })();
  const needsOnboarding = isLoggedIn && isEmailVerified && (!hasUserType || !hasRoleFields);
  const onOnboarding = location.pathname === '/onboarding';

  if (needsOnboarding && !onOnboarding) {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  // Multi-level state handlers
  const handleSelectBroadField = (id: string | null) => {
    setSelectedBroadField(id);
    setSelectedDetailedField(null);
  };

  const handleSelectDetailedField = (id: string | null) => {
    setSelectedDetailedField(id);
    if (id) {
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

  const filteredMajorsCount = useMemo(() => {
    return majors.filter(m => {
      if (selectedBroadField && m.broadFieldId !== selectedBroadField) return false;
      if (selectedDetailedField && m.detailedFieldId !== selectedDetailedField) return false;
      return true;
    }).length;
  }, [selectedBroadField, selectedDetailedField]);

  // TODO: demo@college.edu bypass — remove after full session migration
  const handleDemoLogin = () => {
    // For now, just navigate to home and show guest-mode dashboard
    // After Better Auth is fully configured, this should create a real session
    navigate('/');
  };

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

          {/* Bilingual Toggle & Authentication */}
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

            {sessionLoading ? (
              <div className="w-8 h-8 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
            ) : isLoggedIn && user ? (
              <UserMenu user={user} language={language} />
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-400 px-2">
                  {language === 'zh' ? '访客模式' : 'Guest Mode'}
                </span>
                <Link
                  to="/login"
                  className="flex items-center gap-1 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  {language === 'zh' ? '登录账号' : 'Sign In'}
                </Link>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-10">

        {!isLoggedIn ? (
          searchResultsQuery ? (
            <SearchResultsPage
              query={searchResultsQuery}
              isLoggedIn={isLoggedIn}
              language={language}
              onBack={() => setSearchResultsQuery(null)}
              onTriggerAuth={() => navigate('/login')}
              onNavigateToMajor={(majorId) => setSearchResultsQuery(majorId)}
              onNavigateToUniversity={(universityId) => navigate(`/university/${universityId}`)}
            />
          ) : (
            <LandingPage
              language={language}
              isLoggedIn={isLoggedIn}
              onTriggerAuth={() => navigate('/login')}
              onSearch={setSearchResultsQuery}
              onNavigateToDashboard={(view) => setActiveView(view)}
              onTriggerMajorLink={handleLinkNationalMajor}
            />
          )
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

              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => setActiveView('ipeds-admin')}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeView === 'ipeds-admin'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Eye className="w-4 h-4 shrink-0" />
                  <span>IPEDS Admin</span>
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {activeView === 'ipeds-admin' ? (
                <motion.div
                  key="ipeds-admin-view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                >
                  <IPEDSAdminAudit />
                </motion.div>
              ) : activeView === 'benchmark' ? (
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

                  {/* Supplementary Academic Data Explanation Footnotes */}
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

      </main>
    </div>
  );
}

/**
 * Root App component with routing.
 * Wraps everything in BrowserRouter and sets up routes.
 */
export default function App() {
  const [language, setLanguage] = useState<'zh' | 'zht' | 'en'>('zh');
  const { user, loading: sessionLoading } = useSession();
  const { entitlements, isLoggedIn } = useEntitlements(user);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/university/:universityId" element={<UniversityDetailPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />

        {/* MVP: Counselor & Student routes */}
        <Route path="/dashboard/counselor" element={<CounselorDashboardPage />} />
        <Route path="/dashboard/counselor/student/:workspaceId" element={<CounselorDashboardPage />} />
        <Route path="/dashboard/student/profile" element={<StudentProfilePage />} />
        <Route path="/dashboard/student/compare" element={<ComparisonPage />} />
        <Route path="/dashboard/student/results/:sessionId" element={<ComparisonPage />} />

        {/* Admin-only routes */}
        <Route
          path="/admin/users"
          element={<AdminPage language={language} />}
        />

        {/* Main app route */}
        <Route
          path="/*"
          element={
            <AppContent
              language={language}
              setLanguage={setLanguage}
              user={user}
              sessionLoading={sessionLoading}
              entitlements={entitlements}
              isLoggedIn={isLoggedIn}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
