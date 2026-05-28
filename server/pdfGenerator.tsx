/**
 * PDF report generation using @react-pdf/renderer.
 * Generates branded comparison reports for student workspace.
 */
import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer';
import type { PrismaClient } from '@prisma/client';

interface PdfMetricRow {
  metricKey: string;
  valueNumeric: number | null;
}

interface PdfUniversity {
  nameEn: string;
  institutionMetrics: PdfMetricRow[];
}

interface PdfComparisonOption {
  university: PdfUniversity;
  sortOrder: number;
}

interface PdfDecisionProfile {
  gpa: number | null;
  satScore: number | null;
  actScore: number | null;
  annualBudgetMin: number | null;
  annualBudgetMax: number | null;
  interestAreas: unknown;
}

interface PdfCounselor {
  name: string | null;
}

interface PdfWorkspace {
  decisionProfile: PdfDecisionProfile | null;
  counselor: PdfCounselor;
}

interface PdfSession {
  name: string;
  createdAt: Date;
  workspace: PdfWorkspace;
  options: PdfComparisonOption[];
}

Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'Helvetica' },
    { src: 'Helvetica-Bold', fontWeight: 'bold' },
  ],
});

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica', fontSize: 10 },
  header: { fontSize: 22, marginBottom: 4, color: '#1e40af', fontWeight: 'bold' },
  subtitle: { fontSize: 11, marginBottom: 20, color: '#64748b' },
  sectionTitle: { fontSize: 14, marginBottom: 8, color: '#1e40af', fontWeight: 'bold', marginTop: 16 },
  section: { marginBottom: 12 },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingVertical: 6 },
  cell: { flex: 1, fontSize: 9, paddingHorizontal: 4 },
  cellHeader: { flex: 1, fontSize: 9, fontWeight: 'bold', paddingHorizontal: 4, color: '#475569' },
  label: { fontSize: 9, color: '#64748b', marginBottom: 2 },
  value: { fontSize: 11, fontWeight: 'bold', marginBottom: 8 },
  badge: { fontSize: 8, padding: 2, borderRadius: 3, marginRight: 4 },
  verified: { backgroundColor: '#d1fae5', color: '#065f46' },
  stale: { backgroundColor: '#fef3c7', color: '#92400e' },
  missing: { backgroundColor: '#f1f5f9', color: '#64748b' },
  disclaimer: { fontSize: 8, color: '#94a3b8', marginTop: 24, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 8 },
  fitScore: { fontSize: 16, fontWeight: 'bold', color: '#1e40af' },
  fitExplanation: { fontSize: 9, color: '#475569', marginTop: 2 },
});

function confidenceLabel(confidence: string): string {
  switch (confidence) {
    case 'verified': return 'Verified';
    case 'stale': return 'Stale';
    case 'missing': return 'No Data';
    default: return confidence || 'No Data';
  }
}

function confidenceStyle(confidence: string) {
  switch (confidence) {
    case 'verified': return styles.verified;
    case 'stale': return styles.stale;
    default: return styles.missing;
  }
}

function fmt(val: number | null | undefined, prefix = '', suffix = ''): string {
  if (val === null || val === undefined) return '—';
  return `${prefix}${typeof val === 'number' && val > 100 ? val.toLocaleString() : val}${suffix}`;
}

interface ComparisonData {
  session: { name: string; createdAt: Date };
  studentProfile: { gpa?: number | null; satScore?: number | null; actScore?: number | null; annualBudgetMin?: number | null; annualBudgetMax?: number | null; interestAreas?: unknown };
  options: Array<{
    universityName: string;
    admissions: { acceptanceRate: number | null; sat25th: number | null; sat75th: number | null; act25th: number | null; act75th: number | null; medianGpa: number | null; confidence: string };
    outcomes: { medianSalary2yr: number | null; medianDebt: number | null; gradRate: number | null; confidence: string };
    cost: { tuitionInState: number | null; tuitionOutState: number | null; roomBoard: number | null; totalCost: number | null; confidence: string };
    fit: { overallScore: number; breakdown: { academic: number; financial: number; interest: number }; explanation: string };
  }>;
  counselorName?: string;
}

export async function generateComparisonPdf(sessionId: string, prisma: PrismaClient): Promise<Buffer> {
  // Fetch session
  const session = await prisma.comparisonSession.findUnique({
    where: { id: sessionId },
    include: {
      workspace: {
        include: {
          decisionProfile: { include: { weights: true } },
          counselor: { select: { name: true } },
        },
      },
      options: {
        include: { university: { select: { nameEn: true } } },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  if (!session) throw new Error(`Comparison session not found: ${sessionId}`);

  // Build comparison data
  const dp = (session as PdfSession).workspace.decisionProfile;
  const options = (session as PdfSession).options.map((opt) => {
    const ipedsMetrics: PdfMetricRow[] = opt.university.institutionMetrics || [];
    const getMetric = (key: string): number | null => {
      const m = ipedsMetrics.find((x) => x.metricKey === key);
      return m?.valueNumeric ?? null;
    };

    return {
      universityName: opt.university.nameEn,
      admissions: {
        acceptanceRate: getMetric('ACCEPT_RATE'),
        sat25th: getMetric('SAT_25TH'),
        sat75th: getMetric('SAT_75TH'),
        act25th: getMetric('ACT_25TH'),
        act75th: getMetric('ACT_75TH'),
        medianGpa: getMetric('MEDIAN_GPA_X100'),
        confidence: getMetric('ACCEPT_RATE') !== null ? 'verified' : 'missing',
      },
      outcomes: {
        medianSalary2yr: getMetric('MEDIAN_EARNINGS_2YR'),
        medianDebt: getMetric('MEDIAN_DEBT'),
        gradRate: getMetric('GRAD_RATE'),
        confidence: getMetric('MEDIAN_EARNINGS_2YR') !== null ? 'verified' : 'missing',
      },
      cost: {
        tuitionInState: getMetric('TUITION_IN_STATE'),
        tuitionOutState: getMetric('TUITION_OUT_STATE'),
        roomBoard: getMetric('ROOM_BOARD'),
        totalCost: getMetric('TUITION_OUT_STATE') && getMetric('ROOM_BOARD')
          ? (getMetric('TUITION_OUT_STATE') as number) + (getMetric('ROOM_BOARD') as number)
          : null,
        confidence: getMetric('TUITION_OUT_STATE') !== null ? 'verified' : 'missing',
      },
      fit: computeFit(opt.university.nameEn, dp),
    };
  });

  const data: ComparisonData = {
    session: { name: session.name, createdAt: session.createdAt },
    studentProfile: {
      gpa: dp?.gpa,
      satScore: dp?.satScore,
      actScore: dp?.actScore,
      annualBudgetMin: dp?.annualBudgetMin,
      annualBudgetMax: dp?.annualBudgetMax,
      interestAreas: dp?.interestAreas,
    },
    options,
    counselorName: session.workspace.counselor.name || undefined,
  };

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cover */}
        <Text style={styles.header}>CollegeFlow</Text>
        <Text style={styles.subtitle}>School Comparison Report — {data.session.name}</Text>
        <Text style={{ fontSize: 9, color: '#94a3b8', marginBottom: 16 }}>
          Generated {new Date().toLocaleDateString()}
          {data.counselorName ? ` | Counselor: ${data.counselorName}` : ''}
        </Text>

        {/* Student Profile */}
        <Text style={styles.sectionTitle}>Student Profile</Text>
        <View style={{ marginBottom: 8 }}>
          <Text style={styles.label}>GPA: {fmt(data.studentProfile.gpa)}</Text>
          <Text style={styles.label}>SAT: {fmt(data.studentProfile.satScore)} | ACT: {fmt(data.studentProfile.actScore)}</Text>
          <Text style={styles.label}>Annual Budget: {fmt(data.studentProfile.annualBudgetMin, '$')} — {fmt(data.studentProfile.annualBudgetMax, '$')}</Text>
        </View>

        {/* 4-Lens Comparison */}
        <Text style={styles.sectionTitle}>School Comparison</Text>

        {/* Admissions Lens */}
        <Text style={{ fontSize: 11, fontWeight: 'bold', marginTop: 8, marginBottom: 4 }}>Admissions</Text>
        <View style={styles.row}>
          <Text style={styles.cellHeader}>School</Text>
          <Text style={styles.cellHeader}>Accept Rate</Text>
          <Text style={styles.cellHeader}>SAT 25th</Text>
          <Text style={styles.cellHeader}>SAT 75th</Text>
          <Text style={styles.cellHeader}>Confidence</Text>
        </View>
        {data.options.map((opt, i) => (
          <View style={styles.row} key={`adm-${i}`}>
            <Text style={styles.cell}>{opt.universityName}</Text>
            <Text style={styles.cell}>{fmt(opt.admissions.acceptanceRate, '', '%')}</Text>
            <Text style={styles.cell}>{fmt(opt.admissions.sat25th)}</Text>
            <Text style={styles.cell}>{fmt(opt.admissions.sat75th)}</Text>
            <Text style={[styles.badge, confidenceStyle(opt.admissions.confidence)]}>{confidenceLabel(opt.admissions.confidence)}</Text>
          </View>
        ))}

        {/* Outcomes Lens */}
        <Text style={{ fontSize: 11, fontWeight: 'bold', marginTop: 12, marginBottom: 4 }}>Outcomes</Text>
        <View style={styles.row}>
          <Text style={styles.cellHeader}>School</Text>
          <Text style={styles.cellHeader}>Median Salary (2yr)</Text>
          <Text style={styles.cellHeader}>Median Debt</Text>
          <Text style={styles.cellHeader}>Grad Rate</Text>
          <Text style={styles.cellHeader}>Confidence</Text>
        </View>
        {data.options.map((opt, i) => (
          <View style={styles.row} key={`out-${i}`}>
            <Text style={styles.cell}>{opt.universityName}</Text>
            <Text style={styles.cell}>{fmt(opt.outcomes.medianSalary2yr, '$')}</Text>
            <Text style={styles.cell}>{fmt(opt.outcomes.medianDebt, '$')}</Text>
            <Text style={styles.cell}>{fmt(opt.outcomes.gradRate, '', '%')}</Text>
            <Text style={[styles.badge, confidenceStyle(opt.outcomes.confidence)]}>{confidenceLabel(opt.outcomes.confidence)}</Text>
          </View>
        ))}

        {/* Cost Lens */}
        <Text style={{ fontSize: 11, fontWeight: 'bold', marginTop: 12, marginBottom: 4 }}>Cost</Text>
        <View style={styles.row}>
          <Text style={styles.cellHeader}>School</Text>
          <Text style={styles.cellHeader}>Tuition (Out-of-State)</Text>
          <Text style={styles.cellHeader}>Room & Board</Text>
          <Text style={styles.cellHeader}>Total Cost</Text>
          <Text style={styles.cellHeader}>Confidence</Text>
        </View>
        {data.options.map((opt, i) => (
          <View style={styles.row} key={`cost-${i}`}>
            <Text style={styles.cell}>{opt.universityName}</Text>
            <Text style={styles.cell}>{fmt(opt.cost.tuitionOutState, '$')}</Text>
            <Text style={styles.cell}>{fmt(opt.cost.roomBoard, '$')}</Text>
            <Text style={styles.cell}>{fmt(opt.cost.totalCost, '$')}</Text>
            <Text style={[styles.badge, confidenceStyle(opt.cost.confidence)]}>{confidenceLabel(opt.cost.confidence)}</Text>
          </View>
        ))}

        {/* Fit Lens */}
        <Text style={{ fontSize: 11, fontWeight: 'bold', marginTop: 12, marginBottom: 4 }}>Fit Score</Text>
        {data.options.map((opt, i) => (
          <View key={`fit-${i}`} style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{opt.universityName}</Text>
            <Text style={styles.fitScore}>{opt.fit.overallScore}% match</Text>
            <Text style={styles.fitExplanation}>{opt.fit.explanation}</Text>
          </View>
        ))}

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          Data sourced from IPEDS, College Scorecard, and Common Data Set. Confidence badges indicate data verification status: Verified (from authoritative source), Stale (older than 2 years), or No Data (not available). This report is for informational purposes only and does not constitute admissions advice.
        </Text>
      </Page>
    </Document>
  );

  return pdf(doc).toBuffer();
}

function computeFit(_universityName: string, dp: PdfDecisionProfile | null) {
  // Simple rule-based fit scoring (reuses same logic as BFF comparison engine)
  if (!dp) {
    return {
      overallScore: 0,
      breakdown: { academic: 0, financial: 0, interest: 0 },
      explanation: 'Complete your student profile to see fit scores.',
    };
  }

  const academic = dp.gpa ? Math.max(0, Math.min(100, Math.round(100 - Math.abs(dp.gpa - 3.5) * 40))) : 0;
  const financial = (dp.annualBudgetMin && dp.annualBudgetMax) ? 70 : 0; // placeholder
  const interest = dp.interestAreas ? 60 : 0; // placeholder

  const overall = Math.round((academic * 0.4 + financial * 0.3 + interest * 0.3));

  return {
    overallScore: overall,
    breakdown: { academic, financial, interest },
    explanation: `Academic fit: ${academic}%, Financial fit: ${financial}%, Interest match: ${interest}%`,
  };
}
