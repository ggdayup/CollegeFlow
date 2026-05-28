import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, MapPin, Award, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface Metric {
  metricKey: string;
  valueNumeric: number | null;
  valueStatus: string;
}

interface Program {
  cipCode: string;
  displayTitle: string;
  degreeLevel: string;
  completionsTotal: number | null;
}

interface UniversityDetail {
  id: string;
  nameEn: string;
  rankingUsNews?: number;
  countryEn: string;
  metrics: Metric[];
  programs: Program[];
}

function ConfidenceIcon({ status }: { status: string }) {
  if (status === 'VERIFIED') return <CheckCircle2 className="w-3 h-3 text-emerald-600 inline mr-1" />;
  if (status === 'STALE') return <Clock className="w-3 h-3 text-amber-600 inline mr-1" />;
  return <AlertCircle className="w-3 h-3 text-slate-400 inline mr-1" />;
}

function fmtMetric(m: Metric | undefined): string {
  if (!m || m.valueNumeric === null) return '—';
  if (m.metricKey === 'ACCEPT_RATE' || m.metricKey === 'GRAD_RATE') return `${(m.valueNumeric * 100).toFixed(1)}%`;
  if (m.metricKey === 'MEDIAN_GPA_X100') return (m.valueNumeric / 100).toFixed(2);
  return `$${m.valueNumeric.toLocaleString()}`;
}

export default function UniversityDetailPage() {
  const { universityId } = useParams<{ universityId: string }>();
  const [data, setData] = useState<UniversityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!universityId) return;
    setLoading(true);
    fetch(`/api/ipeds/university/${universityId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(setData)
      .catch(() => setError('Could not load university data'))
      .finally(() => setLoading(false));
  }, [universityId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  if (error || !data) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">{error || 'Not found'}</div>;
  }

  const keyMetrics = ['ACCEPT_RATE', 'SAT_25TH', 'SAT_75TH', 'TUITION_OUT_STATE', 'ROOM_BOARD', 'MEDIAN_EARNINGS_2YR', 'MEDIAN_DEBT', 'GRAD_RATE'];
  const metricsMap = new Map(data.metrics.map(m => [m.metricKey, m]));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{data.nameEn}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {data.countryEn}</span>
            {data.rankingUsNews && (
              <span className="flex items-center gap-1"><Award className="w-4 h-4" /> US News #{data.rankingUsNews}</span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Key Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {keyMetrics.map(key => {
              const m = metricsMap.get(key);
              return (
                <div key={key} className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">{key.replace(/_/g, ' ').toLowerCase()}</span>
                  <span className="text-sm font-semibold flex items-center">
                    <ConfidenceIcon status={m?.valueStatus || 'MISSING'} />
                    {fmtMetric(m)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Programs</h2>
          {data.programs.length === 0 ? (
            <p className="text-sm text-slate-500">No program data available.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 text-slate-600">CIP Code</th>
                  <th className="text-left py-2 text-slate-600">Program</th>
                  <th className="text-left py-2 text-slate-600">Degree Level</th>
                  <th className="text-right py-2 text-slate-600">Completions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.programs.slice(0, 50).map((p, i) => (
                  <tr key={i}>
                    <td className="py-2 font-mono text-xs">{p.cipCode}</td>
                    <td className="py-2">{p.displayTitle}</td>
                    <td className="py-2">{p.degreeLevel}</td>
                    <td className="py-2 text-right">{p.completionsTotal ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
