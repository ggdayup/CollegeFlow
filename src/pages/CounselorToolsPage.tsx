import { useState, useEffect } from 'react';
import { 
  FileText, 
  Settings, 
  Sliders, 
  HelpCircle, 
  FileDown, 
  CheckCircle,
  Loader2, 
  Award, 
  TrendingUp, 
  Search,
  Sparkles,
  School,
  GraduationCap
} from 'lucide-react';
import { universities } from '../data/universitiesData';

interface ReportRow {
  id: string;
  pdfUrl: string;
  generatedAt: string;
  sessionName: string;
}

interface StudentRow {
  workspaceId: string;
  email: string;
  inviteAccepted: boolean;
  profileComplete: boolean;
}

export default function CounselorToolsPage() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  
  // New report form state
  const [selectedStudentWorkspaceId, setSelectedStudentWorkspaceId] = useState('');
  const [studentSessions, setStudentSessions] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Matcher Sandbox State
  const [sandboxGpa, setSandboxGpa] = useState(3.85);
  const [sandboxSat, setSandboxSat] = useState(1480);
  const [sandboxBudget, setSandboxBudget] = useState(50000);
  // Sliders for weights
  const [sandboxWeights, setSandboxWeights] = useState({
    salary: 25,
    prestige: 25,
    cost: 25,
    fit: 25
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // Fetch report history
      const reportRes = await fetch('/api/report/list', { credentials: 'include' });
      const studentRes = await fetch('/api/counselor/students', { credentials: 'include' });
      
      if (reportRes.ok) {
        const reportData = await reportRes.json();
        setReports(reportData.reports || []);
      }
      if (studentRes.ok) {
        const studentData = await studentRes.json();
        setStudents(studentData.students || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  // Fetch comparison sessions when a student is selected
  useEffect(() => {
    if (!selectedStudentWorkspaceId) {
      setStudentSessions([]);
      setSelectedSessionId('');
      return;
    }
    fetchStudentSessions(selectedStudentWorkspaceId);
  }, [selectedStudentWorkspaceId]);

  const fetchStudentSessions = async (workspaceId: string) => {
    try {
      const res = await fetch(`/api/counselor/student/${workspaceId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setStudentSessions(data.workspace.comparisonSessions || []);
        if (data.workspace.comparisonSessions.length > 0) {
          setSelectedSessionId(data.workspace.comparisonSessions[0].id);
        } else {
          setSelectedSessionId('');
        }
      }
    } catch {
      // ignore
    }
  };

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionId) return;
    setGeneratingReport(true);
    setGenerateError(null);
    try {
      const res = await fetch('/api/report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sessionId: selectedSessionId }),
      });
      if (res.ok) {
        // Refresh list
        const listRes = await fetch('/api/report/list', { credentials: 'include' });
        if (listRes.ok) {
          const listData = await listRes.json();
          setReports(listData.reports || []);
        }
        setGenerateError('Report generated successfully!');
      } else {
        const errData = await res.json();
        setGenerateError(errData.error || 'Failed to generate report.');
      }
    } catch {
      setGenerateError('Network error generating report.');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleWeightChange = (key: string, val: number) => {
    setSandboxWeights(prev => {
      const updated = { ...prev, [key]: val };
      const keys = Object.keys(updated);
      const remainingSum = 100 - val;
      const otherKeys = keys.filter(k => k !== key);
      const otherSum = otherKeys.reduce((s, k) => s + updated[k as keyof typeof updated], 0);

      if (otherSum > 0) {
        otherKeys.forEach(k => {
          const ratio = updated[k as keyof typeof updated] / otherSum;
          updated[k as keyof typeof updated] = Math.round(ratio * remainingSum);
        });
      } else {
        otherKeys.forEach(k => {
          updated[k as keyof typeof updated] = Math.round(remainingSum / otherKeys.length);
        });
      }
      return updated;
    });
  };

  // Real-time Matching Simulator based on Universities Seed Data
  const getMatchedSchools = () => {
    // Standard matched list using universitiesData
    return universities.map(uni => {
      // US News ranking determines basic difficulty
      const rank = uni.usNewsRank || 50;
      
      // Heuristic model:
      // Reach threshold GPA & SAT
      let targetGpa = 3.9;
      let targetSat = 1500;
      let costTuition = 55000; // estimated standard out-of-state tuition

      if (rank <= 10) {
        targetGpa = 3.96;
        targetSat = 1540;
        costTuition = 61000;
      } else if (rank <= 25) {
        targetGpa = 3.9;
        targetSat = 1480;
        costTuition = 57000;
      } else if (rank <= 50) {
        targetGpa = 3.75;
        targetSat = 1380;
        costTuition = 52000;
      } else {
        targetGpa = 3.5;
        targetSat = 1250;
        costTuition = 45000;
      }

      // Calculate category: Reach, Match, Safety
      let matchCategory: 'Reach' | 'Match' | 'Safety' = 'Reach';

      if (sandboxGpa >= targetGpa + 0.05 && sandboxSat >= targetSat + 40 && rank > 15) {
        matchCategory = 'Safety';
      } else if (sandboxGpa >= targetGpa - 0.1 && sandboxSat >= targetSat - 60) {
        matchCategory = 'Match';
      } else {
        matchCategory = 'Reach';
      }

      // Compute a custom weighted Fit Score based on sliders (out of 100)
      // prestige: based on ranking. rank 1-5 = 100, rank 50 = 70.
      const prestigeScore = Math.max(50, 100 - (rank * 0.5));
      
      // salary/outcomes: stem universities or ranked ones get higher salary out.
      // Stanford, CMU, Berkeley get 100.
      let outcomesScore = Math.max(60, 100 - (rank * 0.4));
      if (['stanford', 'cmu', 'berkeley', 'mit', 'harvard'].includes(uni.id)) {
        outcomesScore = 98;
      }

      // cost: budget vs tuition.
      const costDiff = sandboxBudget - costTuition;
      let costScore = 80;
      if (costDiff >= 0) {
        costScore = 100;
      } else if (costDiff > -15000) {
        costScore = 85;
      } else {
        costScore = 60;
      }

      // personal fit: GPA score alignment
      const fitScoreVal = Math.max(50, 100 - Math.abs(sandboxGpa - targetGpa) * 100);

      const finalScore = Math.round(
        (prestigeScore * (sandboxWeights.prestige / 100)) +
        (outcomesScore * (sandboxWeights.salary / 100)) +
        (costScore * (sandboxWeights.cost / 100)) +
        (fitScoreVal * (sandboxWeights.fit / 100))
      );

      return {
        ...uni,
        category: matchCategory,
        score: finalScore,
        tuition: costTuition
      };
    });
  };

  const matchedUnis = getMatchedSchools();
  const reachSchools = matchedUnis.filter(u => u.category === 'Reach').sort((a, b) => b.score - a.score);
  const matchSchools = matchedUnis.filter(u => u.category === 'Match').sort((a, b) => b.score - a.score);
  const safetySchools = matchedUnis.filter(u => u.category === 'Safety').sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-6">
      {/* Tools Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-bold text-slate-900">Counselor Toolkit</h2>
        <p className="text-sm text-slate-500 mt-1">Simulate admissions outcomes and manage student comparison PDF reports.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: PDF Report Center (5/12 Width) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              PDF Report Center
            </h3>

            {/* Quick Generate Form */}
            <form onSubmit={handleGenerateReport} className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6 space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase">Generate New PDF Report</h4>
              
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Select Student</label>
                <select
                  value={selectedStudentWorkspaceId}
                  onChange={(e) => setSelectedStudentWorkspaceId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="">-- Choose active student --</option>
                  {students.filter(s => s.inviteAccepted).map(s => (
                    <option key={s.workspaceId} value={s.workspaceId}>{s.email}</option>
                  ))}
                </select>
              </div>

              {selectedStudentWorkspaceId && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Select Comparison Session</label>
                  {studentSessions.length === 0 ? (
                    <p className="text-xs text-red-500 mt-1 italic">This student has no active comparisons.</p>
                  ) : (
                    <select
                      value={selectedSessionId}
                      onChange={(e) => setSelectedSessionId(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      required
                    >
                      {studentSessions.map(sess => (
                        <option key={sess.id} value={sess.id}>{sess.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={generatingReport || !selectedSessionId}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {generatingReport ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                Assemble PDF Report
              </button>

              {generateError && (
                <div className={`text-xs font-semibold p-2.5 rounded border ${
                  generateError.includes('successfully')
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {generateError}
                </div>
              )}
            </form>

            {/* Generated Reports List */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Generation History</h4>
              
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 italic">
                  No reports generated yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {reports.map(report => (
                    <div key={report.id} className="border border-slate-100 p-3 rounded-lg flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div>
                        <h5 className="text-xs font-bold text-slate-800">{report.sessionName || 'Custom Comparison'}</h5>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Assembled {new Date(report.generatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <a
                        href={report.pdfUrl}
                        download
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                        title="Download PDF"
                      >
                        <FileDown className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Matcher Sandbox (7/12 Width) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-600" />
                Matcher Sandbox (Admissions Simulator)
              </h3>
              <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 border border-purple-150 rounded font-mono font-bold uppercase tracking-wider">
                REAL-TIME MATCH ENGINE
              </span>
            </div>

            {/* Sandbox Inputs Bento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">GPA (0.0 - 4.0)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.0"
                  max="4.0"
                  value={sandboxGpa}
                  onChange={(e) => setSandboxGpa(parseFloat(e.target.value) || 0)}
                  className="w-full text-sm font-bold px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">SAT Score</label>
                <input
                  type="number"
                  min="400"
                  max="1600"
                  value={sandboxSat}
                  onChange={(e) => setSandboxSat(parseInt(e.target.value) || 0)}
                  className="w-full text-sm font-bold px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Annual Budget ($)</label>
                <input
                  type="number"
                  step="1000"
                  value={sandboxBudget}
                  onChange={(e) => setSandboxBudget(parseInt(e.target.value) || 0)}
                  className="w-full text-sm font-bold px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white"
                />
              </div>
            </div>

            {/* Weight Sliders */}
            <div className="mb-8 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase">Priorities Weights (%)</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'salary', label: 'Salary Outcomes 💼' },
                  { key: 'prestige', label: 'Rankings/Prestige 🏆' },
                  { key: 'cost', label: 'Affordability 💰' },
                  { key: 'fit', label: 'Personal Fit 🎯' }
                ].map(({ key, label }) => {
                  const val = sandboxWeights[key as keyof typeof sandboxWeights];
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                        <span>{label}</span>
                        <span className="font-mono text-purple-600 font-bold">{val}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={val}
                        onChange={(e) => handleWeightChange(key, parseInt(e.target.value))}
                        className="w-full accent-purple-600"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Matches Output */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase">Simulation Results</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Reach */}
                <div className="bg-rose-50/30 border border-rose-100 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-rose-800">Reach (冲刺校)</span>
                    <span className="text-[10px] bg-rose-50 border border-rose-200 text-rose-700 px-1.5 py-0.5 rounded font-bold font-mono">
                      {reachSchools.length}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto">
                    {reachSchools.slice(0, 5).map(uni => (
                      <div key={uni.id} className="bg-white border border-rose-50/50 p-2.5 rounded-lg text-xs hover:border-rose-350 transition-colors">
                        <div className="flex justify-between items-center font-semibold text-slate-800">
                          <span className="truncate pr-1">{uni.nameEn}</span>
                          <span className="text-[10px] text-purple-600 font-bold">{uni.score}</span>
                        </div>
                        <div className="flex justify-between mt-1 text-[10px] text-slate-400">
                          <span>USN #{uni.usNewsRank}</span>
                          <span>${uni.tuition.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Match */}
                <div className="bg-blue-50/30 border border-blue-100 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-blue-800">Match (合理校)</span>
                    <span className="text-[10px] bg-blue-50 border border-blue-200 text-blue-700 px-1.5 py-0.5 rounded font-bold font-mono">
                      {matchSchools.length}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto">
                    {matchSchools.slice(0, 5).map(uni => (
                      <div key={uni.id} className="bg-white border border-blue-50/50 p-2.5 rounded-lg text-xs hover:border-blue-350 transition-colors">
                        <div className="flex justify-between items-center font-semibold text-slate-800">
                          <span className="truncate pr-1">{uni.nameEn}</span>
                          <span className="text-[10px] text-purple-600 font-bold">{uni.score}</span>
                        </div>
                        <div className="flex justify-between mt-1 text-[10px] text-slate-400">
                          <span>USN #{uni.usNewsRank}</span>
                          <span>${uni.tuition.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safety */}
                <div className="bg-emerald-50/30 border border-emerald-100 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-emerald-800">Safety (保底校)</span>
                    <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-1.5 py-0.5 rounded font-bold font-mono">
                      {safetySchools.length}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto">
                    {safetySchools.slice(0, 5).map(uni => (
                      <div key={uni.id} className="bg-white border border-emerald-50/50 p-2.5 rounded-lg text-xs hover:border-emerald-350 transition-colors">
                        <div className="flex justify-between items-center font-semibold text-slate-800">
                          <span className="truncate pr-1">{uni.nameEn}</span>
                          <span className="text-[10px] text-purple-600 font-bold">{uni.score}</span>
                        </div>
                        <div className="flex justify-between mt-1 text-[10px] text-slate-400">
                          <span>USN #{uni.usNewsRank}</span>
                          <span>${uni.tuition.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
