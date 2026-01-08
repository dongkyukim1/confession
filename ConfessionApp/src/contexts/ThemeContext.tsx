/**
 * 테마 컨텍스트
 * 
 * 다양한 테마 모드 지원 (Light, Dark, Ocean, Sunset, Forest, Purple Dream)
 */
import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {Appearance, ColorSchemeName} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {themes, ThemeName, ColorScheme} from '../theme/colors';

type ThemeMode = ThemeName | 'auto';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  colors: ColorScheme;
  currentThemeName: ThemeName;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@theme_mode';

export function ThemeProvider({children}: {children: ReactNode}) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme(),
  );

  // 시스템 테마 변경 감지
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({colorScheme}) => {
      setSystemColorScheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  // 저장된 테마 모드 불러오기
  useEffect(() => {
    loadThemeMode();
  }, []);

  const loadThemeMode = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved) {
        setThemeModeState(saved as ThemeMode);
      }
    } catch (error) {
      console.error('테마 모드 불러오기 오류:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('테마 모드 저장 오류:', error);
    }
  };

  // 현재 테마 이름 계산
  let currentThemeName: ThemeName;
  if (themeMode === 'auto') {
    currentThemeName = systemColorScheme === 'dark' ? 'dark' : 'light';
  } else {
    currentThemeName = themeMode;
  }

  // 실제 다크 모드 여부 계산
  const isDark = currentThemeName === 'dark';

  // 테마에 따른 동적 색상 선택
  const colors = themes[currentThemeName] || themes.light;

  // colors가 제대로 된 ColorScheme 객체인지 확인 (안전성 보장)
  const safeColors: ColorScheme = {
    ...colors,
    // 새로운 색상 시스템이 없으면 기본값 제공
    neutral: colors.neutral || {
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
    },
    error: colors.error || {
      50: '#FEF2F2',
      100: '#FEE2E2',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
    },
    danger: colors.danger || colors.error || {
      50: '#FEF2F2',
      100: '#FEE2E2',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
      900: '#7F1D1D',
    },
    warning: colors.warning || {
      50: '#FFFBEB',
      100: '#FEF3C7',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
    },
    success: colors.success || {
      50: '#F0FDF4',
      100: '#DCFCE7',
      500: '#22C55E',
      600: '#16A34A',
      700: '#15803D',
    },
    info: colors.info || {
      50: '#EFF6FF',
      100: '#DBEAFE',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
    },
    primaryScale: colors.primaryScale || {
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
  };

  return (
    <ThemeContext.Provider 
      value={{themeMode, isDark, setThemeMode, colors: safeColors, currentThemeName}}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}




