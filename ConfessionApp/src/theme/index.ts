/**
 * 테마 시스템 통합 Export
 *
 * 프리미엄 디자인 시스템 - 모든 디자인 토큰을 한 곳에서 import 가능
 */

// 기존 exports
export * from './colors';
export * from './typography';
export * from './animations';

// Spacing/BorderRadius/IconSize는 spacing.ts에서 가져옴
export {spacing, borderRadius, iconSize} from './spacing';
export type {SpacingKey, BorderRadiusKey, IconSizeKey} from './spacing';

// Shadows는 shadows.ts에서 가져옴 (레거시 + 모던)
export {
  shadows as shadowsFromFile,
  shadowsLight,
  shadowsDark,
  legacyShadows,
} from './shadows';
export type {ShadowKey, LegacyShadowKey} from './shadows';

// 새로운 프리미엄 시스템 (colors.ts에서 가져옴)
import {
  colors,
  lightColors,
  darkColors,
  themes,
  shadows,
  gradients,
  glassmorphism,
  opacity,
} from './colors';
import {typography} from './typography';
import {animations} from './animations';
import {spacing, borderRadius, iconSize} from './spacing';

// Re-export premium systems
export {
  shadows,
  gradients,
  glassmorphism,
  opacity,
};

/**
 * 전체 테마 객체
 */
export const theme = {
  colors,
  typography,
  shadows,
  gradients,
  glassmorphism,
  spacing,
  borderRadius,
  opacity,
  iconSize,
  animations,
} as const;

/**
 * 테마 생성 함수 (다크모드 지원)
 */
export const getTheme = (isDark: boolean) => ({
  colors: isDark ? darkColors : lightColors,
  typography,
  shadows: isDark ? shadows.dark : shadows.light,
  gradients: isDark ? gradients.dark : gradients.light,
  glassmorphism: isDark ? glassmorphism.dark : glassmorphism.light,
  spacing,
  borderRadius,
  opacity,
  iconSize,
  animations,
});

/**
 * 테마 이름으로 색상 가져오기
 */
export const getThemeColors = (themeName: keyof typeof themes) => themes[themeName];

export default theme;
