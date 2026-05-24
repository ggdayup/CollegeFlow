import { Major, SubjectDemands, DemandLevel } from '../types';

/**
 * Programmatically computes the precise subject demands (Mathematics, Physics, Chemistry, Biology, Humanities)
 * for any of the 152 college majors based on deep database records or domain relationships.
 */
export function calculateSubjectDemands(major: Partial<Major> & { nameEn: string; detailedFieldId: string; broadFieldId: string }): SubjectDemands {
  // 1. High-Priority Database-Active Path
  const dbMath = (major as any).mathDemand;
  const dbPhysics = (major as any).physicsDemand;
  const dbChemistry = (major as any).chemistryDemand;
  const dbBiology = (major as any).biologyDemand;
  const dbHumanities = (major as any).humanitiesDemand;

  if (dbMath !== undefined && dbMath !== null && dbPhysics !== undefined && dbPhysics !== null) {
    return {
      math: dbMath as DemandLevel,
      physics: dbPhysics as DemandLevel,
      chemistry: dbChemistry as DemandLevel,
      biology: (dbBiology || 'L') as DemandLevel,
      humanities: dbHumanities as DemandLevel
    };
  }

  // 2. Fallback Static Heuristics Path
  let math: DemandLevel = 'L';
  let physics: DemandLevel = 'L';
  let chemistry: DemandLevel = 'L';
  let biology: DemandLevel = 'L';
  let humanities: DemandLevel = 'L';

  const field = major.detailedFieldId;
  const name = major.nameEn.toLowerCase();

  // Broad Category Defaults
  if (major.broadFieldId === 'stem') {
    math = 'M';
    physics = 'M';
    chemistry = 'M';
    biology = 'L';
    humanities = 'L';
  } else if (major.broadFieldId === 'humanities_arts') {
    math = 'L';
    physics = 'L';
    chemistry = 'L';
    biology = 'L';
    humanities = 'H';
  } else if (major.broadFieldId === 'social_sciences') {
    math = 'M';
    physics = 'L';
    chemistry = 'L';
    biology = 'L';
    humanities = 'H';
  } else if (major.broadFieldId === 'education_public_service') {
    math = 'L';
    physics = 'L';
    chemistry = 'L';
    biology = 'L';
    humanities = 'H';
  } else if (major.broadFieldId === 'healthcare') {
    math = 'M';
    physics = 'L';
    chemistry = 'H';
    biology = 'H';
    humanities = 'M';
  } else if (major.broadFieldId === 'business_comms') {
    math = 'M';
    physics = 'L';
    chemistry = 'L';
    biology = 'L';
    humanities = 'M';
  } else if (major.broadFieldId === 'multidisciplinary') {
    math = 'M';
    physics = 'M';
    chemistry = 'M';
    biology = 'M';
    humanities = 'M';
  } else if (major.broadFieldId === 'career_focused') {
    math = 'L';
    physics = 'L';
    chemistry = 'L';
    biology = 'L';
    humanities = 'M';
  }

  // Refined Detailed Field Rules
  if (field === 'computers_stats_math') {
    math = 'H';
    physics = 'M';
    chemistry = 'L';
    biology = 'L';
    humanities = 'L';
  } else if (field === 'architecture_engineering') {
    math = 'H';
    physics = 'H';
    chemistry = 'M';
    biology = 'L';
    humanities = 'L';
  } else if (field === 'physical_sciences') {
    math = 'H';
    physics = 'H';
    chemistry = 'H';
    biology = 'M';
    humanities = 'L';
  } else if (field === 'biology_life') {
    math = 'M';
    physics = 'M';
    chemistry = 'H';
    biology = 'H';
    humanities = 'L';
  } else if (field === 'business') {
    math = 'M';
    physics = 'L';
    chemistry = 'L';
    biology = 'L';
    humanities = 'M';
  } else if (field === 'communications_journalism') {
    math = 'L';
    physics = 'L';
    chemistry = 'L';
    biology = 'L';
    humanities = 'H';
  } else if (field === 'arts') {
    math = 'L';
    physics = 'L';
    chemistry = 'L';
    biology = 'L';
    humanities = 'H';
  } else if (field === 'humanities_liberal_arts') {
    math = 'L';
    physics = 'L';
    chemistry = 'L';
    biology = 'L';
    humanities = 'H';
  } else if (field === 'psychology') {
    math = 'M';
    physics = 'L';
    chemistry = 'L';
    biology = 'M';
    humanities = 'H';
  } else if (field === 'social_sciences') {
    math = 'L';
    physics = 'L';
    chemistry = 'L';
    biology = 'L';
    humanities = 'H';
  }

  // Mathematics keywords
  if (
    name.includes('math') ||
    name.includes('actuarial') ||
    name.includes('statistics') ||
    name.includes('finance') ||
    name.includes('economics')
  ) {
    math = 'H';
  }

  // Physics keywords
  if (
    name.includes('physics') ||
    name.includes('aerospace') ||
    name.includes('mechanical') ||
    name.includes('nuclear engineering') ||
    name.includes('civil engineering') ||
    name.includes('astronomy') ||
    name.includes('geophys')
  ) {
    physics = 'H';
  }

  // Chemistry keywords
  if (
    name.includes('chemist') ||
    name.includes('chemical') ||
    name.includes('materials science') ||
    name.includes('metallurgical')
  ) {
    chemistry = 'H';
  }

  // Biology keywords
  if (
    name.includes('biology') ||
    name.includes('biological') ||
    name.includes('biomedical') ||
    name.includes('botany') ||
    name.includes('zoology') ||
    name.includes('genetics') ||
    name.includes('microbiology') ||
    name.includes('physiology') ||
    name.includes('neuroscience') ||
    name.includes('biochemical') ||
    name.includes('agriculture') ||
    name.includes('plant science') ||
    name.includes('ecology') ||
    name.includes('environmental science')
  ) {
    biology = 'H';
  }

  // Humanities keywords
  if (
    name.includes('architecture') ||
    name.includes('history') ||
    name.includes('liberal arts') ||
    name.includes('english') ||
    name.includes('language') ||
    name.includes('art') ||
    name.includes('music') ||
    name.includes('drama') ||
    name.includes('theological') ||
    name.includes('religious') ||
    name.includes('philosophy') ||
    name.includes('anthropology') ||
    name.includes('sociology') ||
    name.includes('public policy') ||
    name.includes('communication') ||
    name.includes('journalism') ||
    name.includes('education') ||
    name.includes('teacher') ||
    name.includes('social work') ||
    name.includes('law') ||
    name.includes('political') ||
    name.includes('international relations')
  ) {
    humanities = 'H';
  }

  // Double check logical constraints
  if (major.broadFieldId === 'humanities_arts' || major.broadFieldId === 'education_public_service') {
    humanities = 'H';
  }

  // Extreme cases overrides
  if (name === 'mathematics') {
    math = 'H';
    physics = 'H';
    chemistry = 'M';
    biology = 'L';
    humanities = 'L';
  }
  if (name === 'physics') {
    math = 'H';
    physics = 'H';
    chemistry = 'M';
    biology = 'L';
    humanities = 'L';
  }
  if (name === 'chemistry') {
    math = 'H';
    physics = 'M';
    chemistry = 'H';
    biology = 'L';
    humanities = 'L';
  }
  if (name.includes('biology') && name.includes('chemistry')) {
    chemistry = 'H';
    biology = 'H';
  }

  return { math, physics, chemistry, biology, humanities };
}

/**
 * Returns a bilingual label for the demand levels (H/M/L)
 */
export function getDemandLabel(level: DemandLevel, lang: 'zh' | 'zht' | 'en'): string {
  if (lang === 'zh' || lang === 'zht') {
    return level === 'H' ? '高' : level === 'M' ? '中' : '低';
  }
  return level === 'H' ? 'High' : level === 'M' ? 'Medium' : 'Low';
}

/**
 * Returns standard Tailwind color classes for the demand badges
 */
export function getDemandBadgeClass(level: DemandLevel): string {
  if (level === 'H') {
    return 'bg-blue-50 text-blue-750 border-blue-200 ring-1 ring-blue-100';
  } else if (level === 'M') {
    return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-100';
  } else {
    return 'bg-slate-50 text-slate-500 border-slate-200';
  }
}

/**
 * Subject metadata labels
 */
export const subjectData = [
  { id: 'math' as const, nameEn: 'Math', nameZh: '数学' },
  { id: 'physics' as const, nameEn: 'Physics', nameZh: '物理' },
  { id: 'chemistry' as const, nameEn: 'Chemistry', nameZh: '化学' },
  { id: 'biology' as const, nameEn: 'Biology', nameZh: '生物' },
  { id: 'humanities' as const, nameEn: 'Humanities', nameZh: '人文' }
];
