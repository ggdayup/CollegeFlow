/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  BookOpen,
  Compass,
  Heart,
  List,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useSession } from '../utils/useSession';

type Role = 'STUDENT' | 'TEACHER' | 'COUNSELOR' | 'PARENT' | 'OTHER';

interface RoleCard {
  role: Role;
  icon: React.ReactElement;
  title: string;
  subtitle: string;
  color: string;
  borderColor: string;
  ringColor: string;
}

const roleCards: RoleCard[] = [
  {
    role: 'STUDENT',
    icon: <GraduationCap className="w-8 h-8" />,
    title: 'Student',
    subtitle: "I'm currently studying or planning to study",
    color: 'bg-blue-50',
    borderColor: 'border-blue-200',
    ringColor: 'ring-blue-600/30',
  },
  {
    role: 'TEACHER',
    icon: <BookOpen className="w-8 h-8" />,
    title: 'Teacher',
    subtitle: 'I teach at a school or institution',
    color: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    ringColor: 'ring-emerald-600/30',
  },
  {
    role: 'COUNSELOR',
    icon: <Compass className="w-8 h-8" />,
    title: 'Counselor',
    subtitle: "I'm an academic counselor or advisor",
    color: 'bg-purple-50',
    borderColor: 'border-purple-200',
    ringColor: 'ring-purple-600/30',
  },
  {
    role: 'PARENT',
    icon: <Heart className="w-8 h-8" />,
    title: 'Parent',
    subtitle: "I'm helping my child with college planning",
    color: 'bg-rose-50',
    borderColor: 'border-rose-200',
    ringColor: 'ring-rose-600/30',
  },
  {
    role: 'OTHER',
    icon: <List className="w-8 h-8" />,
    title: 'Other',
    subtitle: 'None of the above',
    color: 'bg-slate-50',
    borderColor: 'border-slate-200',
    ringColor: 'ring-slate-600/30',
  },
];

function needsOnboarding(user: ReturnType<typeof useSession>['user']): boolean {
  if (!user) return false;

  const hasRole = !!user.userType;
  let hasFields = false;

  switch (user.userType) {
    case 'STUDENT':
      hasFields = !!user.schoolName;
      break;
    case 'TEACHER':
      hasFields = !!user.teacherSubject;
      break;
    case 'COUNSELOR':
      hasFields = !!user.counselorSpecialty;
      break;
    case 'PARENT':
      hasFields = true;
      break;
    case 'OTHER':
      hasFields = true;
      break;
    default:
      hasFields = false;
  }

  return !hasRole || !hasFields;
}

/**
 * Check if user is a demo user who should bypass onboarding.
 */
function isDemoBypass(user: ReturnType<typeof useSession>['user']): boolean {
  return user?.email?.toLowerCase() === 'demo@college.edu';
}

export default function OnboardingPage() {
  const { user, loading } = useSession();
  const navigate = useNavigate();

  const [step, setStep] = useState<'select' | 'form' | 'insight'>('select');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [schoolName, setSchoolName] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [teacherSubject, setTeacherSubject] = useState('');
  const [counselorSpecialty, setCounselorSpecialty] = useState('');
  const [customNote, setCustomNote] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  // Redirect if onboarding is already complete
  useEffect(() => {
    if (!loading && user && !needsOnboarding(user)) {
      navigate('/');
    }
  }, [loading, user, navigate]);

  // Demo bypass: auto-select STUDENT and skip to dashboard
  useEffect(() => {
    if (!loading && user && isDemoBypass(user)) {
      navigate('/');
    }
  }, [loading, user, navigate]);

  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
    setError('');
    setStep('form');
  };

  const handleBack = () => {
    setSelectedRole(null);
    setStep('select');
    setError('');
  };

  const handleSkip = async () => {
    // Save minimal profile and redirect
    setSubmitting(true);
    try {
      const body: Record<string, string | number | null> = { userType: selectedRole || 'STUDENT' };
      if (selectedRole === 'STUDENT') body.schoolName = schoolName.trim() || null;
      await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      navigate('/');
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedRole) return;

    // Validate required fields
    if (selectedRole === 'STUDENT' && !schoolName.trim()) {
      setError('School name is required');
      return;
    }
    if (selectedRole === 'TEACHER' && !teacherSubject.trim()) {
      setError('Subject is required');
      return;
    }
    if (selectedRole === 'COUNSELOR' && !counselorSpecialty.trim()) {
      setError('Specialty is required');
      return;
    }

    // For STUDENT role, go directly to insight
    if (selectedRole === 'STUDENT' && step === 'form') {
      setStep('insight');
      setSubmitting(false);
      return;
    }

    setSubmitting(true);

    const body: Record<string, string | number | null> = {
      userType: selectedRole,
    };

    switch (selectedRole) {
      case 'STUDENT':
        body.schoolName = schoolName.trim();
        body.gradYear = gradYear ? parseInt(gradYear, 10) : null;
        break;
      case 'TEACHER':
        body.teacherSubject = teacherSubject.trim();
        break;
      case 'COUNSELOR':
        body.counselorSpecialty = counselorSpecialty.trim();
        break;
      case 'PARENT':
        break;
      case 'OTHER':
        body.customNote = customNote.trim() || null;
        break;
    }

    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to save your profile. Please try again.');
        return;
      }

      navigate('/');
      window.location.reload();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Logo and header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl shadow-xs mb-4">
            <GraduationCap className="w-7 h-7 text-blue-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome to College Majors DB
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Tell us about yourself to get started
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xl">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700"
              >
                {error}
              </motion.div>
            )}

            {step === 'select' && (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-lg font-bold text-slate-900 mb-6">
                  Which best describes you?
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {roleCards.map((card) => (
                    <button
                      key={card.role}
                      onClick={() => handleSelectRole(card.role)}
                      className={`group text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${card.color} ${card.borderColor} hover:shadow-md hover:scale-[1.02]`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-white/80 border ${card.borderColor} shadow-xs`}>
                          {card.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                            {card.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {card.subtitle}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 'form' && selectedRole && (
              <motion.form
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* Back button */}
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-xs text-slate-500 hover:text-slate-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  Change role
                </button>

                {/* Selected role badge */}
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  {roleCards.find(c => c.role === selectedRole)?.icon}
                  <span className="font-bold text-slate-900 text-sm">
                    {roleCards.find(c => c.role === selectedRole)?.title}
                  </span>
                </div>

                {/* Role-specific fields */}
                {selectedRole === 'STUDENT' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 px-0.5">
                        School Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. University of Michigan"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 px-0.5">
                        Graduation Year (optional)
                      </label>
                      <input
                        type="number"
                        value={gradYear}
                        onChange={(e) => setGradYear(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. 2027"
                        min={2020}
                        max={2035}
                      />
                    </div>
                  </>
                )}

                {selectedRole === 'TEACHER' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 px-0.5">
                      Subject / Discipline *
                    </label>
                    <input
                      type="text"
                      required
                      value={teacherSubject}
                      onChange={(e) => setTeacherSubject(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. Computer Science"
                    />
                  </div>
                )}

                {selectedRole === 'COUNSELOR' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 px-0.5">
                      Specialty / Area *
                    </label>
                    <input
                      type="text"
                      required
                      value={counselorSpecialty}
                      onChange={(e) => setCounselorSpecialty(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. STEM Career Counseling"
                    />
                  </div>
                )}

                {selectedRole === 'PARENT' && (
                  <div className="text-center py-6">
                    <Heart className="w-12 h-12 text-rose-300 mx-auto mb-4" />
                    <p className="text-sm text-slate-600">
                      That&apos;s all we need! Click Continue to explore college majors.
                    </p>
                  </div>
                )}

                {selectedRole === 'OTHER' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 px-0.5">
                      Tell us about yourself (optional)
                    </label>
                    <textarea
                      value={customNote}
                      onChange={(e) => setCustomNote(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={4}
                      placeholder="Anything you'd like us to know..."
                    />
                  </div>
                )}

                {/* Submit button */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleSkip}
                    disabled={submitting}
                    className="py-3 px-5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-600 rounded-xl text-sm font-medium transition-all cursor-pointer"
                  >
                    Skip for Now
                  </button>
                </div>
              </motion.form>
            )}


            {step === 'insight' && (
              <motion.div
                key="insight"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center space-y-6"
              >
                <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Welcome to CollegeFlow</h2>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
                    Your workspace is ready. Explore majors, universities, and career insights at your own pace.
                  </p>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/dashboard/student/profile')}
                    className="w-full py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <GraduationCap className="w-4 h-4" />
                    Complete Your Academic Profile
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="w-full py-3 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Start Exploring <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
