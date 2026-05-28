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
import StudentDashboardPage from './pages/StudentDashboardPage';
import PaywallModal from './components/PaywallModal';
import Sidebar from './components/Sidebar';
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
            <div className="flex">
              {/* Sidebar navigation */}
              <Sidebar
                language={language}
                onNavigateToSettings={() => navigate('/settings')}
              />

              {/* Main content area */}
              <main className="flex-1 min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
                {(() => {
                  const path = location.pathname;

                  // Student profile
                  if (path === '/dashboard/student/profile') {
                    return <StudentProfilePage />;
                  }

                  // Compare tool
                  if (path === '/dashboard/student/compare' || path.startsWith('/dashboard/student/results/')) {
                    return <ComparisonPage />;
                  }

                  // Explore tab — national view (majors)
                  if (path === '/dashboard/student/explore') {
                    return (
                      <div className="space-y-10 max-w-5xl">
                        <div id="interactive-dashboard-anchor" className="pt-4 border-t border-slate-200" />
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
                            <span>{language === 'zh' ? '全美专业近况透视' : 'National Career Outlook'}</span>
                          </button>
                          <button
                            onClick={() => setActiveView('benchmark')}
                            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                              activeView === 'benchmark'
                                ? 'bg-slate-950 text-white shadow-md'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                          >
                            <School className={`w-4 h-4 shrink-0 transition-colors ${activeView === 'benchmark' ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
                            <span>{language === 'zh' ? '标杆院校专业地图' : 'Benchmark Universities'}</span>
                          </button>
                        </div>
                        <AnimatePresence mode="wait">
                          {activeView === 'benchmark' ? (
                            <motion.div key="benchmark" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }}>
                              <UniversityNavigator language={language} onLinkNationalMajor={handleLinkNationalMajor} />
                            </motion.div>
                          ) : (
                            <motion.div key="national" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }}>
                              <div id="broad-fields-heading" />
                              <MajorsDirectory
                                language={language}
                                selectedBroadFieldId={selectedBroadField}
                                selectedDetailedFieldId={selectedDetailedField}
                                onSelectBroadField={handleSelectBroadField}
                                onSelectDetailedField={handleSelectDetailedField}
                                searchQuery={searchQuery}
                                onSearchQueryChange={setSearchQuery}
                              />
                              <AnalyticsCharts
                                language={language}
                                selectedFieldId={selectedDetailedField}
                                onSelectField={handleSelectDetailedField}
                              />
                              <ROICharts language={language} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }

                  // Default: Personal Dashboard
                  return (
                    <StudentDashboardPage
                      language={language}
                      onNavigateToExplore={() => navigate('/dashboard/student/explore')}
                      onNavigateToCompare={() => navigate('/dashboard/student/compare')}
                    />
                  );
                })()}
              </main>
            </div>
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
