/**
 * matchingHelper.ts
 * High-performance string metrics utility for calculating lexical similarity scores
 * and programmatic quality control audits for college major university mappings.
 */

/**
 * Calculates the Jaro-Winkler similarity score between two strings.
 * Returns a score between 0.0 (completely different) and 1.0 (exact match).
 */
export function calculateJaroWinkler(str1: string, str2: string): number {
  const s1 = str1.trim().toLowerCase();
  const s2 = str2.trim().toLowerCase();

  if (s1 === s2) return 1.0;

  const len1 = s1.length;
  const len2 = s2.length;

  if (len1 === 0 || len2 === 0) return 0.0;

  // Max matching window range
  const matchWindow = Math.floor(Math.max(len1, len2) / 2) - 1;
  const s1Matches = new Array(len1).fill(false);
  const s2Matches = new Array(len2).fill(false);

  let matches = 0;
  let transpositions = 0;

  // Find matches within the window range
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(len2 - 1, i + matchWindow);

    for (let j = start; j <= end; j++) {
      if (s2Matches[j]) continue;
      if (s1[i] === s2[j]) {
        s1Matches[i] = true;
        s2Matches[j] = true;
        matches++;
        break;
      }
    }
  }

  if (matches === 0) return 0.0;

  // Calculate transpositions
  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) {
      transpositions++;
    }
    k++;
  }

  const jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3.0;

  // Winkler enhancement (based on common prefix up to 4 characters)
  let prefixLength = 0;
  const maxPrefix = Math.min(4, Math.min(len1, len2));
  for (let i = 0; i < maxPrefix; i++) {
    if (s1[i] === s2[i]) {
      prefixLength++;
    } else {
      break;
    }
  }

  // Constant scaling factor = 0.1
  const jaroWinkler = jaro + prefixLength * 0.1 * (1.0 - jaro);
  return +jaroWinkler.toFixed(4);
}

/**
 * Quality Control Auditor: determines if a mapping is robust enough for auto-validation
 * or needs to be flagged for manual admin approval.
 * @param score Lexical match score
 * @param threshold Acceptable similarity cut-off (default: 0.72)
 */
export function getValidationAudit(score: number, threshold = 0.72): { isValidated: boolean; auditMsg: string } {
  if (score >= threshold) {
    return {
      isValidated: true,
      auditMsg: `Auto-validated. Score ${score} satisfies the quality limit (>= ${threshold}).`
    };
  }
  return {
    isValidated: false,
    auditMsg: `Flagged for audit. Score ${score} falls below the quality limit (< ${threshold}).`
  };
}
