/**
 * 앱 전체 컬러 시스템
 * 
 * 미니멀하고 고급스러운 디자인을 위한 컬러 팔레트
 * 화이트/그레이 베이스 + 세련된 블루-퍼플 포인트 컬러
 */

// 라이트 모드 컬러
export const lightColors = {
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
} as const;

// 기본 export (라이트 모드)
export const colors = lightColors;

export type ColorKey = keyof typeof colors;

