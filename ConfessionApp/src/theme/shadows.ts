/**
 * 그림자 시스템
 *
 * 2026 디자인 시스템: 라이트/다크 모드 지원
 * 레거시 키(small, medium, large)와 모던 키(xs, sm, md, lg) 모두 지원
 */

import {ViewStyle} from 'react-native';

// 레거시 그림자 시스템 (하위 호환성 유지)
export const legacyShadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  } as ViewStyle,

  medium: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  } as ViewStyle,

  large: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  } as ViewStyle,

  primary: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  } as ViewStyle,

  none: {
    shadowColor: 'transparent',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as ViewStyle,
} as const;

// 모던 그림자 시스템 - 라이트 모드
export const shadowsLight = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as ViewStyle,

  xs: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  } as ViewStyle,

  sm: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,

  md: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,

  lg: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  } as ViewStyle,

  xl: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  } as ViewStyle,

  '2xl': {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 16},
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 16,
  } as ViewStyle,

  glow: {
    shadowColor: '#EC4899',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  } as ViewStyle,

  soft: {
    shadowColor: '#6366F1',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  } as ViewStyle,
} as const;

// 모던 그림자 시스템 - 다크 모드 (더 강한 깊이감)
export const shadowsDark = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as ViewStyle,

  xs: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  } as ViewStyle,

  sm: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,

  md: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,

  lg: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  } as ViewStyle,

  xl: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  } as ViewStyle,

  '2xl': {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 16},
    shadowOpacity: 0.45,
    shadowRadius: 32,
    elevation: 16,
  } as ViewStyle,

  glow: {
    shadowColor: '#F472B6',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  } as ViewStyle,

  soft: {
    shadowColor: '#7C7FF5',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  } as ViewStyle,
} as const;

// 통합 그림자 객체 (라이트/다크 + 레거시)
export const shadows = {
  // 라이트/다크 모드 그림자
  light: shadowsLight,
  dark: shadowsDark,

  // 레거시 호환 (기본 라이트 기반)
  ...legacyShadows,
} as const;

export type ShadowKey = keyof typeof shadowsLight;
export type LegacyShadowKey = keyof typeof legacyShadows;
