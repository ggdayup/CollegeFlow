import React, { useState, useEffect, useCallback } from 'react';
import { Search, AlertTriangle, Check, XCircle, ExternalLink, Eye, BookOpen, TrendingUp, Layers } from 'lucide-react';

interface InstitutionCandidate {
  id: string;
  unitId: string;
  nameEn: string;
  state: string | null;
  control: string | null;
  sector: string | null;
  level: string | null;
  eligibilityScore: number | null;
  recommendation: string | null;
  reasons: unknown[];
  warnings: unknown[];
  blockingReasons: unknown[];
  policyVersion: string | null;
  releaseKey: string;
}

interface MetricRow {
  id: string;
  metricKey: string;
  unitId: string;
  valueNumeric: number | null;
  valueStatus: string;
  sourceTable: string;
  sourceVariable: string;
  releaseKey: string;
  metricDefinition: {
    labelEn: string;
    labelZh: string | null;
    displayFormat: string;
    unit: string | null;
  } | null;
}

interface ProgramFieldRow {
  id: string;
  cipCode: string;
  displayTitle: string;
  degreeLevel: string;
  sourceType: string;
  standardMajorId: string | null;
  cip: { code: string; title: string } | null;
  standardMajor: { id: string; nameEn: string } | null;
}

interface InstitutionDetail {
  candidate: InstitutionCandidate;
  metrics: MetricRow[];
  programFields: ProgramFieldRow[];
}

const API_BASE = '/api/admin/ipeds';

const recBadge = (rec: string | null) => {
  if (!rec) return { bg: 'bg-slate-100', text: 'text-slate-600', label: 'BLOCKED' };
  switch (rec) {
    case 'AUTO_PUBLISH': return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'AUTO PUBLISH' };
    case 'REVIEW_RECOMMENDED': return { bg: 'bg-amber-100', text: 'text-amber-700', label: 'REVIEW' };
    case 'MANUAL_REVIEW': return { bg: 'bg-red-100', text: 'text-red-700', label: 'MANUAL' };
    default: return { bg: 'bg-slate-100', text: 'text-slate-600', label: rec };
  }
};

export default function IPEDSAdminAudit() {
  const [searchQuery, setSearchQuery] = useState('');
  const [candidates, setCandidates] = useState<InstitutionCandidate[]>([]);
  const [detail, setDetail] = useState<InstitutionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusData, setStatusData] = useState<Record<string, unknown> | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/release-status`);
      const data = await res.json();
      setStatusData(data);
    } catch { /* ignore */ }
  }, []);

  const searchUnitId = useCallback(async (query: string) => {
    if (!query.trim()) { setCandidates([]); return; }
    setLoading(true);
    try {
      if (/^\d+$/.test(query.trim())) {
        const res = await fetch(`${API_BASE}/institution/${query.trim()}`);
        if (res.ok) {
          const data = await res.json();
          setDetail(data);
          setCandidates([]);
        } else {
          setDetail(null);
          setCandidates([]);
        }
      } else {
        setDetail(null);
        setCandidates([]);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (searchQuery) {
      const timer = setTimeout(() => searchUnitId(searchQuery), 400);
      return () => clearTimeout(timer);
    }
    setDetail(null);
    setCandidates([]);
  }, [searchQuery, searchUnitId]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <BookOpen className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-bold text-slate-900">IPEDS Admin Audit</h2>
      </div>

      {/* Release Status Summary */}
      {statusData && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Raw Tables', value: statusData.rawTables, icon: Layers },
            { label: 'Metric Defs', value: statusData.metricDefinitions, icon: BookOpen },
            { label: 'Candidates', value: statusData.institutionCandidates, icon: Eye },
            { label: 'Metrics', value: statusData.institutionMetrics, icon: TrendingUp },
            { label: 'Program Fields', value: statusData.programFields, icon: Layers },
            { label: 'CIP Codes', value: statusData.cipCodes, icon: BookOpen },
          ].map(item => (
            <div key={item.label} className="bg-white border border-slate-200 rounded-xl p-3 text-center">
              <item.icon className="w-4 h-4 text-slate-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-slate-900">{String(item.value)}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide">{item.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by UNITID (e.g. 166027 for Harvard)"
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8 text-slate-400 text-sm">Searching...</div>
      )}

      {/* Institution Detail View */}
      {detail && (
        <div className="space-y-4">
          {/* Institution Header */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-lg font-bold text-slate-900">{detail.candidate.nameEn}</h3>
              <span className="text-xs text-slate-500 font-mono">UNITID: {detail.candidate.unitId}</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${recBadge(detail.candidate.recommendation).bg} ${recBadge(detail.candidate.recommendation).text}`}>
                {recBadge(detail.candidate.recommendation).label}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div><span className="text-slate-500">State: </span><span className="font-medium">{detail.candidate.state || '—'}</span></div>
              <div><span className="text-slate-500">Control: </span><span className="font-medium">{detail.candidate.control || '—'}</span></div>
              <div><span className="text-slate-500">Score: </span><span className="font-medium">{detail.candidate.eligibilityScore ?? 'N/A'}</span></div>
              <div><span className="text-slate-500">Policy: </span><span className="font-mono">{detail.candidate.policyVersion || '—'}</span></div>
            </div>
          </div>

          {/* Warnings */}
          {detail.candidate.warnings && detail.candidate.warnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-800">Warnings</span>
              </div>
              <ul className="text-xs text-amber-700 space-y-1">
                {detail.candidate.warnings.map((w: string, i: number) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Blocking Reasons */}
          {detail.candidate.blockingReasons && detail.candidate.blockingReasons.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-semibold text-red-800">Blocking Reasons</span>
              </div>
              <ul className="text-xs text-red-700 space-y-1">
                {detail.candidate.blockingReasons.map((b: string, i: number) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Metrics */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Metrics ({detail.metrics.length})
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 font-semibold text-slate-600">Metric</th>
                    <th className="text-right py-2 px-3 font-semibold text-slate-600">Value</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-600">Status</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-600">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.metrics.map(m => (
                    <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-2 px-3 font-medium text-slate-900">{m.metricDefinition?.labelEn || m.metricKey}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-700">
                        {m.valueNumeric !== null ? m.valueNumeric : (m.valueStatus === 'REPORTED' ? '—' : 'N/A')}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          m.valueStatus === 'REPORTED' ? 'bg-emerald-100 text-emerald-700' :
                          m.valueStatus === 'NOT_REPORTED' ? 'bg-slate-100 text-slate-500' :
                          'bg-amber-100 text-amber-700'
                        }`}>{m.valueStatus}</span>
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-500">{m.sourceTable}.{m.sourceVariable}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Program Fields */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              Program Fields ({detail.programFields.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {detail.programFields.slice(0, 30).map(pf => (
                <div key={pf.id} className="border border-slate-100 rounded-lg p-2.5 text-xs">
                  <div className="font-medium text-slate-900">{pf.displayTitle}</div>
                  <div className="text-slate-500 font-mono">CIP {pf.cipCode}</div>
                  {pf.standardMajor && (
                    <div className="text-emerald-600 flex items-center gap-1 mt-1">
                      <Check className="w-3 h-3" />
                      {pf.standardMajor.nameEn}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {detail.programFields.length > 30 && (
              <div className="text-center mt-3 text-xs text-slate-400">
                Showing 30 of {detail.programFields.length} program fields
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !detail && !searchQuery && (
        <div className="text-center py-12 text-slate-400">
          <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Enter a UNITID to inspect an institution's IPEDS data and eligibility.</p>
        </div>
      )}
    </div>
  );
}
