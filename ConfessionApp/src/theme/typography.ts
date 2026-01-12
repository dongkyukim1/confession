/**
 * 타이포그래피 시스템
 *
 * 2026 프리미엄 디자인 시스템 기반: 읽기 경험 중심
 * - 자간/행간 넉넉하게 (종이책 수준의 가독성)
 * - Bold 사용 최소화 (크기 변화로만 위계 표현)
 * - 숫자/카운터는 시각적 우선순위에서 제외
 * - 프리미엄 스타일 추가 (그라디언트 텍스트, 고급 자간)
 */

export const typography = {
  // Font Sizes
  fontSize: {
    '2xs': 10,
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 34,
    '5xl': 40,
    '6xl': 48,
    '7xl': 56,
  },

  // Font Weights
  fontWeight: {
    thin: '100' as const,
    extralight: '200' as const,
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },

  // Line Heights (읽기 경험 중심 - 종이책 수준)
  lineHeight: {
    none: 1,
    tight: 1.25,       // 제목용 (최소)
    snug: 1.375,       // 밀접한 텍스트
    normal: 1.5,       // 기본 본문
    relaxed: 1.625,    // 편안한 읽기
    loose: 2.0,        // 매우 넉넉한 읽기
  },

  // Letter Spacing (프리미엄 시스템 - 크기별 최적화)
  letterSpacing: {
    tighter: -0.8,     // 대형 제목용 (밀도 높게)
    tight: -0.4,       // 제목용
    normal: 0,         // 기본
    wide: 0.4,         // 넓은 간격
    wider: 0.8,        // 매우 넓은 간격
    widest: 1.6,       // 최대 간격 (캡션, 라벨용)
  },

  // Text Styles (미리 정의된 스타일) - 프리미엄 디자인 시스템
  styles: {
    // 대형 타이틀 (히어로 섹션용)
    hero: {
      fontSize: 48,
      fontWeight: '700' as const,
      lineHeight: 48 * 1.1,
      letterSpacing: -0.8,
    },
    // 디스플레이 타이틀
    display: {
      fontSize: 40,
      fontWeight: '600' as const,
      lineHeight: 40 * 1.2,
      letterSpacing: -0.6,
    },
    largeTitle: {
      fontSize: 34,
      fontWeight: '600' as const,
      lineHeight: 34 * 1.25,
      letterSpacing: -0.4,
    },
    title: {
      fontSize: 28,
      fontWeight: '600' as const,
      lineHeight: 28 * 1.3,
      letterSpacing: -0.3,
    },
    title2: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 24 * 1.35,
      letterSpacing: -0.2,
    },
    title3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 20 * 1.4,
      letterSpacing: -0.1,
    },
    headline: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 18 * 1.45,
      letterSpacing: 0,
    },
    subheadline: {
      fontSize: 16,
      fontWeight: '500' as const,
      lineHeight: 16 * 1.5,
      letterSpacing: 0.1,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 16 * 1.6,
      letterSpacing: 0.2,
    },
    bodyBold: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 16 * 1.6,
      letterSpacing: 0.2,
    },
    callout: {
      fontSize: 15,
      fontWeight: '400' as const,
      lineHeight: 15 * 1.55,
      letterSpacing: 0.15,
    },
    caption: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 14 * 1.5,
      letterSpacing: 0.3,
    },
    caption2: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 12 * 1.45,
      letterSpacing: 0.4,
    },
    captionBold: {
      fontSize: 14,
      fontWeight: '600' as const,
      lineHeight: 14 * 1.5,
      letterSpacing: 0.3,
    },
    small: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 12 * 1.5,
      letterSpacing: 0.4,
    },
    tiny: {
      fontSize: 10,
      fontWeight: '500' as const,
      lineHeight: 10 * 1.4,
      letterSpacing: 0.5,
    },
    // 특수 스타일
    label: {
      fontSize: 12,
      fontWeight: '600' as const,
      lineHeight: 12 * 1.35,
      letterSpacing: 0.8,
      textTransform: 'uppercase' as const,
    },
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 16 * 1.25,
      letterSpacing: 0.3,
    },
    buttonSmall: {
      fontSize: 14,
      fontWeight: '600' as const,
      lineHeight: 14 * 1.3,
      letterSpacing: 0.2,
    },
    buttonLarge: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 18 * 1.2,
      letterSpacing: 0.4,
    },
    // 숫자/통계용
    statNumber: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 32 * 1.1,
      letterSpacing: -0.5,
    },
    statNumberLarge: {
      fontSize: 48,
      fontWeight: '700' as const,
      lineHeight: 48 * 1.0,
      letterSpacing: -0.8,
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
export type FontSizeKey = keyof typeof typography.fontSize;
export type FontWeightKey = keyof typeof typography.fontWeight;

// 프리미엄 텍스트 스타일 헬퍼
export const getResponsiveSize = (baseSize: number, scale: number = 1) => ({
  small: Math.round(baseSize * 0.875 * scale),
  medium: Math.round(baseSize * scale),
  large: Math.round(baseSize * 1.125 * scale),
});

// 자간 자동 계산 (큰 텍스트일수록 더 타이트하게)
export const getOptimalLetterSpacing = (fontSize: number): number => {
  if (fontSize >= 40) return -0.8;
  if (fontSize >= 32) return -0.5;
  if (fontSize >= 24) return -0.3;
  if (fontSize >= 18) return -0.1;
  if (fontSize >= 14) return 0.2;
  return 0.4;
};






