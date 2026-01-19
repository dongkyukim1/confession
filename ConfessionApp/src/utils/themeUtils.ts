/**
 * 테마 유틸리티 함수
 * 
 * colors 객체를 안전하게 처리하는 공통 함수들
 */
import {ColorScheme} from '../theme/colors';

/**
 * 기본 색상 fallback 객체
 */
const DEFAULT_COLORS: Partial<ColorScheme> = {
  background: '#FAFBFC',
  primary: '#FD5068',
  surface: '#FFFFFF',
  textPrimary: '#1C1C1E',
  textSecondary: '#8E8E93',
  textTertiary: '#8E8E93',
  success: '#21D07C',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  border: '#E5E7EB',
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    1000: '#000000',
  },
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },
  danger: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    900: '#7F1D1D',
  },
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
  },
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
  },
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
  },
  primaryScale: {
    50: '#FFF1F2',
    100: '#FFE4E6',
    200: '#FECDD3',
    300: '#FDA4AF',
    400: '#FB7185',
    500: '#FD5068',
    600: '#E8395F',
    700: '#BE185D',
    800: '#9F1239',
    900: '#881337',
  },
};

/**
 * colors 객체를 안전하게 가져오는 함수
 * @param theme - useTheme()에서 반환된 theme 객체
 * @returns 안전하게 처리된 colors 객체
 */
export function getSafeColors(theme: any): ColorScheme {
  if (!theme || typeof theme.colors !== 'object') {
    return DEFAULT_COLORS as ColorScheme;
  }
  
  const colors = theme.colors;
  
  // colors가 문자열이 아닌 객체인지 확인
  if (typeof colors === 'string') {
    return DEFAULT_COLORS as ColorScheme;
  }
  
  return colors as ColorScheme;
}

/**
 * primary 색상을 안전하게 가져오는 함수
 * @param colors - ColorScheme 객체
 * @returns primary 색상 (문자열)
 */
export function getPrimaryColor(colors: ColorScheme | any): string {
  if (!colors) return '#FD5068';
  
  if (typeof colors.primaryScale === 'object' && colors.primaryScale?.[500]) {
    return colors.primaryScale[500];
  }
  
  if (typeof colors.primary === 'string') {
    return colors.primary;
  }
  
  return '#FD5068';
}

/**
 * neutral 색상을 안전하게 가져오는 함수
 * @param colors - ColorScheme 객체
 * @param shade - 색상 단계 (0-1000)
 * @returns neutral 색상 (문자열)
 */
export function getNeutralColor(colors: ColorScheme | any, shade: keyof ColorScheme['neutral']): string {
  if (!colors || typeof colors.neutral !== 'object') {
    const defaults: Record<keyof ColorScheme['neutral'], string> = {
      0: '#FFFFFF',
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#E5E5E5',
      300: '#D4D4D4',
      400: '#A3A3A3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      1000: '#000000',
    };
    return defaults[shade] || '#737373';
  }
  
  return colors.neutral[shade] || '#737373';
}

