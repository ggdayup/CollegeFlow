import { Major, SubjectDemands, DemandLevel } from '../types';

/**
 * Programmatically computes the precise subject demands (Mathematics, Physics, Chemistry, Humanities)
 * for any of the 152 college majors based on deep domain relationships.
 */
export function calculateSubjectDemands(major: Partial<Major> & { nameEn: string; detailedFieldId: string; broadFieldId: string }): SubjectDemands {
  // Direct default values based on Detailed Academic Fields
  let math: DemandLevel = 'L';
  let physics: DemandLevel = 'L';
  let chemistry: DemandLevel = 'L';
  let humanities: DemandLevel = 'L';

  const field = major.detailedFieldId;
  const name = major.nameEn.toLowerCase();

  // 1. Broad Category Defaults
  if (major.broadFieldId === 'stem') {
    math = 'M';
    physics = 'M';
    chemistry = 'M';
    humanities = 'L';
  } else if (major.broadFieldId === 'humanities_arts') {
    math = 'L';
    physics = 'L';
    chemistry = 'L';
    humanities = 'H';
  } else if (major.broadFieldId === 'social_sciences') {
    math = 'M'; // Statistics and social research
    physics = 'L';
    chemistry = 'L';
    humanities = 'H';
  } else if (major.broadFieldId === 'education_public_service') {
    math = 'L';
    physics = 'L';
    chemistry = 'L';
    humanities = 'H';
  } else if (major.broadFieldId === 'healthcare') {
    math = 'M';
    physics = 'L';
    chemistry = 'H'; // Biology & pharmacology is heavy on chemistry
    humanities = 'M'; // Patient care empathy / sociology
  } else if (major.broadFieldId === 'business_comms') {
    math = 'M';
    physics = 'L';
    chemistry = 'L';
    humanities = 'M';
  } else if (major.broadFieldId === 'multidisciplinary') {
    math = 'M';
    physics = 'M';
    chemistry = 'M';
    humanities = 'M';
  } else if (major.broadFieldId === 'career_focused') {
    math = 'L';
    physics = 'L';
    chemistry = 'L';
    humanities = 'M';
  }

  // 2. Refined Detailed Field Rules
  if (field === 'computers_stats_math') {
    math = 'H';
    physics = 'M';
    chemistry = 'L';
    humanities = 'L';
  } else if (field === 'architecture_engineering') {
    math = 'H';
    physics = 'H';
    chemistry = 'M';
    humanities = 'L';
  } else if (field === 'physical_sciences') {
    math = 'H';
    physics = 'H';
    chemistry = 'H';
    humanities = 'L';
  } else if (field === 'biology_life') {
    math = 'M';
    physics = 'M';
    chemistry = 'H';
    humanities = 'L';
  } else if (field === 'business') {
    math = 'M';
    physics = 'L';
    chemistry = 'L';
    humanities = 'M';
  } else if (field === 'communications_journalism') {
    math = 'L';
    physics = 'L';
    chemistry = 'L';
    humanities = 'H';
  } else if (field === 'arts') {
    math = 'L';
    physics = 'L';
    chemistry = 'L';
    humanities = 'H';
  } else if (field === 'humanities_liberal_arts') {
    math = 'L';
    physics = 'L';
    chemistry = 'L';
    humanities = 'H';
  } else if (field === 'psychology') {
    math = 'M'; // Statistics in psychology
    physics = 'L';
    chemistry = 'L';
    humanities = 'H';
  } else if (field === 'social_sciences') {
    math = 'L';
    physics = 'L';
    chemistry = 'L';
    humanities = 'H';
  }

  // 3. Precise Single Major Overrides (matching keywords)
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
    name.includes('pharmacy') ||
    name.includes('pharmaceutical') ||
    name.includes('materials science') ||
    name.includes('metallurgical') ||
    name.includes('biomedical') ||
    name.includes('biochem') ||
    name.includes('genetic') ||
    name.includes('soil science') ||
    name.includes('food science')
  ) {
    chemistry = 'H';
  }

  // Humanities keywords (STEM or Business majors that have strong Humanities needs, or overrides)
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

  // Double check and guarantee some extreme logical constraints:
  // Non-STEM, non-business social studies: humanities are certainly High
  if (major.broadFieldId === 'humanities_arts' || major.broadFieldId === 'education_public_service') {
    humanities = 'H';
  }

  // Pure Math & Pure Physics should have H
  if (name === 'mathematics') {
    math = 'H';
    physics = 'H';
    chemistry = 'M';
    humanities = 'L';
  }
  if (name === 'physics') {
    math = 'H';
    physics = 'H';
    chemistry = 'M';
    humanities = 'L';
  }
  if (name === 'chemistry') {
    math = 'H';
    physics = 'M';
    chemistry = 'H';
    humanities = 'L';
  }

  return { math, physics, chemistry, humanities };
}

/**
 * Returns a bilingual label for the demand levels (H/M/L)
 */
export function getDemandLabel(level: DemandLevel, lang: 'zh' | 'en'): string {
  if (lang === 'zh') {
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
  { id: 'humanities' as const, nameEn: 'Humanities', nameZh: '人文' }
];
