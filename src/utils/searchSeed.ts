/**
 * Client-side search against majorsData and universitiesData seed files.
 * Multi-token AND matching: each space-separated token must match at least one field.
 */

import { majors, broadFields, detailedFields } from '../data/majorsData';
import { universities } from '../data/universitiesData';

const COUNTRY_KEYWORDS: Record<string, string[]> = {
  美: ['United States', 'USA', 'US'],
  加: ['Canada', 'CA'],
  英: ['United Kingdom', 'UK', 'Britain'],
  澳: ['Australia', 'AU'],
  us: ['United States', 'USA', 'US'],
  uk: ['United Kingdom', 'UK', 'Britain'],
  ca: ['Canada', 'CA'],
  au: ['Australia', 'AU'],
  usa: ['United States', 'USA', 'US'],
  america: ['United States', 'USA', 'US'],
  'united states': ['United States', 'USA', 'US'],
  britain: ['United Kingdom', 'UK', 'Britain'],
  england: ['United Kingdom', 'UK', 'Britain'],
  canada: ['Canada', 'CA'],
  australia: ['Australia', 'AU'],
};

export interface SearchResultMajor {
  type: 'major';
  id: string;
  nameEn: string;
  nameZh: string;
  salary: string;
  salaryVal: number;
  primeSalary: string;
  primeVal: number;
  auditCode: string;
  broadFieldId: string;
  detailedFieldId: string;
  locked: boolean;
}

export interface SearchResultUniversity {
  type: 'university';
  id: string;
  nameEn: string;
  nameZh: string;
  shortNameEn: string;
  shortNameZh: string;
  countryEn?: string;
  countryZh?: string;
  schoolCount: number;
  majorCount: number;
  locked: boolean;
}

export interface SearchResultComparison {
  type: 'comparison';
  id: string;
  title: string;
  description: string;
  locked: boolean;
}

export interface SearchResults {
  majors: SearchResultMajor[];
  universities: SearchResultUniversity[];
  comparisons: SearchResultComparison[];
}

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0);
}

function containsAllTokens(text: string, tokens: string[]): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return tokens.every((t) => lower.includes(t));
}

function containsAnyToken(text: string, tokens: string[]): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return tokens.some((t) => lower.includes(t));
}

function score(text: string, tokens: string[]): number {
  if (!text) return 0;
  const lower = text.toLowerCase();
  return tokens.filter((t) => lower.includes(t)).length;
}

function generateAuditCode(majorId: string): string {
  const hash = majorId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return `USN-2026-${hash.toString(36).toUpperCase()}-${majorId.slice(0, 3).toUpperCase()}`;
}

export function searchSeedData(query: string): SearchResults {
  const tokens = tokenize(query);
  if (tokens.length === 0) {
    return { majors: [], universities: [], comparisons: [] };
  }

  // Check if query targets a specific country
  const countryAliases: string[] = [];
  const searchTokens = tokens.filter((t) => {
    const mapped = COUNTRY_KEYWORDS[t];
    if (mapped) {
      countryAliases.push(...mapped);
      return false;
    }
    return true;
  });

  // If no search tokens (only country keyword), use all tokens for matching
  const effectiveTokens = searchTokens.length > 0 ? searchTokens : tokens;

  // Search majors
  const matchedMajors: SearchResultMajor[] = majors
    .filter((m) => {
      const broadField = broadFields.find((b) => b.id === m.broadFieldId);
      const detailedField = detailedFields.find((d) => d.id === m.detailedFieldId);
      const fields = [m.nameEn, m.nameZh, broadField?.nameEn, broadField?.nameZh, detailedField?.nameEn, detailedField?.nameZh].filter(Boolean) as string[];

      return effectiveTokens.every((t) => fields.some((f) => f.toLowerCase().includes(t)));
    })
    .map((m) => {
      const broadField = broadFields.find((b) => b.id === m.broadFieldId);
      const detailedField = detailedFields.find((d) => d.id === m.detailedFieldId);
      return {
        type: 'major' as const,
        id: m.id,
        nameEn: m.nameEn,
        nameZh: m.nameZh,
        salary: broadField?.recentMedianEarningsEn ?? 'N/A',
        salaryVal: broadField?.recentMedianEarningsVal ?? 0,
        primeSalary: broadField?.primeMedianEarningsEn ?? 'N/A',
        primeVal: broadField?.primeMedianEarningsVal ?? 0,
        auditCode: generateAuditCode(m.id),
        broadFieldId: m.broadFieldId,
        detailedFieldId: m.detailedFieldId,
        locked: false,
      };
    })
    .sort((a, b) => b.nameEn.localeCompare(a.nameEn))
    .slice(0, 20);

  // Search universities
  const matchedUniversities: SearchResultUniversity[] = universities
    .filter((u) => {
      // Country filter: match against countryEn, countryZh, location, or name aliases
      if (countryAliases.length > 0) {
        const countryFields = [u.countryEn, u.countryZh, u.locationEn, u.locationZh].filter(Boolean) as string[];
        const hasCountryMatch = countryAliases.some((alias) =>
          countryFields.some((f) => f.toLowerCase().includes(alias.toLowerCase()))
        );
        if (!hasCountryMatch) return false;
      }

      const fields = [u.nameEn, u.nameZh, u.shortNameEn, u.shortNameZh, u.countryEn, u.countryZh, u.locationEn, u.locationZh].filter(Boolean) as string[];

      // If no search tokens (only country keyword), match all that passed country filter
      if (searchTokens.length === 0) return true;

      return searchTokens.every((t) => fields.some((f) => f.toLowerCase().includes(t)));
    })
    .map((u) => ({
      type: 'university' as const,
      id: u.id,
      nameEn: u.nameEn,
      nameZh: u.nameZh,
      shortNameEn: u.shortNameEn,
      shortNameZh: u.shortNameZh,
      countryEn: u.countryEn,
      countryZh: u.countryZh,
      schoolCount: u.schools?.length ?? 0,
      majorCount:
        u.schools?.reduce(
          (acc, s) =>
            acc +
            (s.majors?.length ?? 0) +
            (s.categories?.reduce((cAcc, c) => cAcc + (c.majors?.length ?? 0), 0) ?? 0),
          0
        ) ?? 0,
      locked: false,
    }))
    .sort((a, b) => b.nameEn.localeCompare(a.nameEn))
    .slice(0, 20);

  // Generate comparison suggestions based on matches
  const comparisons: SearchResultComparison[] = [];
  if (matchedMajors.length > 1) {
    comparisons.push({
      type: 'comparison',
      id: 'major-compare',
      title: '专业对比',
      description: `对比 ${matchedMajors.length} 个专业的薪资、ROI 和课程流`,
      locked: true,
    });
  }
  if (matchedUniversities.length > 1) {
    comparisons.push({
      type: 'comparison',
      id: 'university-compare',
      title: '院校对比',
      description: `对比 ${matchedUniversities.length} 所院校的专业设置、录取率和毕业生去向`,
      locked: true,
    });
  }
  if (matchedMajors.length > 0 && matchedUniversities.length > 0) {
    comparisons.push({
      type: 'comparison',
      id: 'major-university-match',
      title: '专业-院校匹配',
      description: `查看 ${matchedMajors[0].nameEn} 在 ${matchedUniversities[0].nameEn} 的开设情况和毕业回报`,
      locked: true,
    });
  }

  return {
    majors: matchedMajors,
    universities: matchedUniversities,
    comparisons,
  };
}
