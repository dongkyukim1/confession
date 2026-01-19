/**
 * Firebase Analytics 유틸리티
 *
 * 설치 필요:
 * npm install @react-native-firebase/app @react-native-firebase/analytics
 *
 * 추가 설정:
 * - Android: google-services.json 추가
 * - iOS: GoogleService-Info.plist 추가
 */

// Firebase Analytics가 설치되어 있는지 확인
let analytics: typeof import('@react-native-firebase/analytics').default | null = null;

try {
  analytics = require('@react-native-firebase/analytics').default;
} catch {
  console.log('[Analytics] @react-native-firebase/analytics not installed');
}

// =====================================================
// 타입 정의
// =====================================================

type ScreenName =
  | 'Home'
  | 'Discover'
  | 'MyDiary'
  | 'ViewedDiary'
  | 'Profile'
  | 'Write'
  | 'Reveal'
  | 'Onboarding'
  | 'BackgroundSettings';

type EventName =
  | 'confession_created'
  | 'confession_viewed'
  | 'confession_liked'
  | 'confession_disliked'
  | 'confession_reported'
  | 'confession_deleted'
  | 'confession_shared'
  | 'comment_created'
  | 'achievement_unlocked'
  | 'streak_updated'
  | 'mission_completed'
  | 'theme_changed'
  | 'font_changed'
  | 'background_changed'
  | 'onboarding_completed'
  | 'error_occurred';

// =====================================================
// 초기화 확인
// =====================================================

function isEnabled(): boolean {
  return analytics !== null && !__DEV__;
}

// =====================================================
// 화면 추적
// =====================================================

export async function trackScreen(screenName: ScreenName): Promise<void> {
  if (!isEnabled()) {
    console.log(`[Analytics] Screen: ${screenName}`);
    return;
  }

  try {
    await analytics!().logScreenView({
      screen_name: screenName,
      screen_class: screenName,
    });
  } catch (error) {
    console.error('[Analytics] Failed to log screen:', error);
  }
}

// =====================================================
// 이벤트 추적
// =====================================================

export async function trackEvent(
  eventName: EventName,
  params?: Record<string, string | number | boolean>,
): Promise<void> {
  if (!isEnabled()) {
    console.log(`[Analytics] Event: ${eventName}`, params);
    return;
  }

  try {
    await analytics!().logEvent(eventName, params);
  } catch (error) {
    console.error('[Analytics] Failed to log event:', error);
  }
}

// =====================================================
// 고백 관련 이벤트
// =====================================================

export async function trackConfessionCreated(options?: {
  hasMood?: boolean;
  hasTags?: boolean;
  hasImages?: boolean;
  contentLength?: number;
}): Promise<void> {
  await trackEvent('confession_created', {
    has_mood: options?.hasMood || false,
    has_tags: options?.hasTags || false,
    has_images: options?.hasImages || false,
    content_length: options?.contentLength || 0,
  });
}

export async function trackConfessionViewed(confessionId: string): Promise<void> {
  await trackEvent('confession_viewed', {
    confession_id: confessionId,
  });
}

export async function trackConfessionReaction(
  confessionId: string,
  reactionType: 'like' | 'dislike',
): Promise<void> {
  const eventName = reactionType === 'like' ? 'confession_liked' : 'confession_disliked';
  await trackEvent(eventName, {
    confession_id: confessionId,
  });
}

export async function trackConfessionReported(
  confessionId: string,
  reason: string,
): Promise<void> {
  await trackEvent('confession_reported', {
    confession_id: confessionId,
    reason,
  });
}

export async function trackConfessionDeleted(confessionId: string): Promise<void> {
  await trackEvent('confession_deleted', {
    confession_id: confessionId,
  });
}

// =====================================================
// 업적 및 미션 이벤트
// =====================================================

export async function trackAchievementUnlocked(
  achievementType: string,
): Promise<void> {
  await trackEvent('achievement_unlocked', {
    achievement_type: achievementType,
  });
}

export async function trackStreakUpdated(
  currentStreak: number,
  longestStreak: number,
): Promise<void> {
  await trackEvent('streak_updated', {
    current_streak: currentStreak,
    longest_streak: longestStreak,
  });
}

export async function trackMissionCompleted(missionType: string): Promise<void> {
  await trackEvent('mission_completed', {
    mission_type: missionType,
  });
}

// =====================================================
// 설정 변경 이벤트
// =====================================================

export async function trackThemeChanged(themeName: string): Promise<void> {
  await trackEvent('theme_changed', {
    theme_name: themeName,
  });
}

export async function trackFontChanged(fontName: string): Promise<void> {
  await trackEvent('font_changed', {
    font_name: fontName,
  });
}

export async function trackBackgroundChanged(hasBackground: boolean): Promise<void> {
  await trackEvent('background_changed', {
    has_background: hasBackground,
  });
}

// =====================================================
// 온보딩 이벤트
// =====================================================

export async function trackOnboardingCompleted(options?: {
  agreedToMarketing?: boolean;
}): Promise<void> {
  await trackEvent('onboarding_completed', {
    agreed_to_marketing: options?.agreedToMarketing || false,
  });
}

// =====================================================
// 에러 이벤트
// =====================================================

export async function trackError(
  errorType: string,
  errorMessage: string,
): Promise<void> {
  await trackEvent('error_occurred', {
    error_type: errorType,
    error_message: errorMessage.substring(0, 100), // 메시지 길이 제한
  });
}

// =====================================================
// 사용자 속성
// =====================================================

export async function setUserProperty(
  name: string,
  value: string | null,
): Promise<void> {
  if (!isEnabled()) {
    console.log(`[Analytics] User property: ${name}=${value}`);
    return;
  }

  try {
    await analytics!().setUserProperty(name, value);
  } catch (error) {
    console.error('[Analytics] Failed to set user property:', error);
  }
}

export async function setUserProperties(
  properties: Record<string, string | null>,
): Promise<void> {
  if (!isEnabled()) {
    console.log('[Analytics] User properties:', properties);
    return;
  }

  try {
    await analytics!().setUserProperties(properties);
  } catch (error) {
    console.error('[Analytics] Failed to set user properties:', error);
  }
}

// =====================================================
// 사용자 ID 설정
// =====================================================

export async function setUserId(userId: string | null): Promise<void> {
  if (!isEnabled()) {
    console.log(`[Analytics] User ID: ${userId}`);
    return;
  }

  try {
    await analytics!().setUserId(userId);
  } catch (error) {
    console.error('[Analytics] Failed to set user ID:', error);
  }
}

// =====================================================
// 분석 활성화/비활성화
// =====================================================

export async function setAnalyticsEnabled(enabled: boolean): Promise<void> {
  if (!analytics) {
    return;
  }

  try {
    await analytics().setAnalyticsCollectionEnabled(enabled);
    console.log(`[Analytics] Collection ${enabled ? 'enabled' : 'disabled'}`);
  } catch (error) {
    console.error('[Analytics] Failed to toggle analytics:', error);
  }
}

// =====================================================
// 세션 타임아웃 설정 (Android only)
// =====================================================

export async function setSessionTimeout(milliseconds: number): Promise<void> {
  if (!isEnabled()) {
    return;
  }

  try {
    await analytics!().setSessionTimeoutDuration(milliseconds);
  } catch (error) {
    console.error('[Analytics] Failed to set session timeout:', error);
  }
}
