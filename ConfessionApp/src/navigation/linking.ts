/**
 * Deep Linking Configuration
 *
 * 앱 딥링크 처리 설정
 * URL 스킴: confession://
 * 유니버설 링크: https://confession.app
 */
import {LinkingOptions} from '@react-navigation/native';
import {Linking} from 'react-native';
import {RootStackParamList} from '../types';

// =====================================================
// 딥링크 스킴
// =====================================================

export const DEEP_LINK_PREFIXES = [
  'confession://',
  'https://confession.app',
  'https://www.confession.app',
];

// =====================================================
// 네비게이션 링킹 설정
// =====================================================

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: DEEP_LINK_PREFIXES,

  // URL -> 화면 매핑
  config: {
    screens: {
      // 메인 탭
      MainTabs: {
        screens: {
          Home: 'home',
          Discover: 'discover',
          MyDiary: 'my-diary',
          ViewedDiary: 'viewed',
          Profile: 'profile',
        },
      },

      // 고백 상세 화면
      Reveal: {
        path: 'confession/:confessionId',
        parse: {
          confessionId: (confessionId: string) => confessionId,
        },
      },

      // 고백 작성 화면
      Write: 'write',

      // 온보딩
      Onboarding: 'onboarding',

      // 설정
      BackgroundSettings: 'settings/background',
    },
  },

  // 초기 URL 가져오기
  async getInitialURL() {
    // 앱이 딥링크로 열렸는지 확인
    const url = await Linking.getInitialURL();
    if (url) {
      console.log('[DeepLink] Initial URL:', url);
    }
    return url;
  },

  // URL 변경 구독
  subscribe(listener) {
    const subscription = Linking.addEventListener('url', ({url}) => {
      console.log('[DeepLink] URL changed:', url);
      listener(url);
    });

    return () => {
      subscription.remove();
    };
  },
};

// =====================================================
// 딥링크 URL 생성 헬퍼
// =====================================================

export function createConfessionUrl(confessionId: string): string {
  return `confession://confession/${confessionId}`;
}

export function createShareableUrl(confessionId: string): string {
  return `https://confession.app/confession/${confessionId}`;
}

export function createHomeUrl(): string {
  return 'confession://home';
}

export function createWriteUrl(): string {
  return 'confession://write';
}

// =====================================================
// URL 파싱 헬퍼
// =====================================================

interface ParsedDeepLink {
  type: 'confession' | 'home' | 'write' | 'profile' | 'unknown';
  params?: Record<string, string>;
}

export function parseDeepLink(url: string): ParsedDeepLink {
  try {
    // URL에서 스킴 제거
    let path = url;
    for (const prefix of DEEP_LINK_PREFIXES) {
      if (url.startsWith(prefix)) {
        path = url.replace(prefix, '');
        break;
      }
    }

    // 경로 파싱
    const segments = path.split('/').filter(Boolean);

    if (segments[0] === 'confession' && segments[1]) {
      return {
        type: 'confession',
        params: {confessionId: segments[1]},
      };
    }

    if (segments[0] === 'home' || path === '' || path === '/') {
      return {type: 'home'};
    }

    if (segments[0] === 'write') {
      return {type: 'write'};
    }

    if (segments[0] === 'profile') {
      return {type: 'profile'};
    }

    return {type: 'unknown'};
  } catch {
    return {type: 'unknown'};
  }
}

// =====================================================
// 딥링크 핸들링
// =====================================================

type DeepLinkHandler = (parsed: ParsedDeepLink) => void;

let deepLinkHandler: DeepLinkHandler | null = null;

export function setDeepLinkHandler(handler: DeepLinkHandler): void {
  deepLinkHandler = handler;
}

export function handleDeepLink(url: string): void {
  const parsed = parseDeepLink(url);
  console.log('[DeepLink] Parsed:', parsed);

  if (deepLinkHandler) {
    deepLinkHandler(parsed);
  }
}

// =====================================================
// 앱 시작시 딥링크 처리
// =====================================================

export async function handleInitialDeepLink(): Promise<ParsedDeepLink | null> {
  try {
    const url = await Linking.getInitialURL();
    if (url) {
      return parseDeepLink(url);
    }
    return null;
  } catch {
    return null;
  }
}

// =====================================================
// URL 열기
// =====================================================

export async function openUrl(url: string): Promise<boolean> {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
      return true;
    }
    console.log('[DeepLink] Cannot open URL:', url);
    return false;
  } catch (error) {
    console.error('[DeepLink] Failed to open URL:', error);
    return false;
  }
}

// =====================================================
// 공유용 URL 생성
// =====================================================

export function getShareContent(confessionId: string): {
  title: string;
  message: string;
  url: string;
} {
  const url = createShareableUrl(confessionId);
  return {
    title: '고백',
    message: '이 고백을 확인해보세요!',
    url,
  };
}

export default linking;
