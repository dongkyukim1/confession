/**
 * Safe Theme Colors Hook
 *
 * 반복되는 색상 fallback 패턴을 제거하고 안전한 색상 접근 제공
 */
import {useTheme} from '../contexts/ThemeContext';
import {lightColors, ColorScheme} from '../theme/colors';

interface NeutralScale {
  0: string;
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  1000: string;
}

interface ErrorScale {
  50: string;
  100: string;
  500: string;
  600: string;
  700: string;
}

interface WarningScale {
  50: string;
  100: string;
  500: string;
  600: string;
  700: string;
  800: string;
}

interface SuccessScale {
  50: string;
  100: string;
  500: string;
  600: string;
  700: string;
}

interface InfoScale {
  50: string;
  100: string;
  500: string;
  600: string;
  700: string;
}

interface PrimaryScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

interface ThemeColorsResult {
  colors: ColorScheme;
  neutral: NeutralScale;
  error: ErrorScale;
  warning: WarningScale;
  success: SuccessScale;
  info: InfoScale;
  primaryScale: PrimaryScale;
  isDark: boolean;
  currentThemeName: string;
  setThemeMode: ((mode: string) => void) | undefined;
}

// 기본값 상수 정의
const DEFAULT_NEUTRAL: NeutralScale = {
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

const DEFAULT_ERROR: ErrorScale = {
  50: '#FEF2F2',
  100: '#FEE2E2',
  500: '#EF4444',
  600: '#DC2626',
  700: '#B91C1C',
};

const DEFAULT_WARNING: WarningScale = {
  50: '#FFFBEB',
  100: '#FEF3C7',
  500: '#F59E0B',
  600: '#D97706',
  700: '#B45309',
  800: '#92400E',
};

const DEFAULT_SUCCESS: SuccessScale = {
  50: '#F0FDF4',
  100: '#DCFCE7',
  500: '#22C55E',
  600: '#16A34A',
  700: '#15803D',
};

const DEFAULT_INFO: InfoScale = {
  50: '#EFF6FF',
  100: '#DBEAFE',
  500: '#3B82F6',
  600: '#2563EB',
  700: '#1D4ED8',
};

const DEFAULT_PRIMARY_SCALE: PrimaryScale = {
  50: '#EEF2FF',
  100: '#E0E7FF',
  200: '#C7D2FE',
  300: '#A5B4FC',
  400: '#818CF8',
  500: '#6366F1',
  600: '#4F46E5',
  700: '#4338CA',
  800: '#3730A3',
  900: '#312E81',
};

/**
 * 안전한 테마 색상 훅
 *
 * 반복되는 fallback 패턴을 제거하고 타입 안전한 색상 접근 제공
 *
 * @example
 * ```tsx
 * const { colors, neutral, isDark } = useThemeColors();
 * // 이제 neutral[500] 같이 바로 접근 가능
 * ```
 */
export function useThemeColors(): ThemeColorsResult {
  const theme = useTheme();
  const colors =
    theme && typeof theme.colors === 'object' && theme.colors
      ? theme.colors
      : lightColors;

  // Pre-computed neutral scale with fallbacks
  const neutral: NeutralScale = {
    0: colors.neutral?.[0] ?? DEFAULT_NEUTRAL[0],
    50: colors.neutral?.[50] ?? DEFAULT_NEUTRAL[50],
    100: colors.neutral?.[100] ?? DEFAULT_NEUTRAL[100],
    200: colors.neutral?.[200] ?? DEFAULT_NEUTRAL[200],
    300: colors.neutral?.[300] ?? DEFAULT_NEUTRAL[300],
    400: colors.neutral?.[400] ?? DEFAULT_NEUTRAL[400],
    500: colors.neutral?.[500] ?? DEFAULT_NEUTRAL[500],
    600: colors.neutral?.[600] ?? DEFAULT_NEUTRAL[600],
    700: colors.neutral?.[700] ?? DEFAULT_NEUTRAL[700],
    800: colors.neutral?.[800] ?? DEFAULT_NEUTRAL[800],
    900: colors.neutral?.[900] ?? DEFAULT_NEUTRAL[900],
    1000: colors.neutral?.[1000] ?? DEFAULT_NEUTRAL[1000],
  };

  const error: ErrorScale = {
    50: colors.error?.[50] ?? DEFAULT_ERROR[50],
    100: colors.error?.[100] ?? DEFAULT_ERROR[100],
    500: colors.error?.[500] ?? DEFAULT_ERROR[500],
    600: colors.error?.[600] ?? DEFAULT_ERROR[600],
    700: colors.error?.[700] ?? DEFAULT_ERROR[700],
  };

  const warning: WarningScale = {
    50: colors.warning?.[50] ?? DEFAULT_WARNING[50],
    100: colors.warning?.[100] ?? DEFAULT_WARNING[100],
    500: colors.warning?.[500] ?? DEFAULT_WARNING[500],
    600: colors.warning?.[600] ?? DEFAULT_WARNING[600],
    700: colors.warning?.[700] ?? DEFAULT_WARNING[700],
    800: colors.warning?.[800] ?? DEFAULT_WARNING[800],
  };

  const success: SuccessScale = {
    50: colors.success?.[50] ?? DEFAULT_SUCCESS[50],
    100: colors.success?.[100] ?? DEFAULT_SUCCESS[100],
    500: colors.success?.[500] ?? DEFAULT_SUCCESS[500],
    600: colors.success?.[600] ?? DEFAULT_SUCCESS[600],
    700: colors.success?.[700] ?? DEFAULT_SUCCESS[700],
  };

  const info: InfoScale = {
    50: colors.info?.[50] ?? DEFAULT_INFO[50],
    100: colors.info?.[100] ?? DEFAULT_INFO[100],
    500: colors.info?.[500] ?? DEFAULT_INFO[500],
    600: colors.info?.[600] ?? DEFAULT_INFO[600],
    700: colors.info?.[700] ?? DEFAULT_INFO[700],
  };

  const primaryScale: PrimaryScale = {
    50: colors.primaryScale?.[50] ?? DEFAULT_PRIMARY_SCALE[50],
    100: colors.primaryScale?.[100] ?? DEFAULT_PRIMARY_SCALE[100],
    200: colors.primaryScale?.[200] ?? DEFAULT_PRIMARY_SCALE[200],
    300: colors.primaryScale?.[300] ?? DEFAULT_PRIMARY_SCALE[300],
    400: colors.primaryScale?.[400] ?? DEFAULT_PRIMARY_SCALE[400],
    500: colors.primaryScale?.[500] ?? DEFAULT_PRIMARY_SCALE[500],
    600: colors.primaryScale?.[600] ?? DEFAULT_PRIMARY_SCALE[600],
    700: colors.primaryScale?.[700] ?? DEFAULT_PRIMARY_SCALE[700],
    800: colors.primaryScale?.[800] ?? DEFAULT_PRIMARY_SCALE[800],
    900: colors.primaryScale?.[900] ?? DEFAULT_PRIMARY_SCALE[900],
  };

  return {
    colors,
    neutral,
    error,
    warning,
    success,
    info,
    primaryScale,
    isDark: theme?.isDark ?? false,
    currentThemeName: theme?.currentThemeName ?? 'light',
    setThemeMode: theme?.setThemeMode,
  };
}
