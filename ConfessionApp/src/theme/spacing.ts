/**
 * 간격 시스템
 *
 * 일관된 여백과 패딩을 위한 spacing 가이드
 * 시맨틱 키(xs, sm, md...)와 숫자 키(0-24) 모두 지원
 */

export const spacing = {
  // 시맨틱 키
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  // 숫자 키 (Tailwind 스타일)
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
} as const;

// Border Radius
export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

// Icon Sizes
export const iconSize = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  '2xl': 48,
} as const;

export type SpacingKey = keyof typeof spacing;
export type BorderRadiusKey = keyof typeof borderRadius;
export type IconSizeKey = keyof typeof iconSize;

// 프리미엄 간격 토큰 (넉넉한 여백, 고급스러운 레이아웃)
export const premiumSpacing = {
  pageMargin: 24,      // 페이지 좌우 마진
  cardGap: 20,         // 카드 간 간격
  sectionGap: 40,      // 섹션 간 간격
  heroGap: 48,         // 히어로 섹션 간격
  cardPadding: 24,     // 카드 내부 패딩
  contentLineHeight: 28, // 콘텐츠 line-height
} as const;

export type PremiumSpacingKey = keyof typeof premiumSpacing;






