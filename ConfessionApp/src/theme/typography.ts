/**
 * 타이포그래피 시스템
 * 
 * 2026 디자인 시스템 기반: 읽기 경험 중심
 * - 자간/행간 넉넉하게 (종이책 수준의 가독성)
 * - Bold 사용 최소화 (크기 변화로만 위계 표현)
 * - 숫자/카운터는 시각적 우선순위에서 제외
 */

export const typography = {
  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 34,
    '5xl': 40,
  },
  
  // Font Weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  // Line Heights (읽기 경험 중심 - 종이책 수준)
  lineHeight: {
    tight: 1.3,        // 제목용 (최소)
    normal: 1.6,      // 기본 본문 (기존 1.5에서 증가)
    relaxed: 1.8,     // 편안한 읽기 (기존 1.75에서 증가)
    loose: 2.0,       // 매우 넉넉한 읽기 (새로 추가)
  },
  
  // Letter Spacing (읽기 경험 중심)
  letterSpacing: {
    tight: -0.3,      // 제목용 (기존 -0.5에서 완화)
    normal: 0.3,      // 기본 (기존 0에서 증가)
    wide: 0.6,        // 넓은 간격 (기존 0.5에서 증가)
    wider: 1.2,       // 매우 넓은 간격 (기존 1에서 증가)
  },
  
  // Text Styles (미리 정의된 스타일) - 2026 디자인 시스템
  styles: {
    largeTitle: {
      fontSize: 34,
      fontWeight: '400' as const,  // Bold 최소화
      lineHeight: 40 * 1.6,        // 행간 증가
      letterSpacing: 0.3,          // 자간 증가
    },
    title: {
      fontSize: 28,
      fontWeight: '400' as const,   // Bold 최소화
      lineHeight: 34 * 1.6,        // 행간 증가
      letterSpacing: 0.3,          // 자간 증가
    },
    headline: {
      fontSize: 20,
      fontWeight: '400' as const,   // Bold 최소화 (기존 600에서 변경)
      lineHeight: 28 * 1.6,        // 행간 증가
      letterSpacing: 0.3,          // 자간 증가
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24 * 1.8,        // 행간 증가 (relaxed)
      letterSpacing: 0.3,          // 자간 증가
    },
    bodyBold: {
      fontSize: 16,
      fontWeight: '500' as const,   // Bold 대신 medium 사용
      lineHeight: 24 * 1.8,        // 행간 증가
      letterSpacing: 0.3,          // 자간 증가
    },
    caption: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20 * 1.8,        // 행간 증가
      letterSpacing: 0.3,          // 자간 증가
    },
    captionBold: {
      fontSize: 14,
      fontWeight: '500' as const,   // Bold 대신 medium 사용
      lineHeight: 20 * 1.8,        // 행간 증가
      letterSpacing: 0.3,          // 자간 증가
    },
    small: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16 * 1.6,        // 행간 증가
      letterSpacing: 0.3,          // 자간 증가
    },
  },
  
  // Available Fonts (리치 에디터용)
  fonts: {
    default: 'System',
    serif: 'Georgia',
    mono: 'Courier',
    playful: 'Comic Sans MS',
  },
} as const;

export type TypographyStyleKey = keyof typeof typography.styles;






