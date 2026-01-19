/**
 * i18n 국제화 설정
 *
 * 설치 필요: npm install i18next react-i18next
 */
import {I18n} from 'i18next';
import {getLocales} from 'react-native-localize';

// i18next가 설치되어 있는지 확인
let i18n: I18n | null = null;
let initReactI18next: any = null;

try {
  i18n = require('i18next').default;
  initReactI18next = require('react-i18next').initReactI18next;
} catch {
  console.log('[i18n] i18next not installed, using fallback');
}

// 번역 리소스 로드
import koCommon from './locales/ko/common.json';
import koScreens from './locales/ko/screens.json';
import koErrors from './locales/ko/errors.json';

import enCommon from './locales/en/common.json';
import enScreens from './locales/en/screens.json';
import enErrors from './locales/en/errors.json';

// =====================================================
// 리소스 정의
// =====================================================

export const resources = {
  ko: {
    common: koCommon,
    screens: koScreens,
    errors: koErrors,
  },
  en: {
    common: enCommon,
    screens: enScreens,
    errors: enErrors,
  },
};

export type SupportedLanguage = keyof typeof resources;
export const supportedLanguages: SupportedLanguage[] = ['ko', 'en'];
export const defaultLanguage: SupportedLanguage = 'ko';

// =====================================================
// 기기 언어 감지
// =====================================================

export function getDeviceLanguage(): SupportedLanguage {
  try {
    const locales = getLocales();
    const languageCode = locales[0]?.languageCode || 'ko';

    if (supportedLanguages.includes(languageCode as SupportedLanguage)) {
      return languageCode as SupportedLanguage;
    }

    return defaultLanguage;
  } catch {
    return defaultLanguage;
  }
}

// =====================================================
// i18n 초기화
// =====================================================

export async function initI18n(): Promise<void> {
  if (!i18n) {
    console.log('[i18n] Skipping initialization (i18next not installed)');
    return;
  }

  const deviceLanguage = getDeviceLanguage();

  await i18n.use(initReactI18next).init({
    resources,
    lng: deviceLanguage,
    fallbackLng: defaultLanguage,
    defaultNS: 'common',
    ns: ['common', 'screens', 'errors'],

    interpolation: {
      escapeValue: false, // React에서는 XSS 방지가 기본 적용됨
    },

    react: {
      useSuspense: false, // React Native에서는 Suspense 비활성화
    },

    // 디버그 모드 (개발환경에서만)
    debug: __DEV__,
  });

  console.log(`[i18n] Initialized with language: ${deviceLanguage}`);
}

// =====================================================
// 언어 변경
// =====================================================

export async function changeLanguage(language: SupportedLanguage): Promise<void> {
  if (!i18n) {
    console.log('[i18n] Cannot change language (i18next not installed)');
    return;
  }

  await i18n.changeLanguage(language);
  console.log(`[i18n] Language changed to: ${language}`);
}

// =====================================================
// 현재 언어 가져오기
// =====================================================

export function getCurrentLanguage(): SupportedLanguage {
  if (!i18n) {
    return defaultLanguage;
  }
  return (i18n.language as SupportedLanguage) || defaultLanguage;
}

// =====================================================
// 번역 함수 (Fallback)
// =====================================================

type TranslationKey = string;

export function t(key: TranslationKey, options?: Record<string, any>): string {
  if (i18n) {
    return i18n.t(key, options) as string;
  }

  // Fallback: 한국어 리소스에서 직접 가져오기
  const [namespace, ...keyParts] = key.split(':');
  const actualKey = keyParts.join(':') || namespace;
  const ns = keyParts.length > 0 ? namespace : 'common';

  const resource = resources.ko[ns as keyof typeof resources.ko];
  if (!resource) {
    return key;
  }

  // 중첩 키 처리 (예: "home.title")
  const value = actualKey.split('.').reduce((obj: any, k) => obj?.[k], resource);

  if (typeof value === 'string') {
    // 간단한 interpolation
    if (options) {
      return value.replace(/\{\{(\w+)\}\}/g, (_, k) => options[k] ?? '');
    }
    return value;
  }

  return key;
}

// =====================================================
// Export i18n instance
// =====================================================

export {i18n};
export default i18n;
