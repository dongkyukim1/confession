/**
 * 앱 전체 컬러 시스템
 * 
 * 미니멀하고 고급스러운 디자인을 위한 컬러 팔레트
 * 다양한 테마 지원 (Light, Dark, Ocean, Sunset, Forest, Purple Dream)
 */

// 공통 타입 정의
export type ColorScheme = {
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
};

// 라이트 모드 컬러
export const lightColors: ColorScheme = {
  // Primary Colors
  primary: '#5B5FEF',           // 메인 포인트 컬러 (세련된 블루)
  primaryLight: '#7C7FF5',      // 밝은 버전
  primaryDark: '#4346D9',       // 어두운 버전
  
  // Secondary Colors
  secondary: '#8B5CF6',         // 보조 컬러 (퍼플)
  accent: '#EC4899',            // 악센트 컬러 (핑크)
  
  // Background Colors
  background: '#FAFBFC',        // 메인 배경
  backgroundAlt: '#F3F4F6',     // 대체 배경
  surface: '#FFFFFF',           // 카드/표면
  
  // Text Colors
  textPrimary: '#1A1A1A',       // 주요 텍스트
  textSecondary: '#6B7280',     // 보조 텍스트
  textTertiary: '#9CA3AF',      // 3차 텍스트
  textDisabled: '#D1D5DB',      // 비활성 텍스트
  
  // Border Colors
  border: '#E5E7EB',            // 기본 테두리
  borderLight: '#F3F4F6',       // 밝은 테두리
  borderDark: '#D1D5DB',        // 어두운 테두리
  
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
};

// 모든 테마 export
export const themes = {
  light: lightColors,
  dark: darkColors,
  ocean: oceanColors,
  sunset: sunsetColors,
  forest: forestColors,
  purple: purpleColors,
} as const;

export type ThemeName = keyof typeof themes;

// 기본 export (라이트 모드)
export const colors = lightColors;

export type ColorKey = keyof typeof colors;

