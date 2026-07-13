import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  GraduationCap, 
  ArrowLeft, 
  FileText, 
  Calendar, 
  Star, 
  FileDown, 
  Clock, 
  Award, 
  DollarSign, 
  Target, 
  CheckCircle,
  Plus,
  Loader2,
  Trash2
} from 'lucide-react';
import { universities } from '../data/universitiesData';
import { majors } from '../data/majorsData';

interface StudentWorkspaceDetails {
  id: string;
  inviteEmail: string;
  inviteAccepted: boolean;
  createdAt: string;
  student: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  decisionProfile: {
    gpa: number | null;
    satScore: number | null;
    actScore: number | null;
    annualBudgetMin: number | null;
    annualBudgetMax: number | null;
    interestAreas: string[] | null;
    weights: {
      salary: number;
      prestige: number;
      cost: number;
      fit: number;
    } | null;
  } | null;
  comparisonSessions: Array<{
    id: string;
    name: string;
    createdAt: string;
  }>;
  savedItems: Array<{
    id: string;
    itemType: string;
    itemId: string;
    createdAt: string;
  }>;
}

interface Note {
  id: string;
  noteType: string;
  content: string;
  createdAt: string;
  isShared: boolean;
}

interface ComparisonResult {
  sessionId: string;
  name: string;
  options: Array<{
    universityId: string;
    universityName: string;
    lenses: {
      admissions: { acceptanceRate: number; sat25th: number; sat75th: number; confidence: string };
      outcomes: { medianSalary2yr: number; medianDebt: number; gradRate: number; confidence: string };
      cost: { tuitionOutState: number; roomBoard: number; totalCost: number; confidence: string };
      fit: { overallScore: number; breakdown: Record<string, number>; exploration: string };
    };
  }>;
}

export default function CounselorStudentDetailPage() {
  const { id: workspaceId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState<StudentWorkspaceDetails | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Note state
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState<'essay' | 'interview' | 'financial' | 'strategy' | 'other'>('strategy');
  const [savingNote, setSavingNote] = useState(false);
  
  // PDF Generation state
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null); // sessionId
  const [pdfSuccess, setPdfSuccess] = useState<string | null>(null);

  // Selected comparison session for deep inspect
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessionDetail, setSessionDetail] = useState<ComparisonResult | null>(null);
  const [loadingSession, setLoadingSession] = useState(false);

  useEffect(() => {
    if (workspaceId) {
      fetchWorkspaceDetails();
      fetchNotes();
    }
  }, [workspaceId]);

  const fetchWorkspaceDetails = async () => {
    try {
      const res = await fetch(`/api/counselor/student/${workspaceId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setWorkspace(data.workspace);
      } else {
        navigate('/dashboard/counselor');
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await fetch(`/api/counselor/notes/${workspaceId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
      }
    } catch {
      // ignore
    }
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() || !workspaceId) return;
    setSavingNote(true);
    try {
      const res = await fetch('/api/counselor/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          workspaceId,
          noteType,
          content: noteContent,
          isShared: true
        }),
      });
      if (res.ok) {
        setNoteContent('');
        fetchNotes();
      }
    } catch {
      // ignore
    } finally {
      setSavingNote(false);
    }
  };

  const handleInspectSession = async (sessionId: string) => {
    if (selectedSessionId === sessionId) {
      setSelectedSessionId(null);
      setSessionDetail(null);
      return;
    }
    setSelectedSessionId(sessionId);
    setLoadingSession(true);
    try {
      const res = await fetch(`/api/comparison/${sessionId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSessionDetail(data);
      }
    } catch {
      // ignore
    } finally {
      setLoadingSession(false);
    }
  };

  const handleGeneratePdf = async (sessionId: string) => {
    setGeneratingPdf(sessionId);
    setPdfSuccess(null);
    try {
      const res = await fetch('/api/report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sessionId }),
      });
      if (res.ok) {
        const data = await res.json();
        setPdfSuccess(data.pdfUrl);
      }
    } catch {
      // ignore
    } finally {
      setGeneratingPdf(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Workspace not found.</p>
        <Link to="/dashboard/counselor" className="text-blue-600 font-medium hover:underline mt-2 inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Map saved items
  const savedUniversities = workspace.savedItems
    .filter(item => item.itemType === 'university')
    .map(item => universities.find(u => u.id === item.itemId))
    .filter(Boolean);

  const savedMajors = workspace.savedItems
    .filter(item => item.itemType === 'major')
    .map(item => majors.find(m => m.id === item.itemId))
    .filter(Boolean);

  const weights = workspace.decisionProfile?.weights || { salary: 0.25, prestige: 0.25, cost: 0.25, fit: 0.25 };

  return (
    <div className="space-y-6">
      {/* Detail Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/counselor')}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900">{workspace.student?.name || workspace.inviteEmail}</h2>
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                workspace.inviteAccepted 
                  ? 'text-green-700 bg-green-50 border border-green-200' 
                  : 'text-amber-700 bg-amber-50 border border-amber-200'
              }`}>
                {workspace.inviteAccepted ? 'Active Workspace' : 'Pending Invite'}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">Invited on {new Date(workspace.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* 3-Column Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Academic & Priorities (1/4 Width) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Academic Info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              Academic Info
            </h3>
            
            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-400 block font-medium uppercase">GPA (4.0 scale)</span>
                <span className="text-xl font-bold text-slate-900">
                  {workspace.decisionProfile?.gpa ? workspace.decisionProfile.gpa.toFixed(2) : '--'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-slate-400 block font-medium uppercase">SAT Score</span>
                  <span className="text-lg font-bold text-slate-900">
                    {workspace.decisionProfile?.satScore || '--'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium uppercase">ACT Score</span>
                  <span className="text-lg font-bold text-slate-900">
                    {workspace.decisionProfile?.actScore || '--'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block font-medium uppercase">Annual Budget</span>
                <span className="text-sm font-semibold text-slate-900">
                  {workspace.decisionProfile?.annualBudgetMin ? (
                    `$${workspace.decisionProfile.annualBudgetMin.toLocaleString()} - $${workspace.decisionProfile.annualBudgetMax?.toLocaleString()}`
                  ) : '--'}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block font-medium uppercase mb-1">Interest Areas</span>
                <div className="flex flex-wrap gap-1">
                  {workspace.decisionProfile?.interestAreas && workspace.decisionProfile.interestAreas.length > 0 ? (
                    workspace.decisionProfile.interestAreas.map(area => (
                      <span key={area} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium capitalize">
                        {area.replace('_', ' ')}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">None selected</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Decision Priorities Weights */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-rose-600" />
              Priorities
            </h3>

            <div className="space-y-4">
              {[
                { key: 'salary', label: 'Salary/Outcomes 💼', color: 'bg-emerald-500' },
                { key: 'prestige', label: 'Prestige/Ranking 🏆', color: 'bg-blue-500' },
                { key: 'cost', label: 'Affordability 💰', color: 'bg-amber-500' },
                { key: 'fit', label: 'Personal Fit 🎯', color: 'bg-indigo-500' }
              ].map(({ key, label, color }) => {
                const val = weights[key as keyof typeof weights] || 0.25;
                const percentage = Math.round(val * 100);
                return (
                  <div key={key}>
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                      <span>{label}</span>
                      <span>{percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-150 rounded-full h-2">
                      <div className={`h-2 rounded-full ${color}`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center Column: Comparison Sessions & Saved Items (2/4 Width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Comparison Sessions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              Comparison Sessions
            </h3>

            {workspace.comparisonSessions.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-sm italic">
                No comparison sessions run by this student.
              </div>
            ) : (
              <div className="space-y-3">
                {workspace.comparisonSessions.map(session => (
                  <div key={session.id} className="border border-slate-150 rounded-xl p-4 hover:border-blue-200 hover:bg-blue-50/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900">{session.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Created {new Date(session.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleInspectSession(session.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            selectedSessionId === session.id
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {selectedSessionId === session.id ? 'Hide Details' : 'Inspect Grid'}
                        </button>
                        
                        <button
                          onClick={() => handleGeneratePdf(session.id)}
                          disabled={generatingPdf === session.id}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                          title="Generate Report PDF"
                        >
                          {generatingPdf === session.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                          ) : (
                            <FileDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* PDF Generation Success Alert */}
                    {pdfSuccess && selectedSessionId === session.id && (
                      <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg text-xs flex justify-between items-center text-green-800">
                        <span>PDF Report ready!</span>
                        <a href={pdfSuccess} download className="font-bold underline hover:text-green-950">Download PDF</a>
                      </div>
                    )}

                    {/* Dynamic Session Detail / Inspector */}
                    {selectedSessionId === session.id && (
                      <div className="mt-4 pt-4 border-t border-slate-150">
                        {loadingSession ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                          </div>
                        ) : sessionDetail ? (
                          <div className="space-y-4">
                            <h5 className="text-xs font-bold text-slate-400 uppercase">Compared Universities</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {sessionDetail.options.map(option => (
                                <div key={option.universityId} className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                                  <div className="flex justify-between items-start">
                                    <span className="font-semibold text-slate-800 text-sm">{option.universityName}</span>
                                    <span className="text-xs font-mono font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                      {option.lenses.fit.overallScore}/100 Fit
                                    </span>
                                  </div>
                                  <div className="mt-2 space-y-1 text-xs text-slate-500">
                                    <div className="flex justify-between">
                                      <span>Admissions:</span>
                                      <span className="font-medium text-slate-700">{option.lenses.admissions.acceptanceRate}% accept</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Tuition Out:</span>
                                      <span className="font-medium text-slate-700">${option.lenses.cost.tuitionOutState.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Outcome Salary:</span>
                                      <span className="font-medium text-slate-700">${option.lenses.outcomes.medianSalary2yr.toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-red-500 font-medium">Failed to load session details.</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Student's Saved Items */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              Saved Items
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Universities ({savedUniversities.length})</h4>
                {savedUniversities.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No saved universities</p>
                ) : (
                  <ul className="space-y-1">
                    {savedUniversities.map((uni: any) => (
                      <li key={uni.id} className="text-sm bg-slate-50 border border-slate-100 rounded p-2 font-medium text-slate-800">
                        {uni.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Majors ({savedMajors.length})</h4>
                {savedMajors.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No saved majors</p>
                ) : (
                  <ul className="space-y-1">
                    {savedMajors.map((major: any) => (
                      <li key={major.id} className="text-sm bg-slate-50 border border-slate-100 rounded p-2 font-medium text-slate-800">
                        {major.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Counselor Notebook (1/4 Width) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col min-h-[480px]">
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Counselor Notebook
            </h3>

            {/* Note Entry Form */}
            <form onSubmit={handleSaveNote} className="space-y-3 mb-6">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Note Category</label>
                <select
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value as any)}
                  className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="strategy">Strategy Outline 🎯</option>
                  <option value="essay">Essay Coaching ✍️</option>
                  <option value="interview">Interview prep 🎤</option>
                  <option value="financial">Financial Planning 💰</option>
                  <option value="other">General Notes 📝</option>
                </select>
              </div>

              <div>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Type counseling notes here..."
                  rows={4}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={savingNote || !noteContent.trim()}
                className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {savingNote ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                Save Note
              </button>
            </form>

            {/* Note Timeline History */}
            <div className="flex-1 overflow-y-auto space-y-3 max-h-[300px] border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Historical Journal</h4>
              
              {notes.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 italic">
                  No notes saved yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {notes.map(note => (
                    <div key={note.id} className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 border border-slate-150 rounded-full text-[10px] capitalize">
                          {note.noteType}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-700 whitespace-pre-wrap leading-relaxed mt-1">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
