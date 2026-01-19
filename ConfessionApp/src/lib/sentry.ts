/**
 * Sentry 에러 모니터링 설정
 *
 * 설치 필요: npm install @sentry/react-native
 * 설정 필요: npx @sentry/wizard -i reactNative
 */

// Sentry가 설치되어 있는지 확인
let Sentry: typeof import('@sentry/react-native') | null = null;

try {
  Sentry = require('@sentry/react-native');
} catch {
  console.log('[Sentry] @sentry/react-native not installed');
}

// =====================================================
// 설정
// =====================================================

interface SentryConfig {
  dsn: string;
  environment: string;
  debug: boolean;
  enableAutoSessionTracking: boolean;
  sessionTrackingIntervalMillis: number;
  tracesSampleRate: number;
}

const DEFAULT_CONFIG: SentryConfig = {
  dsn: process.env.SENTRY_DSN || '',
  environment: __DEV__ ? 'development' : 'production',
  debug: __DEV__,
  enableAutoSessionTracking: true,
  sessionTrackingIntervalMillis: 30000,
  tracesSampleRate: __DEV__ ? 1.0 : 0.2, // 프로덕션에서는 20%만 샘플링
};

// =====================================================
// 초기화
// =====================================================

let isInitialized = false;

export function initSentry(config?: Partial<SentryConfig>): void {
  if (!Sentry) {
    console.log('[Sentry] Skipping initialization (not installed)');
    return;
  }

  if (isInitialized) {
    console.log('[Sentry] Already initialized');
    return;
  }

  const finalConfig = {...DEFAULT_CONFIG, ...config};

  if (!finalConfig.dsn) {
    console.warn('[Sentry] DSN not configured, skipping initialization');
    return;
  }

  try {
    Sentry.init({
      dsn: finalConfig.dsn,
      environment: finalConfig.environment,
      debug: finalConfig.debug,
      enableAutoSessionTracking: finalConfig.enableAutoSessionTracking,
      sessionTrackingIntervalMillis: finalConfig.sessionTrackingIntervalMillis,
      tracesSampleRate: finalConfig.tracesSampleRate,
      // 민감 정보 필터링
      beforeSend(event) {
        // 민감 정보 제거
        if (event.user) {
          delete event.user.email;
          delete event.user.ip_address;
        }
        return event;
      },
    });

    isInitialized = true;
    console.log('[Sentry] Initialized successfully');
  } catch (error) {
    console.error('[Sentry] Initialization failed:', error);
  }
}

// =====================================================
// 에러 캡처
// =====================================================

export function captureException(
  error: Error,
  context?: Record<string, any>,
): void {
  if (!Sentry || !isInitialized) {
    console.error('[Error]', error);
    return;
  }

  if (context) {
    Sentry.withScope(scope => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

// =====================================================
// 메시지 캡처
// =====================================================

type SeverityLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

export function captureMessage(
  message: string,
  level: SeverityLevel = 'info',
): void {
  if (!Sentry || !isInitialized) {
    console.log(`[${level.toUpperCase()}]`, message);
    return;
  }

  Sentry.captureMessage(message, level);
}

// =====================================================
// 사용자 컨텍스트
// =====================================================

export function setUser(user: {id: string; [key: string]: any}): void {
  if (!Sentry || !isInitialized) {
    return;
  }

  Sentry.setUser({
    id: user.id,
    // 민감 정보는 포함하지 않음
  });
}

export function clearUser(): void {
  if (!Sentry || !isInitialized) {
    return;
  }

  Sentry.setUser(null);
}

// =====================================================
// 태그 설정
// =====================================================

export function setTag(key: string, value: string): void {
  if (!Sentry || !isInitialized) {
    return;
  }

  Sentry.setTag(key, value);
}

export function setTags(tags: Record<string, string>): void {
  if (!Sentry || !isInitialized) {
    return;
  }

  Object.entries(tags).forEach(([key, value]) => {
    Sentry.setTag(key, value);
  });
}

// =====================================================
// 브레드크럼 (경로 추적)
// =====================================================

export function addBreadcrumb(breadcrumb: {
  category: string;
  message: string;
  level?: SeverityLevel;
  data?: Record<string, any>;
}): void {
  if (!Sentry || !isInitialized) {
    return;
  }

  Sentry.addBreadcrumb({
    category: breadcrumb.category,
    message: breadcrumb.message,
    level: breadcrumb.level || 'info',
    data: breadcrumb.data,
    timestamp: Date.now() / 1000,
  });
}

// =====================================================
// 화면 네비게이션 추적
// =====================================================

export function trackNavigation(
  routeName: string,
  params?: Record<string, any>,
): void {
  addBreadcrumb({
    category: 'navigation',
    message: `Navigate to ${routeName}`,
    data: params,
  });
}

// =====================================================
// API 에러 추적
// =====================================================

export function trackApiError(
  endpoint: string,
  error: Error,
  statusCode?: number,
): void {
  if (!Sentry || !isInitialized) {
    console.error(`[API Error] ${endpoint}:`, error);
    return;
  }

  Sentry.withScope(scope => {
    scope.setTag('error_type', 'api_error');
    scope.setExtra('endpoint', endpoint);
    if (statusCode) {
      scope.setExtra('status_code', statusCode);
    }
    Sentry.captureException(error);
  });
}

// =====================================================
// Wrapper 컴포넌트 (에러 바운더리)
// =====================================================

export function getSentryErrorBoundary(): React.ComponentType<any> | null {
  if (!Sentry) {
    return null;
  }

  return Sentry.ErrorBoundary;
}

// =====================================================
// 성능 모니터링
// =====================================================

export function startTransaction(name: string, op: string): any {
  if (!Sentry || !isInitialized) {
    return {finish: () => {}};
  }

  return Sentry.startTransaction({name, op});
}

// =====================================================
// React Native 전용
// =====================================================

export function wrapWithSentry(component: React.ComponentType<any>): React.ComponentType<any> {
  if (!Sentry) {
    return component;
  }

  return Sentry.wrap(component);
}
