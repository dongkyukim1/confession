/**
 * FontContext - 앱 전체 폰트 관리
 *
 * 사용자가 선택한 폰트를 저장하고 앱 전체에서 사용할 수 있도록 관리
 */
import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';

export type FontFamily =
  | 'system'
  | 'bookkGothic'
  | 'bookkMyungjo'
  | 'hakgyoansim'
  | 'paperlogyRegular'
  | 'paperlogyMedium'
  | 'paperlogyBold'
  | 'paperlogyBlack';

export interface FontOption {
  id: FontFamily;
  name: string;
  displayName: string;
  category: 'handwriting' | 'serif' | 'sans-serif' | 'system';
  description: string;
  // React Native font family names (with fallbacks)
  fontFamily: string;
  fontFamilyBold?: string;
  previewText: string;
}

// Font definitions with system fallbacks
export const FONT_OPTIONS: Record<FontFamily, FontOption> = {
  system: {
    id: 'system',
    name: 'System',
    displayName: '시스템 기본',
    category: 'system',
    description: '깔끔하고 읽기 편한 기본 폰트',
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }) as string,
    previewText: '오늘 하루는 어땠나요? 일기를 써보세요.',
  },
  // 한글 폰트
  bookkGothic: {
    id: 'bookkGothic',
    name: 'Bookk Gothic',
    displayName: '북크 고딕',
    category: 'sans-serif',
    description: '깔끔하고 모던한 한글 고딕체',
    fontFamily: 'BookkGothic_Light',
    fontFamilyBold: 'BookkGothic_Bold',
    previewText: '오늘 하루는 어땠나요? 일기를 써보세요.',
  },
  bookkMyungjo: {
    id: 'bookkMyungjo',
    name: 'Bookk Myungjo',
    displayName: '북크 명조',
    category: 'serif',
    description: '우아하고 전통적인 한글 명조체',
    fontFamily: 'BookkMyungjo_Light',
    fontFamilyBold: 'BookkMyungjo_Bold',
    previewText: '오늘 하루는 어땠나요? 일기를 써보세요.',
  },
  hakgyoansim: {
    id: 'hakgyoansim',
    name: 'Hakgyoansim Boardmarker',
    displayName: '학교안심 보드마커',
    category: 'handwriting',
    description: '친근하고 자연스러운 손글씨',
    fontFamily: 'Hakgyoansim_BoardmarkerR',
    previewText: '오늘 하루는 어땠나요? 일기를 써보세요.',
  },
  paperlogyRegular: {
    id: 'paperlogyRegular',
    name: 'Paperlogy Regular',
    displayName: '페이퍼로지 레귤러',
    category: 'sans-serif',
    description: '부드럽고 읽기 편한 산세리프',
    fontFamily: 'Paperlogy-4Regular',
    previewText: '오늘 하루는 어땠나요? 일기를 써보세요.',
  },
  paperlogyMedium: {
    id: 'paperlogyMedium',
    name: 'Paperlogy Medium',
    displayName: '페이퍼로지 미디엄',
    category: 'sans-serif',
    description: '적당한 굵기의 균형잡힌 산세리프',
    fontFamily: 'Paperlogy-5Medium',
    previewText: '오늘 하루는 어땠나요? 일기를 써보세요.',
  },
  paperlogyBold: {
    id: 'paperlogyBold',
    name: 'Paperlogy Bold',
    displayName: '페이퍼로지 볼드',
    category: 'sans-serif',
    description: '강렬하고 명확한 산세리프',
    fontFamily: 'Paperlogy-7Bold',
    previewText: '오늘 하루는 어땠나요? 일기를 써보세요.',
  },
  paperlogyBlack: {
    id: 'paperlogyBlack',
    name: 'Paperlogy Black',
    displayName: '페이퍼로지 블랙',
    category: 'sans-serif',
    description: '매우 굵고 임팩트있는 산세리프',
    fontFamily: 'Paperlogy-9Black',
    previewText: '오늘 하루는 어땠나요? 일기를 써보세요.',
  },
};

interface FontContextValue {
  selectedFont: FontFamily;
  fontOption: FontOption;
  setSelectedFont: (font: FontFamily) => Promise<void>;
  getFontFamily: (bold?: boolean) => string;
}

const FontContext = createContext<FontContextValue | undefined>(undefined);

const FONT_STORAGE_KEY = '@confession_app:selected_font';

export function FontProvider({children}: {children: ReactNode}) {
  const [selectedFont, setSelectedFontState] = useState<FontFamily>('system');

  // Load saved font on mount
  useEffect(() => {
    loadSavedFont();
  }, []);

  const loadSavedFont = async () => {
    try {
      const saved = await AsyncStorage.getItem(FONT_STORAGE_KEY);
      if (saved && saved in FONT_OPTIONS) {
        setSelectedFontState(saved as FontFamily);
      }
    } catch (error) {
      console.error('Failed to load font preference:', error);
    }
  };

  const setSelectedFont = async (font: FontFamily) => {
    try {
      await AsyncStorage.setItem(FONT_STORAGE_KEY, font);
      setSelectedFontState(font);
    } catch (error) {
      console.error('Failed to save font preference:', error);
    }
  };

  const fontOption = FONT_OPTIONS[selectedFont];

  const getFontFamily = (bold?: boolean) => {
    if (bold && fontOption.fontFamilyBold) {
      return fontOption.fontFamilyBold;
    }
    return fontOption.fontFamily;
  };

  return (
    <FontContext.Provider
      value={{
        selectedFont,
        fontOption,
        setSelectedFont,
        getFontFamily,
      }}>
      {children}
    </FontContext.Provider>
  );
}

export function useFont() {
  const context = useContext(FontContext);
  if (!context) {
    throw new Error('useFont must be used within FontProvider');
  }
  return context;
}

// Helper function to get font styles for text components
export function useFontStyles() {
  const {getFontFamily} = useFont();

  return {
    regular: {fontFamily: getFontFamily(false)},
    bold: {fontFamily: getFontFamily(true)},
  };
}
