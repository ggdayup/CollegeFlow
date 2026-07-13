import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSession } from '../utils/useSession';
import { ChevronRight, Check, GraduationCap, DollarSign, Target, Zap } from 'lucide-react';

interface ProfileData {
  gpa: number | null;
  satScore: number | null;
  actScore: number | null;
  annualBudgetMin: number | null;
  annualBudgetMax: number | null;
  interestAreas: string[] | null;
  weights: { salary: number; prestige: number; cost: number; fit: number } | null;
}

const INTEREST_AREAS = [
  'stem', 'business_comms', 'healthcare', 'social_sciences',
  'multidisciplinary', 'career_focused', 'humanities_arts', 'education_public_service'
];
const AREA_LABELS: Record<string, string> = {
  stem: 'STEM (Science, Tech, Engineering, Math)',
  business_comms: 'Business & Communications',
  healthcare: 'Healthcare & Life Sciences',
  social_sciences: 'Social Sciences',
  multidisciplinary: 'Multidisciplinary Studies',
  career_focused: 'Career-Focused Programs',
  humanities_arts: 'Humanities & Arts',
  education_public_service: 'Education & Public Service',
};

export default function StudentProfilePage() {
  const { user, loading: sessionLoading } = useSession();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    gpa: null, satScore: null, actScore: null,
    annualBudgetMin: null, annualBudgetMax: null,
    interestAreas: null, weights: null,
  });
  const [completeness, setCompleteness] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [weights, setWeights] = useState({ salary: 0.25, prestige: 0.25, cost: 0.25, fit: 0.25 });

  useEffect(() => {
    if (!sessionLoading && !user) {
      navigate('/login');
      return;
    }
    if (user && user.userType !== 'STUDENT') {
      navigate('/');
      return;
    }
    loadProfile();
  }, [user, sessionLoading, navigate]);

  const loadProfile = async () => {
    try {
      const res = await fetch('/api/student/profile', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
          setCompleteness(data.completeness || 0);
          if (data.profile.interestAreas) setSelectedInterests(data.profile.interestAreas);
          if (data.profile.weights) setWeights(data.profile.weights);
          if (data.profile.gpa) setStep(2); // Skip to step 2 if profile has data
        }
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        gpa: profile.gpa ?? undefined,
        satScore: profile.satScore ?? undefined,
        actScore: profile.actScore ?? undefined,
        annualBudgetMin: profile.annualBudgetMin ?? undefined,
        annualBudgetMax: profile.annualBudgetMax ?? undefined,
        interestAreas: selectedInterests.length > 0 ? selectedInterests : undefined,
        weights,
      };
      const res = await fetch('/api/student/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (res.ok) {
        if (step < 3) setStep(step + 1);
        else navigate('/dashboard/student/compare');
      }
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleSkip = () => {
    if (step < 3) setStep(step + 1);
    else navigate('/dashboard/student/compare');
  };

  const toggleInterest = (area: string) => {
    setSelectedInterests(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const handleWeightChange = (key: string, value: number) => {
    const newWeights = { ...weights, [key]: value };
    // Normalize to sum=1
    const sum = Object.values(newWeights).reduce((a, b) => a + b, 0);
    if (sum > 0) {
      Object.keys(newWeights).forEach(k => { newWeights[k as keyof typeof newWeights] /= sum; });
    }
    setWeights(newWeights);
  };

  if (loading || sessionLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Progress Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Step {step} of 3</span>
            <span className="text-sm text-slate-500">{completeness}% complete</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {['Role & Basics', 'Academic & Budget', 'Preferences'].map((label, i) => (
              <span key={label} className={`text-xs ${i + 1 <= step ? 'text-indigo-600 font-medium' : 'text-slate-400'}`}>
                {i + 1 < step ? '✓' : i + 1}. {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Step 1: Role & Basics */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Welcome to CollegeFlow</h2>
                <p className="text-slate-500 text-sm">Let's set up your college decision workspace</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">High School (optional)</label>
                <input
                  type="text"
                  value={user?.schoolName || ''}
                  disabled
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-500"
                  placeholder="You can update this in settings"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Expected Graduation Year (optional)</label>
                <input
                  type="number"
                  min="2024"
                  max="2035"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. 2027"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button onClick={handleSkip} className="px-6 py-2.5 text-slate-600 hover:text-slate-900 transition-colors">
                Skip for Now
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Academic & Budget */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Academic & Budget Info</h2>
                <p className="text-slate-500 text-sm">Help us find the best matches for you</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">GPA (0.0 - 4.0)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={profile.gpa ?? ''}
                  onChange={(e) => setProfile(p => ({ ...p, gpa: e.target.value ? parseFloat(e.target.value) : null }))}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. 3.75"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">SAT Score (optional)</label>
                  <input
                    type="number"
                    min="400"
                    max="1600"
                    value={profile.satScore ?? ''}
                    onChange={(e) => setProfile(p => ({ ...p, satScore: e.target.value ? parseInt(e.target.value) : null }))}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="400-1600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ACT Score (optional)</label>
                  <input
                    type="number"
                    min="1"
                    max="36"
                    value={profile.actScore ?? ''}
                    onChange={(e) => setProfile(p => ({ ...p, actScore: e.target.value ? parseInt(e.target.value) : null }))}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="1-36"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Annual Budget Range</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500">Min ($)</label>
                    <input
                      type="number"
                      value={profile.annualBudgetMin ?? ''}
                      onChange={(e) => setProfile(p => ({ ...p, annualBudgetMin: e.target.value ? parseInt(e.target.value) : null }))}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. 20000"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Max ($)</label>
                    <input
                      type="number"
                      value={profile.annualBudgetMax ?? ''}
                      onChange={(e) => setProfile(p => ({ ...p, annualBudgetMax: e.target.value ? parseInt(e.target.value) : null }))}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. 60000"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button onClick={handleSkip} className="px-6 py-2.5 text-slate-600 hover:text-slate-900 transition-colors">
                Skip for Now
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Preference Weights */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Set Your Priorities</h2>
                <p className="text-slate-500 text-sm">Tell us what matters most in your college search</p>
              </div>
            </div>

            {/* Interest Areas */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-700 mb-3">Areas of Interest</label>
              <div className="grid grid-cols-2 gap-2">
                {INTEREST_AREAS.map(area => (
                  <button
                    key={area}
                    onClick={() => toggleInterest(area)}
                    className={`px-3 py-2 rounded-lg text-sm text-left transition-colors border ${
                      selectedInterests.includes(area)
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {selectedInterests.includes(area) && <Check className="w-3 h-3 inline mr-1" />}
                    {AREA_LABELS[area]}
                  </button>
                ))}
              </div>
            </div>

            {/* Weight Sliders */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">Decision Weights</label>
              {[
                { key: 'salary', label: 'Career Outcomes (Salary)', icon: '💼' },
                { key: 'prestige', label: 'Prestige & Rankings', icon: '🏆' },
                { key: 'cost', label: 'Affordability', icon: <DollarSign className="w-4 h-4 inline" /> },
                { key: 'fit', label: 'Personal Fit', icon: '🎯' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700">{label}</span>
                    <span className="font-mono text-slate-600">{Math.round((weights as Record<string, number>)[key] * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round((weights as Record<string, number>)[key] * 100)}
                    onChange={(e) => handleWeightChange(key, parseInt(e.target.value) / 100)}
                    className="w-full accent-indigo-600"
                  />
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button onClick={handleSkip} className="px-6 py-2.5 text-slate-600 hover:text-slate-900 transition-colors">
                Skip for Now
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2 font-medium"
              >
                <Check className="w-4 h-4" /> Start Comparing
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
