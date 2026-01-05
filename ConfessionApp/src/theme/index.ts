/**
 * 테마 시스템 통합 Export
 * 
 * 모든 디자인 토큰을 한 곳에서 import 가능
 */

export * from './colors';
export * from './typography';
export * from './shadows';
export * from './spacing';

import {colors, lightColors, darkColors} from './colors';
import {typography} from './typography';
import {shadows} from './shadows';
import {spacing, borderRadius, iconSize} from './spacing';

/**
 * 전체 테마 객체
 */
export const theme = {
  colors,
  typography,
  shadows,
  spacing,
  borderRadius,
  iconSize,
} as const;

/**
 * 테마 생성 함수
 */
export const getTheme = (isDark: boolean) => ({
  colors: isDark ? darkColors : lightColors,
  typography,
  shadows,
  spacing,
  borderRadius,
  iconSize,
});

export default theme;
