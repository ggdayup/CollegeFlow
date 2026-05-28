import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSession } from '../utils/useSession';
import { Search, X, Plus, Loader2, BarChart3, Shield, DollarSign, TrendingUp, Target, FileText, AlertTriangle, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface University {
  id: string;
  nameEn: string;
  rankingQs?: number;
  rankingUsNews?: number;
}

interface ComparisonSession {
  id: string;
  name: string;
  createdAt: string;
}

interface ComparisonOption {
  universityId: string;
  universityName: string;
  lenses: {
    admissions: { acceptanceRate: number | null; sat25th: number | null; sat75th: number | null; act25th: number | null; act75th: number | null; medianGpa: number | null; confidence: string };
    outcomes: { medianSalary2yr: number | null; medianDebt: number | null; gradRate: number | null; confidence: string };
    cost: { tuitionInState: number | null; tuitionOutState: number | null; roomBoard: number | null; totalCost: number | null; confidence: string };
    fit: { overallScore: number; breakdown: { academic: number; financial: number; interest: number }; explanation: string };
  };
}

function ConfidenceBadge({ state }: { state: string }) {
  const config: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    verified: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="w-3 h-3" />, label: 'Verified' },
    stale: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock className="w-3 h-3" />, label: 'Stale' },
    missing: { color: 'bg-slate-50 text-slate-500 border-slate-200', icon: <AlertCircle className="w-3 h-3" />, label: 'No Data' },
    conflicting: { color: 'bg-red-50 text-red-700 border-red-200', icon: <AlertTriangle className="w-3 h-3" />, label: 'Conflict' },
  };
  const c = config[state] || config.missing;
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full border ${c.color}`} title={`${c.label}: Data ${state === 'verified' ? 'from authoritative source' : state === 'stale' ? 'older than 2 years' : 'not available'}`}>
      {c.icon} {c.label}
    </span>
  );
}

function DataGapWarning({ options }: { options: ComparisonOption[] }) {
  const missingFields: string[] = [];
  for (const opt of options) {
    if (opt.lenses.admissions.confidence === 'missing') missingFields.push(`${opt.universityName}: Admissions data`);
    if (opt.lenses.outcomes.confidence === 'missing') missingFields.push(`${opt.universityName}: Outcomes data`);
    if (opt.lenses.cost.confidence === 'missing') missingFields.push(`${opt.universityName}: Cost data`);
  }
  if (missingFields.length === 0) return null;
  return (
    <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div>
        <h4 className="font-semibold text-amber-900 text-sm">Data Gaps Detected</h4>
        <p className="text-xs text-amber-700 mt-1">Some data points are unavailable for the selected schools.</p>
        <ul className="mt-2 text-xs text-amber-600 space-y-0.5">
          {missingFields.slice(0, 5).map((f, i) => <li key={i}>• {f}</li>)}
          {missingFields.length > 5 && <li>...and {missingFields.length - 5} more</li>}
        </ul>
      </div>
    </div>
  );
}

function formatCurrency(val: number | null): string {
  if (val === null) return '—';
  return `$${(val / 1000).toFixed(1)}K`;
}

export default function ComparisonPage() {
  const { user, loading: sessionLoading } = useSession();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'builder' | 'results'>('builder');
  const [universities, setUniversities] = useState<University[]>([]);
  const [sessions, setSessions] = useState<ComparisonSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnis, setSelectedUnis] = useState<{ universityId: string; universityName: string }[]>([]);
  const [sessionName, setSessionName] = useState('');
  const [creating, setCreating] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<{
    sessionId: string;
    name: string;
    options: ComparisonOption[];
    tradeoffs: Array<{ description: string; options: string[] }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeLens, setActiveLens] = useState<'admissions' | 'outcomes' | 'cost' | 'fit'>('admissions');

  useEffect(() => {
    if (!sessionLoading && !user) { navigate('/login'); return; }
    if (user?.userType !== 'STUDENT') { navigate('/'); return; }
    loadData();
  }, [user, sessionLoading, navigate]);

  const loadData = async () => {
    try {
      const [uniRes, sessRes] = await Promise.all([
        fetch('/api/universities'),
        fetch('/api/comparison/list', { credentials: 'include' }),
      ]);
      if (uniRes.ok) {
        const data = await uniRes.json();
        setUniversities(data.map((u: Record<string, unknown>) => ({
          id: u.id as string,
          nameEn: u.nameEn as string,
          rankingQs: u.qsRank as number,
          rankingUsNews: u.usNewsRank as number,
        })));
      }
      if (sessRes.ok) {
        const data = await sessRes.json();
        setSessions(data.sessions || []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  const searchResults = searchQuery.length >= 2
    ? universities.filter(u =>
        u.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 10)
    : [];

  const addUniversity = (uni: University) => {
    if (selectedUnis.length >= 4) return;
    if (selectedUnis.some(s => s.universityId === uni.id)) return;
    setSelectedUnis(prev => [...prev, { universityId: uni.id, universityName: uni.nameEn }]);
    setSearchQuery('');
  };

  const removeUniversity = (id: string) => {
    setSelectedUnis(prev => prev.filter(s => s.universityId !== id));
  };

  const handleCreateComparison = async () => {
    if (selectedUnis.length < 2) return;
    setCreating(true);
    try {
      const res = await fetch('/api/comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: sessionName || 'My Comparison',
          options: selectedUnis,
        }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        setActiveSessionId(data.sessionId);
        setMode('results');
      }
    } catch { /* ignore */ }
    setCreating(false);
  };

  const loadComparison = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/comparison/${sessionId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setComparisonResult(data);
        setMode('results');
      }
    } catch { /* ignore */ }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
    </div>;
  }

  // ─── Builder Mode ───
  if (mode === 'builder') {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white/95 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link to="/" className="text-sm text-slate-500 hover:text-slate-900">← Home</Link>
            <h1 className="font-semibold text-slate-900">Compare Universities</h1>
            <div className="text-sm text-slate-500">{user?.name || user?.email}</div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Existing Sessions */}
          {sessions.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Recent Comparisons</h2>
              <div className="space-y-2">
                {sessions.map(s => (
                  <button
                    key={s.id}
                    onClick={() => loadComparison(s.id)}
                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 border border-slate-100 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-4 h-4 text-indigo-600" />
                      <span className="font-medium text-slate-900">{s.name}</span>
                    </div>
                    <span className="text-sm text-slate-500">{new Date(s.createdAt).toLocaleDateString()}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* New Comparison */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">New Comparison</h2>
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Session name (optional)"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            {/* Selected Universities */}
            {selectedUnis.length > 0 && (
              <div className="mb-4 space-y-2">
                {selectedUnis.map(s => (
                  <div key={s.universityId} className="flex items-center justify-between px-4 py-2.5 bg-indigo-50 rounded-lg">
                    <span className="font-medium text-indigo-900">{s.universityName}</span>
                    <button onClick={() => removeUniversity(s.universityId)} className="text-indigo-600 hover:text-indigo-800">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <p className="text-sm text-slate-500">{selectedUnis.length}/4 universities selected</p>
              </div>
            )}

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search universities..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {searchResults.map(u => (
                    <button
                      key={u.id}
                      onClick={() => addUniversity(u)}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between"
                    >
                      <span className="text-sm font-medium text-slate-900">{u.nameEn}</span>
                      <div className="flex gap-3 text-xs text-slate-500">
                        {u.rankingUsNews && <span>USN #{u.rankingUsNews}</span>}
                        {u.rankingQs && <span>QS #{u.rankingQs}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleCreateComparison}
              disabled={selectedUnis.length < 2 || creating}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Compare {selectedUnis.length} Universities
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ─── Results Mode ───
  if (!comparisonResult) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading comparison...</div>;
  }

  const { options, tradeoffs } = comparisonResult;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => setMode('builder')} className="text-sm text-slate-500 hover:text-slate-900">← Back</button>
          <h1 className="font-semibold text-slate-900">{comparisonResult.name}</h1>
          <button
            onClick={() => navigate('/dashboard/student/compare')}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            New Comparison
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Lens Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'admissions', label: 'Admissions', icon: <Shield className="w-4 h-4" /> },
            { key: 'outcomes', label: 'Outcomes', icon: <TrendingUp className="w-4 h-4" /> },
            { key: 'cost', label: 'Cost', icon: <DollarSign className="w-4 h-4" /> },
            { key: 'fit', label: 'Fit Score', icon: <Target className="w-4 h-4" /> },
          ].map(lens => (
            <button
              key={lens.key}
              onClick={() => setActiveLens(lens.key as typeof activeLens)}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                activeLens === lens.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {lens.icon} {lens.label}
            </button>
          ))}
        </div>

        {/* Data Gap Warning */}
        <DataGapWarning options={options} />

        {/* Comparison Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600 bg-slate-50">Metric</th>
                {options.map(opt => (
                  <th key={opt.universityId} className="px-6 py-3 text-center">
                    <div className="font-semibold text-slate-900">{opt.universityName}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeLens === 'admissions' && (
                <>
                  <tr>
                    <td className="px-6 py-3 text-sm text-slate-700">Acceptance Rate</td>
                    {options.map(opt => (
                      <td key={opt.universityId} className="px-6 py-3 text-center">
                        {opt.lenses.admissions.acceptanceRate ? `${opt.lenses.admissions.acceptanceRate}%` : '—'}
                        <ConfidenceBadge state={opt.lenses.admissions.confidence} />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-3 text-sm text-slate-700">SAT Range (25th-75th)</td>
                    {options.map(opt => (
                      <td key={opt.universityId} className="px-6 py-3 text-center text-sm">
                        {opt.lenses.admissions.sat25th && opt.lenses.admissions.sat75th
                          ? `${opt.lenses.admissions.sat25th}-${opt.lenses.admissions.sat75th}`
                          : '—'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-3 text-sm text-slate-700">ACT Range (25th-75th)</td>
                    {options.map(opt => (
                      <td key={opt.universityId} className="px-6 py-3 text-center text-sm">
                        {opt.lenses.admissions.act25th && opt.lenses.admissions.act75th
                          ? `${opt.lenses.admissions.act25th}-${opt.lenses.admissions.act75th}`
                          : '—'}
                      </td>
                    ))}
                  </tr>
                </>
              )}
              {activeLens === 'outcomes' && (
                <>
                  <tr>
                    <td className="px-6 py-3 text-sm text-slate-700">Median Salary (2yr after grad)</td>
                    {options.map(opt => (
                      <td key={opt.universityId} className="px-6 py-3 text-center">
                        {formatCurrency(opt.lenses.outcomes.medianSalary2yr)}
                        <ConfidenceBadge state={opt.lenses.outcomes.confidence} />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-3 text-sm text-slate-700">Median Debt at Graduation</td>
                    {options.map(opt => (
                      <td key={opt.universityId} className="px-6 py-3 text-center">
                        {formatCurrency(opt.lenses.outcomes.medianDebt)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-3 text-sm text-slate-700">Graduation Rate</td>
                    {options.map(opt => (
                      <td key={opt.universityId} className="px-6 py-3 text-center">
                        {opt.lenses.outcomes.gradRate ? `${opt.lenses.outcomes.gradRate}%` : '—'}
                      </td>
                    ))}
                  </tr>
                </>
              )}
              {activeLens === 'cost' && (
                <>
                  <tr>
                    <td className="px-6 py-3 text-sm text-slate-700">Tuition (In-State)</td>
                    {options.map(opt => (
                      <td key={opt.universityId} className="px-6 py-3 text-center">
                        {formatCurrency(opt.lenses.cost.tuitionInState)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-3 text-sm text-slate-700">Tuition (Out-of-State)</td>
                    {options.map(opt => (
                      <td key={opt.universityId} className="px-6 py-3 text-center">
                        {formatCurrency(opt.lenses.cost.tuitionOutState)}
                        <ConfidenceBadge state={opt.lenses.cost.confidence} />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-3 text-sm text-slate-700">Room & Board</td>
                    {options.map(opt => (
                      <td key={opt.universityId} className="px-6 py-3 text-center">
                        {formatCurrency(opt.lenses.cost.roomBoard)}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-slate-50 font-semibold">
                    <td className="px-6 py-3 text-sm text-slate-900">Estimated Total Cost</td>
                    {options.map(opt => (
                      <td key={opt.universityId} className="px-6 py-3 text-center text-indigo-700">
                        {formatCurrency(opt.lenses.cost.totalCost)}
                      </td>
                    ))}
                  </tr>
                </>
              )}
              {activeLens === 'fit' && (
                <>
                  <tr>
                    <td className="px-6 py-3 text-sm text-slate-700">Overall Fit Score</td>
                    {options.map(opt => (
                      <td key={opt.universityId} className="px-6 py-3 text-center">
                        <span className={`text-lg font-bold ${
                          opt.lenses.fit.overallScore >= 70 ? 'text-green-600' :
                          opt.lenses.fit.overallScore >= 40 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {opt.lenses.fit.overallScore}
                        </span>
                        <span className="text-slate-400 text-sm">/100</span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-3 text-sm text-slate-700">Academic Fit</td>
                    {options.map(opt => (
                      <td key={opt.universityId} className="px-6 py-3 text-center">{opt.lenses.fit.breakdown.academic}/100</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-3 text-sm text-slate-700">Financial Fit</td>
                    {options.map(opt => (
                      <td key={opt.universityId} className="px-6 py-3 text-center">{opt.lenses.fit.breakdown.financial}/100</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-3 text-sm text-slate-700">Interest Match</td>
                    {options.map(opt => (
                      <td key={opt.universityId} className="px-6 py-3 text-center">{opt.lenses.fit.breakdown.interest}/100</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-3 text-sm text-slate-700">Explanation</td>
                    {options.map(opt => (
                      <td key={opt.universityId} className="px-6 py-3 text-sm text-slate-600 max-w-xs text-center">
                        {opt.lenses.fit.explanation}
                      </td>
                    ))}
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Trade-offs */}
        {tradeoffs.length > 0 && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5">
            <h3 className="font-semibold text-amber-900 flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5" /> Trade-offs Detected
            </h3>
            <ul className="space-y-2">
              {tradeoffs.map((t, i) => (
                <li key={i} className="text-sm text-amber-800">
                  • {t.description}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Generate Report Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              if (user?.role === 'FREE') {
                alert('Upgrade to Pro to generate reports.');
                return;
              }
              alert('PDF generation coming soon!');
            }}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 mx-auto font-medium"
          >
            <FileText className="w-4 h-4" /> Generate PDF Report
          </button>
          {user?.role === 'FREE' && (
            <p className="mt-2 text-sm text-slate-500">PDF reports require a Pro subscription ($19/mo)</p>
          )}
        </div>
      </main>
    </div>
  );
}
