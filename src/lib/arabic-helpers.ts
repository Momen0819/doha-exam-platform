/**
 * Arabic Tashkeel symbols & Helper utilities for Doha Mostafa Exam Platform
 */

export interface TashkeelChar {
  label: string;
  char: string;
  name: string;
  example: string;
}

export const TASHKEEL_LIST: TashkeelChar[] = [
  { label: 'َ', char: '\u064E', name: 'فَتْحَة', example: 'بَ' },
  { label: 'ُ', char: '\u064F', name: 'ضَمَّة', example: 'بُ' },
  { label: 'ِ', char: '\u0650', name: 'كَسْرَة', example: 'بِ' },
  { label: 'ً', char: '\u064B', name: 'تَنْوِين فَتْح', example: 'بً' },
  { label: 'ٌ', char: '\u064C', name: 'تَنْوِين ضَمّ', example: 'بٌ' },
  { label: 'ٍ', char: '\u064D', name: 'تَنْوِين كَسْر', example: 'بٍ' },
  { label: 'ْ', char: '\u0652', name: 'سُكُون', example: 'بْ' },
  { label: 'ّ', char: '\u0651', name: 'شَدَّة', example: 'بّ' },
  { label: 'ـ', char: '\u0640', name: 'تَطْوِيل', example: 'ـ' },
];

export const TASHKEEL_BUTTONS = TASHKEEL_LIST;

/**
 * Strips diacritics / tashkeel for relaxed comparison
 */
export function removeTashkeel(text: string): string {
  if (!text) return '';
  return text.replace(/[\u064B-\u0652\u0670\u0640]/g, '').trim();
}

/**
 * Normalizes common Arabic letter variants:
 * أ, إ, آ, ٱ -> ا
 * ة -> ه (in relaxed mode)
 * ى -> ي (in relaxed mode)
 */
export function normalizeArabic(text: string, strictAlef = false): string {
  if (!text) return '';
  let res = removeTashkeel(text);
  if (!strictAlef) {
    res = res.replace(/[أإآٱ]/g, 'ا');
    res = res.replace(/ة/g, 'ه');
    res = res.replace(/ى/g, 'ي');
  }
  return res.replace(/\s+/g, ' ').trim();
}

/**
 * Auto-grading comparator for student answers
 */
export function compareAnswers(
  studentAnswer: string,
  correctAnswer: string,
  requireExactTashkeel = false
): { isMatch: boolean; accuracyPercent: number } {
  if (!studentAnswer || !correctAnswer) {
    return { isMatch: false, accuracyPercent: 0 };
  }

  const cleanStudent = studentAnswer.trim();
  const cleanCorrect = correctAnswer.trim();

  // 1. Exact match including Tashkeel
  if (cleanStudent === cleanCorrect) {
    return { isMatch: true, accuracyPercent: 100 };
  }

  // If exact tashkeel is required and didn't match
  if (requireExactTashkeel) {
    return { isMatch: false, accuracyPercent: 60 };
  }

  // 2. Normalized comparison without Tashkeel
  const normStudent = normalizeArabic(cleanStudent, false);
  const normCorrect = normalizeArabic(cleanCorrect, false);

  if (normStudent === normCorrect) {
    return { isMatch: true, accuracyPercent: 95 };
  }

  // Partial Levenshtein/word overlap for short answers
  const studentWords = new Set(normStudent.split(' '));
  const correctWords = normCorrect.split(' ');
  const matchCount = correctWords.filter(w => studentWords.has(w)).length;
  const accuracy = Math.round((matchCount / Math.max(correctWords.length, 1)) * 100);

  return {
    isMatch: accuracy >= 80,
    accuracyPercent: accuracy,
  };
}

export function calculateLevenshteinSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 100;
  if (!str1 || !str2) return 0;

  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  const similarity = Math.round(((maxLen - distance) / maxLen) * 100);
  return Math.max(0, similarity);
}
