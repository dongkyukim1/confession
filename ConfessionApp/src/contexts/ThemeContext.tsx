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
  const colors = themes[currentThemeName];

  return (
    <ThemeContext.Provider 
      value={{themeMode, isDark, setThemeMode, colors, currentThemeName}}>
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




