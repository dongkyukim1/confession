/**
 * Error Handler Utility
 * 중앙화된 에러 처리 및 사용자 친화적 메시지 제공
 */

import {ApiError, ErrorCodes} from '../services/api.utils';

/**
 * 에러 메시지 한국어 매핑
 */
const ERROR_MESSAGES: Record<string, string> = {
  [ErrorCodes.NETWORK_ERROR]: '인터넷 연결을 확인해주세요.',
  [ErrorCodes.NOT_FOUND]: '데이터를 찾을 수 없습니다.',
  [ErrorCodes.UNAUTHORIZED]: '권한이 없습니다.',
  [ErrorCodes.VALIDATION_ERROR]: '입력하신 정보를 확인해주세요.',
  [ErrorCodes.SERVER_ERROR]: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  [ErrorCodes.UNKNOWN_ERROR]: '알 수 없는 오류가 발생했습니다.',
  [ErrorCodes.RATE_LIMIT]: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.',
  [ErrorCodes.OFFLINE]: '오프라인 상태입니다. 인터넷 연결을 확인해주세요.',
};

/**
 * ApiError를 사용자 친화적 메시지로 변환
 */
export function getUserFriendlyErrorMessage(error: ApiError | Error): string {
  if ('code' in error && 'userMessage' in error) {
    // ApiError인 경우
    return error.userMessage || ERROR_MESSAGES[error.code] || ERROR_MESSAGES[ErrorCodes.UNKNOWN_ERROR];
  }

  // 일반 Error인 경우
  if (error instanceof Error) {
    // 네트워크 에러
    if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
      return ERROR_MESSAGES[ErrorCodes.NETWORK_ERROR];
    }

    // 기타 에러는 메시지 그대로 반환 (개발 모드에서만)
    return __DEV__ ? error.message : ERROR_MESSAGES[ErrorCodes.UNKNOWN_ERROR];
  }

  return ERROR_MESSAGES[ErrorCodes.UNKNOWN_ERROR];
}

/**
 * 에러 로깅 (향후 Sentry 연동)
 */
export function logError(
  error: Error | ApiError,
  context?: Record<string, any>,
) {
  if (__DEV__) {
    console.error('[Error Handler]', error);
    if (context) {
      console.error('[Error Context]', context);
    }
  }

  // TODO: Sentry.captureException(error, { extra: context });
}

/**
 * 에러 핸들링 래퍼
 * 비동기 함수를 실행하고 에러를 처리
 */
export async function handleAsyncError<T>(
  fn: () => Promise<T>,
  options?: {
    context?: Record<string, any>;
    onError?: (message: string) => void;
    silent?: boolean;
  },
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    const message = getUserFriendlyErrorMessage(error as Error);

    // 에러 로깅
    logError(error as Error, options?.context);

    // 에러 콜백 실행
    if (options?.onError) {
      options.onError(message);
    }

    // silent 모드가 아니면 콘솔에 출력
    if (!options?.silent && __DEV__) {
      console.error('[Async Error]', message);
    }

    return null;
  }
}

/**
 * 재시도 가능한 에러인지 확인
 */
export function isRetryableError(error: ApiError | Error): boolean {
  if ('code' in error) {
    return error.code === ErrorCodes.NETWORK_ERROR || error.code === ErrorCodes.SERVER_ERROR;
  }

  if (error instanceof Error) {
    return (
      error.message.includes('Network') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('timeout')
    );
  }

  return false;
}

/**
 * 에러가 사용자에게 표시되어야 하는지 확인
 */
export function shouldShowErrorToUser(error: ApiError | Error): boolean {
  // 네트워크 에러는 항상 표시
  if ('code' in error && error.code === ErrorCodes.NETWORK_ERROR) {
    return true;
  }

  // 유효성 검사 에러는 항상 표시
  if ('code' in error && error.code === ErrorCodes.VALIDATION_ERROR) {
    return true;
  }

  // 서버 에러는 표시
  if ('code' in error && error.code === ErrorCodes.SERVER_ERROR) {
    return true;
  }

  // Not Found는 silent 처리 가능 (옵션에 따라)
  if ('code' in error && error.code === ErrorCodes.NOT_FOUND) {
    return false;
  }

  // 기타 에러는 표시
  return true;
}

/**
 * 에러 심각도 레벨
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * 에러 심각도 판단
 */
export function getErrorSeverity(error: ApiError | Error): ErrorSeverity {
  if ('code' in error) {
    switch (error.code) {
      case ErrorCodes.NETWORK_ERROR:
        return ErrorSeverity.MEDIUM;
      case ErrorCodes.NOT_FOUND:
        return ErrorSeverity.LOW;
      case ErrorCodes.UNAUTHORIZED:
        return ErrorSeverity.HIGH;
      case ErrorCodes.VALIDATION_ERROR:
        return ErrorSeverity.LOW;
      case ErrorCodes.SERVER_ERROR:
        return ErrorSeverity.HIGH;
      case ErrorCodes.OFFLINE:
        return ErrorSeverity.MEDIUM;
      default:
        return ErrorSeverity.MEDIUM;
    }
  }

  return ErrorSeverity.MEDIUM;
}

/**
 * 에러 디버그 정보 생성
 */
export function getErrorDebugInfo(
  error: ApiError | Error,
): Record<string, any> {
  const baseInfo = {
    message: error.message,
    timestamp: new Date().toISOString(),
  };

  if ('code' in error && 'details' in error) {
    return {
      ...baseInfo,
      code: error.code,
      details: error.details,
      userMessage: error.userMessage,
    };
  }

  if (error instanceof Error) {
    return {
      ...baseInfo,
      name: error.name,
      stack: error.stack,
    };
  }

  return baseInfo;
}

/**
 * 에러 복구 제안 메시지
 */
export function getErrorRecoveryMessage(error: ApiError | Error): string {
  if ('code' in error) {
    switch (error.code) {
      case ErrorCodes.NETWORK_ERROR:
        return 'Wi-Fi 또는 모바일 데이터 연결을 확인하고 다시 시도해주세요.';
      case ErrorCodes.SERVER_ERROR:
        return '잠시 후 다시 시도해주세요. 문제가 지속되면 고객센터에 문의해주세요.';
      case ErrorCodes.RATE_LIMIT:
        return '잠시 후 다시 시도해주세요.';
      case ErrorCodes.VALIDATION_ERROR:
        return '입력하신 정보를 확인하고 다시 시도해주세요.';
      case ErrorCodes.OFFLINE:
        return '인터넷 연결을 확인하고 다시 시도해주세요.';
      default:
        return '문제가 지속되면 앱을 재시작해주세요.';
    }
  }

  return '문제가 지속되면 앱을 재시작해주세요.';
}
