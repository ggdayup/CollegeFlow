/**
 * Unicode-safe Types and Interfaces for the Bachelor Majors Database
 */

export interface BroadField {
  id: string;
  nameEn: string;
  nameZh: string;
  recentMedianEarningsEn: string;
  recentMedianEarningsVal: number;
  primeMedianEarningsEn: string;
  primeMedianEarningsVal: number;
  gradPremiumPercent: number; // e.g. 32 for 32%
  gradDegreePercent: number;  // e.g. 25
  gradDegreeAlternativePercent?: number; // to handle discrepancies (e.g. 44)
}

export interface DetailedField {
  id: string;
  nameEn: string;
  nameZh: string;
  broadFieldId: string;
  primeMedianEarningsVal: number;
  unemploymentRecentPercent: number; // e.g. 4.0 for 4%
  unemploymentPrimePercent: number; // e.g. 1.9 for 1.9%
  degreeProductionChangePercent: number; // e.g. 65 for +65% or -14 for -14%
}

export type DemandLevel = 'H' | 'M' | 'L'; // High, Medium, Low

export interface SubjectDemands {
  math: DemandLevel;
  physics: DemandLevel;
  chemistry: DemandLevel;
  humanities: DemandLevel;
}

export interface Major {
  id: string;
  nameEn: string;
  nameZh: string;
  broadFieldId: string;
  detailedFieldId: string;
  specialTag?: 'highest' | 'lowest' | null;
  earningsValue?: number; // Peak earning value if individual spotlighted major
  subjectDemands?: SubjectDemands;
}

export interface HighlightMajor {
  nameEn: string;
  nameZh: string;
  earningsVal: number;
  type: 'highest' | 'lowest';
}
