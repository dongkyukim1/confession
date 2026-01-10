/**
 * API Utilities
 * 공통 API 유틸리티 및 에러 핸들링
 */

import {PostgrestError} from '@supabase/supabase-js';

/**
 * API 응답 타입
 */
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  success: boolean;
}

/**
 * API 에러 타입
 */
export interface ApiError {
  code: string;
  message: string;
  details?: string;
  userMessage: string; // 사용자에게 표시할 한국어 메시지
}

/**
 * 에러 코드 상수
 */
export const ErrorCodes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
  OFFLINE: 'OFFLINE',
} as const;

/**
 * Supabase 에러를 API 에러로 변환
 */
export function handleSupabaseError(error: PostgrestError): ApiError {
  // Supabase 에러 코드 매핑
  const errorCodeMap: Record<string, {code: string; message: string}> = {
    '23505': {
      code: ErrorCodes.VALIDATION_ERROR,
      message: '이미 존재하는 데이터입니다.',
    },
    '23503': {
      code: ErrorCodes.VALIDATION_ERROR,
      message: '관련된 데이터를 찾을 수 없습니다.',
    },
    '42P01': {
      code: ErrorCodes.SERVER_ERROR,
      message: '데이터베이스 오류가 발생했습니다.',
    },
    PGRST116: {
      code: ErrorCodes.NOT_FOUND,
      message: '데이터를 찾을 수 없습니다.',
    },
  };

  const mapped = errorCodeMap[error.code];

  return {
    code: mapped?.code || ErrorCodes.SERVER_ERROR,
    message: error.message,
    details: error.details,
    userMessage: mapped?.message || '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  };
}

/**
 * 일반 에러를 API 에러로 변환
 */
export function handleGenericError(error: unknown): ApiError {
  if (error instanceof Error) {
    // 네트워크 에러 감지
    if (
      error.message.includes('Network') ||
      error.message.includes('Failed to fetch')
    ) {
      return {
        code: ErrorCodes.NETWORK_ERROR,
        message: error.message,
        userMessage: '인터넷 연결을 확인해주세요.',
      };
    }

    return {
      code: ErrorCodes.UNKNOWN_ERROR,
      message: error.message,
      userMessage: '알 수 없는 오류가 발생했습니다.',
    };
  }

  return {
    code: ErrorCodes.UNKNOWN_ERROR,
    message: String(error),
    userMessage: '알 수 없는 오류가 발생했습니다.',
  };
}

/**
 * API 호출 래퍼 - 에러 핸들링 자동화
 */
export async function apiCall<T>(
  fn: () => Promise<T>,
): Promise<ApiResponse<T>> {
  try {
    const data = await fn();
    return {
      data,
      error: null,
      success: true,
    };
  } catch (error) {
    const apiError =
      error && typeof error === 'object' && 'code' in error
        ? handleSupabaseError(error as PostgrestError)
        : handleGenericError(error);

    return {
      data: null,
      error: apiError,
      success: false,
    };
  }
}

/**
 * Retry 로직이 포함된 API 호출
 */
export async function apiCallWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000,
): Promise<ApiResponse<T>> {
  let lastError: ApiError | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const result = await apiCall(fn);

    if (result.success) {
      return result;
    }

    lastError = result.error;

    // 네트워크 에러가 아니면 재시도하지 않음
    if (result.error?.code !== ErrorCodes.NETWORK_ERROR) {
      return result;
    }

    // 마지막 시도가 아니면 대기 후 재시도
    if (attempt < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
    }
  }

  return {
    data: null,
    error: lastError,
    success: false,
  };
}

/**
 * 배치 처리 헬퍼
 */
export async function batchProcess<T, R>(
  items: T[],
  processFn: (item: T) => Promise<R>,
  batchSize = 10,
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processFn));
    results.push(...batchResults);
  }

  return results;
}

/**
 * 페이지네이션 헬퍼
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export function calculatePagination(
  page: number,
  limit: number,
): {from: number; to: number} {
  const from = page * limit;
  const to = from + limit - 1;
  return {from, to};
}
