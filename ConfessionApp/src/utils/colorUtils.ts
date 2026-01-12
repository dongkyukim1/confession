/**
 * 색상 유틸리티
 *
 * 테마 색상에 안전하게 접근하기 위한 헬퍼 함수들
 */
import {lightColors} from '../theme/colors';

type ColorScheme = typeof lightColors;

/**
 * neutral 색상 스케일에서 안전하게 색상 가져오기
 */
export function getNeutralColor(
  colors: ColorScheme,
  shade: number,
  fallback: string,
): string {
  if (typeof colors.neutral === 'object' && colors.neutral !== null) {
    const neutralColors = colors.neutral as Record<number, string>;
    return neutralColors[shade] ?? fallback;
  }
  return fallback;
}

/**
 * 자주 사용되는 neutral 색상들을 한번에 추출
 */
export function extractNeutralColors(colors: ColorScheme) {
  return {
    neutral0: getNeutralColor(colors, 0, '#FFFFFF'),
    neutral50: getNeutralColor(colors, 50, '#FAFAFA'),
    neutral100: getNeutralColor(colors, 100, '#F5F5F5'),
    neutral200: getNeutralColor(colors, 200, '#E5E5E5'),
    neutral300: getNeutralColor(colors, 300, '#D4D4D4'),
    neutral400: getNeutralColor(colors, 400, '#9CA3AF'),
    neutral500: getNeutralColor(colors, 500, '#737373'),
    neutral600: getNeutralColor(colors, 600, '#525252'),
    neutral700: getNeutralColor(colors, 700, '#404040'),
    neutral800: getNeutralColor(colors, 800, '#262626'),
    neutral900: getNeutralColor(colors, 900, '#171717'),
    neutral1000: getNeutralColor(colors, 1000, '#000000'),
  };
}

/**
 * primary 색상 스케일에서 안전하게 색상 가져오기
 */
export function getPrimaryColor(
  colors: ColorScheme,
  shade: number,
  fallback?: string,
): string {
  if (typeof colors.primaryScale === 'object' && colors.primaryScale !== null) {
    const primaryColors = colors.primaryScale as Record<number, string>;
    return primaryColors[shade] ?? fallback ?? colors.primary;
  }
  return fallback ?? colors.primary;
}

/**
 * 자주 사용되는 primary 색상들을 한번에 추출
 */
export function extractPrimaryColors(colors: ColorScheme) {
  return {
    primary50: getPrimaryColor(colors, 50),
    primary100: getPrimaryColor(colors, 100),
    primary200: getPrimaryColor(colors, 200),
    primary300: getPrimaryColor(colors, 300),
    primary400: getPrimaryColor(colors, 400),
    primary500: getPrimaryColor(colors, 500),
    primary600: getPrimaryColor(colors, 600),
    primary700: getPrimaryColor(colors, 700),
    primary800: getPrimaryColor(colors, 800),
    primary900: getPrimaryColor(colors, 900),
  };
}

/**
 * mood 색상 안전하게 가져오기
 */
export function getMoodColor(
  colors: ColorScheme,
  mood: string,
  fallback: string = '#9CA3AF',
): string {
  if (colors.moodColors && typeof colors.moodColors === 'object') {
    const moodColors = colors.moodColors as Record<string, string>;
    return moodColors[mood] ?? fallback;
  }
  return fallback;
}

/**
 * 성공/경고/에러/정보 색상 추출
 */
export function extractStatusColors(colors: ColorScheme) {
  return {
    success: colors.success ?? '#22C55E',
    successLight: colors.successLight ?? 'rgba(34, 197, 94, 0.1)',
    warning: colors.warning ?? '#F59E0B',
    warningLight: colors.warningLight ?? 'rgba(245, 158, 11, 0.1)',
    error: colors.error ?? '#EF4444',
    errorLight: colors.errorLight ?? 'rgba(239, 68, 68, 0.1)',
    info: colors.info ?? '#3B82F6',
    infoLight: colors.infoLight ?? 'rgba(59, 130, 246, 0.1)',
  };
}

/**
 * 테마 색상 객체에서 안전하게 값 가져오기 (일반용)
 */
export function getSafeColor<T extends Record<string, unknown>>(
  obj: T | undefined,
  key: keyof T,
  fallback: string,
): string {
  if (obj && typeof obj === 'object' && key in obj) {
    const value = obj[key];
    if (typeof value === 'string') {
      return value;
    }
  }
  return fallback;
}
