/**
 * 앱 전체 컬러 시스템
 * 
 * 2026 디자인 시스템 기반: 뉴트럴 컬러 중심, 브랜드 컬러는 accent로만 사용
 * UI는 보이지 않을수록 좋음 - 콘텐츠와 감정이 주인공
 * 다양한 테마 지원 (Light, Dark, Ocean, Sunset, Forest, Purple Dream)
 */

// 공통 뉴트럴 스케일 (라이트 모드용)
export const lightNeutralScale = {
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
} as const;

// 공통 뉴트럴 스케일 (다크 모드용)
export const darkNeutralScale = {
  0: '#000000',
  50: '#171717',
  100: '#262626',
  200: '#404040',
  300: '#525252',
  400: '#737373',
  500: '#9A9A9A',
  600: '#D0D0D0',
  700: '#E5E5E5',
  800: '#F5F5F5',
  900: '#FAFAFA',
  1000: '#FFFFFF',
} as const;

// 공통 타입 정의
export type ColorScheme = {
  // 기존 색상 (하위 호환성 유지)
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  background: string;
  backgroundAlt: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  border: string;
  borderLight: string;
  borderDark: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  gradientStart: string;
  gradientEnd: string;
  overlay: string;
  overlayLight: string;
  editorColors: {
    red: string;
    orange: string;
    yellow: string;
    green: string;
    blue: string;
    purple: string;
    pink: string;
  };
  moodColors: {
    happy: string;
    sad: string;
    angry: string;
    tired: string;
    love: string;
    surprised: string;
    calm: string;
    excited: string;
  };
  // 새로운 색상 시스템 (객체 형태)
  neutral: {
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
  };
  error: {
    50: string;
    100: string;
    500: string;
    600: string;
    700: string;
  };
  danger: {
    50: string;
    100: string;
    500: string;
    600: string;
    700: string;
    900: string;
  };
  warning: {
    50: string;
    100: string;
    500: string;
    600: string;
    700: string;
    800: string;
  };
  success: {
    50: string;
    100: string;
    500: string;
    600: string;
    700: string;
  };
  info: {
    50: string;
    100: string;
    500: string;
    600: string;
    700: string;
  };
  primaryScale: {
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
  };
};

// 라이트 모드 컬러
export const lightColors: ColorScheme = {
  // Primary Colors (뉴트럴 기반 - 기본 UI용)
  primary: lightNeutralScale[700],           // 뉴트럴 700 - 기본 버튼/링크 (눈에 띄지 않게)
  primaryLight: lightNeutralScale[600],      // 뉴트럴 600 - 밝은 버전
  primaryDark: lightNeutralScale[800],       // 뉴트럴 800 - 어두운 버전
  
  // Secondary Colors (뉴트럴 기반)
  secondary: lightNeutralScale[500],         // 뉴트럴 500 - 보조 요소
  accent: '#EC4899',                         // 브랜드 컬러 (핑크) - 강조용으로만 사용 (좋아요, 중요한 CTA)
  
  // Background Colors (뉴트럴 기반)
  background: lightNeutralScale[50],        // 뉴트럴 50 - 메인 배경
  backgroundAlt: lightNeutralScale[100],     // 뉴트럴 100 - 대체 배경
  surface: lightNeutralScale[0],           // 뉴트럴 0 - 카드/표면
  
  // Text Colors (뉴트럴 기반)
  textPrimary: lightNeutralScale[700],       // 뉴트럴 700 - 주요 텍스트 (고대비 지양)
  textSecondary: lightNeutralScale[500],     // 뉴트럴 500 - 보조 텍스트
  textTertiary: lightNeutralScale[400],      // 뉴트럴 400 - 3차 텍스트
  textDisabled: lightNeutralScale[300],      // 뉴트럴 300 - 비활성 텍스트
  
  // Border Colors (뉴트럴 기반, 매우 얕음)
  border: lightNeutralScale[200],            // 뉴트럴 200 - 기본 테두리
  borderLight: lightNeutralScale[100],       // 뉴트럴 100 - 밝은 테두리
  borderDark: lightNeutralScale[300],        // 뉴트럴 300 - 어두운 테두리
  
  // Semantic Colors
  success: '#10B981',           // 성공
  warning: '#F59E0B',           // 경고
  error: '#EF4444',             // 에러
  info: '#3B82F6',              // 정보
  
  // Gradient Colors
  gradientStart: '#5B5FEF',
  gradientEnd: '#8B5CF6',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  
  // Rich Editor Colors
  editorColors: {
    red: '#EF4444',
    orange: '#F97316',
    yellow: '#F59E0B',
    green: '#10B981',
    blue: '#3B82F6',
    purple: '#8B5CF6',
    pink: '#EC4899',
  },
  
  // Mood Colors (기분별 색상)
  moodColors: {
    happy: '#FCD34D',      // 😊 행복
    sad: '#60A5FA',        // 😢 슬픔
    angry: '#F87171',      // 😡 화남
    tired: '#A78BFA',      // 😴 피곤
    love: '#F472B6',       // 😍 사랑
    surprised: '#FBBF24',  // 😲 놀람
    calm: '#6EE7B7',       // 😌 평온
    excited: '#FB923C',    // 🤩 흥분
  },
  // 새로운 색상 시스템 (객체 형태) - 공통 뉴트럴 스케일 사용
  neutral: lightNeutralScale,
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
  },
} as const;

// 다크 모드 컬러
export const darkColors = {
  // Primary Colors
  primary: '#7C7FF5',
  primaryLight: '#9CA0F7',
  primaryDark: '#5B5FEF',
  
  // Secondary Colors
  secondary: '#A78BFA',
  accent: '#F472B6',
  
  // Background Colors
  background: '#0F172A',        // 다크 메인 배경
  backgroundAlt: '#1E293B',     // 다크 대체 배경
  surface: '#1E293B',           // 다크 카드/표면
  
  // Text Colors
  textPrimary: '#F1F5F9',       // 다크 주요 텍스트
  textSecondary: '#94A3B8',     // 다크 보조 텍스트
  textTertiary: '#64748B',      // 다크 3차 텍스트
  textDisabled: '#475569',      // 다크 비활성 텍스트
  
  // Border Colors
  border: '#334155',            // 다크 기본 테두리
  borderLight: '#1E293B',       // 다크 밝은 테두리
  borderDark: '#475569',        // 다크 어두운 테두리
  
  // Semantic Colors
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',
  
  // Gradient Colors
  gradientStart: '#7C7FF5',
  gradientEnd: '#A78BFA',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  
  // Rich Editor Colors
  editorColors: {
    red: '#F87171',
    orange: '#FB923C',
    yellow: '#FBBF24',
    green: '#34D399',
    blue: '#60A5FA',
    purple: '#A78BFA',
    pink: '#F472B6',
  },
  
  // Mood Colors (기분별 색상)
  moodColors: {
    happy: '#FCD34D',
    sad: '#60A5FA',
    angry: '#F87171',
    tired: '#A78BFA',
    love: '#F472B6',
    surprised: '#FBBF24',
    calm: '#6EE7B7',
    excited: '#FB923C',
  },
  // 새로운 색상 시스템 (객체 형태) - 2026 디자인 시스템, 다크모드, 공통 뉴트럴 스케일 사용
  neutral: darkNeutralScale,
  error: {
    50: '#B91C1C',
    100: '#DC2626',
    500: '#EF4444',
    600: '#F87171',
    700: '#FCA5A5',
  },
  danger: {
    50: '#B91C1C',
    100: '#DC2626',
    500: '#EF4444',
    600: '#F87171',
    700: '#FCA5A5',
    900: '#7F1D1D',
  },
  warning: {
    50: '#B45309',
    100: '#D97706',
    500: '#F59E0B',
    600: '#FBBF24',
    700: '#FDE047',
    800: '#FEF3C7',
  },
  success: {
    50: '#15803D',
    100: '#16A34A',
    500: '#22C55E',
    600: '#4ADE80',
    700: '#86EFAC',
  },
  info: {
    50: '#1D4ED8',
    100: '#2563EB',
    500: '#3B82F6',
    600: '#60A5FA',
    700: '#93C5FD',
  },
  primaryScale: {
    50: '#171717',
    100: '#262626',
    200: '#404040',
    300: '#525252',
    400: '#737373',
    500: '#9A9A9A',
    600: '#D0D0D0',
    700: '#E5E5E5',
    800: '#F5F5F5',
    900: '#FAFAFA',
  },
};

// Ocean 테마 (바다 - 청량한 블루)
export const oceanColors: ColorScheme = {
  primary: '#0EA5E9',
  primaryLight: '#38BDF8',
  primaryDark: '#0284C7',
  secondary: '#06B6D4',
  accent: '#14B8A6',
  background: '#F0F9FF',
  backgroundAlt: '#E0F2FE',
  surface: '#FFFFFF',
  textPrimary: '#0C4A6E',
  textSecondary: '#475569',
  textTertiary: '#64748B',
  textDisabled: '#CBD5E1',
  border: '#BAE6FD',
  borderLight: '#E0F2FE',
  borderDark: '#7DD3FC',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  gradientStart: '#0EA5E9',
  gradientEnd: '#06B6D4',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  editorColors: {
    red: '#EF4444',
    orange: '#F97316',
    yellow: '#F59E0B',
    green: '#10B981',
    blue: '#0EA5E9',
    purple: '#8B5CF6',
    pink: '#EC4899',
  },
  moodColors: {
    happy: '#FCD34D',
    sad: '#38BDF8',
    angry: '#F87171',
    tired: '#A78BFA',
    love: '#F472B6',
    surprised: '#FBBF24',
    calm: '#6EE7B7',
    excited: '#FB923C',
  },
  // 새로운 색상 시스템 (객체 형태) - 공통 뉴트럴 스케일 사용
  neutral: lightNeutralScale,
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
    50: '#E0F2FE',
    100: '#BAE6FD',
    200: '#7DD3FC',
    300: '#38BDF8',
    400: '#0EA5E9',
    500: '#0284C7',
    600: '#0369A1',
    700: '#075985',
    800: '#0C4A6E',
    900: '#082F49',
  },
};

// Sunset 테마 (일몰 - 따뜻한 오렌지/핑크)
export const sunsetColors: ColorScheme = {
  primary: '#F97316',
  primaryLight: '#FB923C',
  primaryDark: '#EA580C',
  secondary: '#EC4899',
  accent: '#F43F5E',
  background: '#FFF7ED',
  backgroundAlt: '#FFEDD5',
  surface: '#FFFFFF',
  textPrimary: '#7C2D12',
  textSecondary: '#78350F',
  textTertiary: '#92400E',
  textDisabled: '#FED7AA',
  border: '#FED7AA',
  borderLight: '#FFEDD5',
  borderDark: '#FDBA74',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  gradientStart: '#F97316',
  gradientEnd: '#EC4899',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  editorColors: {
    red: '#EF4444',
    orange: '#F97316',
    yellow: '#F59E0B',
    green: '#10B981',
    blue: '#3B82F6',
    purple: '#8B5CF6',
    pink: '#EC4899',
  },
  moodColors: {
    happy: '#FCD34D',
    sad: '#60A5FA',
    angry: '#F87171',
    tired: '#A78BFA',
    love: '#F472B6',
    surprised: '#FBBF24',
    calm: '#6EE7B7',
    excited: '#FB923C',
  },
  // 새로운 색상 시스템 (객체 형태) - 공통 뉴트럴 스케일 사용
  neutral: lightNeutralScale,
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
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316',
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },
};

// Forest 테마 (숲 - 자연스러운 그린)
export const forestColors: ColorScheme = {
  primary: '#10B981',
  primaryLight: '#34D399',
  primaryDark: '#059669',
  secondary: '#14B8A6',
  accent: '#84CC16',
  background: '#F0FDF4',
  backgroundAlt: '#DCFCE7',
  surface: '#FFFFFF',
  textPrimary: '#064E3B',
  textSecondary: '#065F46',
  textTertiary: '#047857',
  textDisabled: '#BBF7D0',
  border: '#BBF7D0',
  borderLight: '#DCFCE7',
  borderDark: '#86EFAC',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  gradientStart: '#10B981',
  gradientEnd: '#14B8A6',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  editorColors: {
    red: '#EF4444',
    orange: '#F97316',
    yellow: '#F59E0B',
    green: '#10B981',
    blue: '#3B82F6',
    purple: '#8B5CF6',
    pink: '#EC4899',
  },
  moodColors: {
    happy: '#FCD34D',
    sad: '#60A5FA',
    angry: '#F87171',
    tired: '#A78BFA',
    love: '#F472B6',
    surprised: '#FBBF24',
    calm: '#6EE7B7',
    excited: '#FB923C',
  },
  // 새로운 색상 시스템 (객체 형태) - 공통 뉴트럴 스케일 사용
  neutral: lightNeutralScale,
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
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
};

// Purple Dream 테마 (몽환적인 보라)
export const purpleColors: ColorScheme = {
  primary: '#A855F7',
  primaryLight: '#C084FC',
  primaryDark: '#9333EA',
  secondary: '#EC4899',
  accent: '#F472B6',
  background: '#FAF5FF',
  backgroundAlt: '#F3E8FF',
  surface: '#FFFFFF',
  textPrimary: '#581C87',
  textSecondary: '#6B21A8',
  textTertiary: '#7E22CE',
  textDisabled: '#E9D5FF',
  border: '#E9D5FF',
  borderLight: '#F3E8FF',
  borderDark: '#D8B4FE',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  gradientStart: '#A855F7',
  gradientEnd: '#EC4899',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  editorColors: {
    red: '#EF4444',
    orange: '#F97316',
    yellow: '#F59E0B',
    green: '#10B981',
    blue: '#3B82F6',
    purple: '#A855F7',
    pink: '#EC4899',
  },
  moodColors: {
    happy: '#FCD34D',
    sad: '#60A5FA',
    angry: '#F87171',
    tired: '#A78BFA',
    love: '#F472B6',
    surprised: '#FBBF24',
    calm: '#6EE7B7',
    excited: '#FB923C',
  },
  // 새로운 색상 시스템 (객체 형태) - 공통 뉴트럴 스케일 사용
  neutral: lightNeutralScale,
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
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7',
    600: '#9333EA',
    700: '#7E22CE',
    800: '#6B21A8',
    900: '#581C87',
  },
};

// Tinder 테마 (카드 스와이프 스타일) - 2026 디자인 시스템 적용
export const tinderColors: ColorScheme = {
  // Primary Colors (뉴트럴 기반 - 기본 UI용)
  primary: '#404040',           // 뉴트럴 700 - 기본 버튼/링크
  primaryLight: '#525252',      // 뉴트럴 600
  primaryDark: '#262626',       // 뉴트럴 800
  
  // Secondary Colors (뉴트럴 기반)
  secondary: '#737373',         // 뉴트럴 500 - 보조 요소
  accent: '#FD5068',            // 브랜드 컬러 (핑크) - 강조용으로만 사용 (좋아요 등)
  
  // Background Colors (뉴트럴 기반)
  background: '#FAFAFA',        // 뉴트럴 50 - 밝은 배경
  backgroundAlt: '#F5F5F5',     // 뉴트럴 100 - 대체 배경
  surface: '#FFFFFF',           // 뉴트럴 0 - 순백 카드
  textPrimary: '#404040',       // 뉴트럴 700 - 주요 텍스트 (고대비 지양)
  textSecondary: '#737373',     // 뉴트럴 500 - 보조 텍스트
  textTertiary: '#9A9A9A',      // 뉴트럴 400 - 3차 텍스트
  textDisabled: '#D0D0D0',      // 뉴트럴 300 - 비활성 텍스트
  border: '#E8E8E8',            // 뉴트럴 200 - 기본 테두리 (매우 얕음)
  borderLight: '#F5F5F5',       // 뉴트럴 100 - 밝은 테두리
  borderDark: '#D0D0D0',        // 뉴트럴 300 - 어두운 테두리
  success: '#21D07C',           // Like = 성공 (accent로 사용)
  warning: '#FCBF49',           // 골드 경고
  error: '#E94E4E',             // Dislike = 에러 (accent로 사용)
  info: '#00B8E6',              // SuperLike 블루
  gradientStart: '#FD5068',     // 핑크 시작
  gradientEnd: '#FF6A7F',       // 핑크 끝
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  editorColors: {
    red: '#E94E4E',
    orange: '#FF6A7F',
    yellow: '#FCBF49',
    green: '#21D07C',
    blue: '#00B8E6',
    purple: '#A855F7',
    pink: '#FD5068',
  },
  moodColors: {
    happy: '#FCBF49',      // 골드
    sad: '#00B8E6',        // 블루
    angry: '#E94E4E',      // 레드
    tired: '#C7C7CC',      // 회색
    love: '#FD5068',       // 핑크
    surprised: '#FF6A7F',  // 밝은 핑크
    calm: '#21D07C',       // 그린
    excited: '#FCBF49',    // 골드
  },
  // 새로운 색상 시스템 (객체 형태) - 공통 뉴트럴 스케일 사용
  neutral: lightNeutralScale,
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    500: '#E94E4E',
    600: '#DC2626',
    700: '#B91C1C',
  },
  danger: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    500: '#E94E4E',
    600: '#DC2626',
    700: '#B91C1C',
    900: '#7F1D1D',
  },
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    500: '#FCBF49',
    600: '#F59E0B',
    700: '#D97706',
    800: '#B45309',
  },
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    500: '#21D07C',
    600: '#16A34A',
    700: '#15803D',
  },
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    500: '#00B8E6',
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

// 모든 테마 export
export const themes = {
  light: lightColors,
  dark: darkColors,
  ocean: oceanColors,
  sunset: sunsetColors,
  forest: forestColors,
  purple: purpleColors,
  tinder: tinderColors,
} as const;

export type ThemeName = keyof typeof themes;

// 기본 export (라이트 모드)
export const colors = lightColors;

export type ColorKey = keyof typeof colors;

// ============================================
// 프리미엄 디자인 시스템 (Premium Design System)
// ============================================// 섀도우 시스템 (고급스러운 깊이감)
export const shadows = {
  // === 프리미엄 그림자 (초미세, 고급스러운 깊이감) ===
  premium: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,  // 초미세 3%
      shadowRadius: 12,
      elevation: 2,
    },
    cardHover: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,  // 호버 시 6%
      shadowRadius: 20,
      elevation: 4,
    },
    fab: {
      shadowColor: '#EC4899',  // 브랜드 컬러 글로우
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 10,
    },
    subtle: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.02,  // 거의 보이지 않는 미세한 그림자
      shadowRadius: 8,
      elevation: 1,
    },
    stat: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 10,
      elevation: 2,
    },
  },
  // === 레거시 키 (하위 호환성) ===
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  primary: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  // === 단축 키 (루트 레벨) ===
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  // === 모던 키 (라이트/다크 모드) ===
  // 라이트 모드 섀도우
  light: {
    none: 'none',
    xs: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 2,
      elevation: 1,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 12,
    },
    '2xl': {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.18,
      shadowRadius: 32,
      elevation: 16,
    },
    // 프리미엄 컬러 섀도우
    glow: {
      shadowColor: '#EC4899',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 8,
    },
    soft: {
      shadowColor: '#6366F1',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 10,
    },
  },
  // 다크 모드 섀도우 (더 강한 깊이감)
  dark: {
    none: 'none',
    xs: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 1,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.4,
      shadowRadius: 24,
      elevation: 12,
    },
    '2xl': {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.45,
      shadowRadius: 32,
      elevation: 16,
    },
    glow: {
      shadowColor: '#F472B6',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 8,
    },
    soft: {
      shadowColor: '#7C7FF5',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
    },
  },
} as const;

// 프리미엄 그라디언트 시스템
export const gradients = {
  // 라이트 모드 그라디언트
  light: {
    primary: ['#6366F1', '#8B5CF6'],
    secondary: ['#EC4899', '#F472B6'],
    accent: ['#F97316', '#FBBF24'],
    success: ['#10B981', '#34D399'],
    premium: ['#6366F1', '#EC4899', '#F97316'],
    glass: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)'],
    subtle: ['rgba(99,102,241,0.05)', 'rgba(139,92,246,0.05)'],
    card: ['#FFFFFF', '#FAFAFA'],
    shimmer: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0)'],
  },
  // 다크 모드 그라디언트
  dark: {
    primary: ['#7C7FF5', '#A78BFA'],
    secondary: ['#F472B6', '#FB7185'],
    accent: ['#FB923C', '#FBBF24'],
    success: ['#34D399', '#6EE7B7'],
    premium: ['#7C7FF5', '#F472B6', '#FB923C'],
    glass: ['rgba(30,41,59,0.9)', 'rgba(30,41,59,0.7)'],
    subtle: ['rgba(124,127,245,0.1)', 'rgba(167,139,250,0.1)'],
    card: ['#1E293B', '#1A2332'],
    shimmer: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0)'],
  },
} as const;

// 글래스모피즘 스타일
export const glassmorphism = {
  light: {
    background: 'rgba(255, 255, 255, 0.75)',
    blur: 12,
    border: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
  },
  dark: {
    background: 'rgba(30, 41, 59, 0.75)',
    blur: 12,
    border: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  },
  frosted: {
    background: 'rgba(255, 255, 255, 0.65)',
    blur: 20,
    border: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
  },
  subtle: {
    background: 'rgba(255, 255, 255, 0.5)',
    blur: 8,
    border: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 0.5,
  },
} as const;

// NOTE: borderRadius, spacing은 spacing.ts에서 관리
// 여기서는 colors, shadows, gradients, glassmorphism, opacity만 관리// 프리미엄 투명도 시스템
export const opacity = {
  0: 0,
  5: 0.05,
  10: 0.1,
  20: 0.2,
  25: 0.25,
  30: 0.3,
  40: 0.4,
  50: 0.5,
  60: 0.6,
  70: 0.7,
  75: 0.75,
  80: 0.8,
  90: 0.9,
  95: 0.95,
  100: 1,
} as const;export type ShadowKey = keyof typeof shadows.light;
export type GradientKey = keyof typeof gradients.light;
// NOTE: BorderRadiusKey, SpacingKey는 spacing.ts에서 export됨