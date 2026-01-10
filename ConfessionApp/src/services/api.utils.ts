/**
 * API 유틸리티
 * 
 * 일관된 에러 처리, 로깅, 재시도 로직을 제공합니다.
 */

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export class ApiException extends Error {
  code?: string;
  details?: any;

  constructor(message: string, code?: string, details?: any) {
    super(message);
    this.name = 'ApiException';
    this.code = code;
    this.details = details;
  }
}

/**
 * Supabase 에러를 사용자 친화적인 메시지로 변환
 */
export function handleApiError(error: any): ApiException {
  console.error('[API Error]', error);

  // Supabase 에러 처리
  if (error.code) {
    switch (error.code) {
      case 'PGRST116':
        return new ApiException(
          '데이터를 찾을 수 없습니다',
          'NOT_FOUND',
          error,
        );
      case '23505':
        return new ApiException(
          '이미 존재하는 데이터입니다',
          'DUPLICATE',
          error,
        );
      case '42P01':
        return new ApiException(
          '테이블을 찾을 수 없습니다',
          'TABLE_NOT_FOUND',
          error,
        );
      default:
        return new ApiException(
          '데이터베이스 오류가 발생했습니다',
          error.code,
          error,
        );
    }
  }

  // 네트워크 에러
  if (error.message && error.message.includes('network')) {
    return new ApiException(
      '인터넷 연결을 확인해주세요',
      'NETWORK_ERROR',
      error,
    );
  }

  // 기본 에러
  return new ApiException(
    error.message || '알 수 없는 오류가 발생했습니다',
    'UNKNOWN_ERROR',
    error,
  );
}

/**
 * 재시도 로직을 포함한 API 호출 래퍼
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000,
): Promise<T> {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // 마지막 시도가 아니면 대기 후 재시도
      if (i < maxRetries - 1) {
        console.log(`[Retry ${i + 1}/${maxRetries}] Waiting ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 2; // 지수 백오프
      }
    }
  }

  throw handleApiError(lastError);
}

/**
 * 데이터 유효성 검사
 */
export function validateRequired<T>(
  value: T | null | undefined,
  fieldName: string,
): T {
  if (value === null || value === undefined) {
    throw new ApiException(
      `${fieldName}은(는) 필수 항목입니다`,
      'VALIDATION_ERROR',
    );
  }
  return value;
}

/**
 * 배열 데이터 유효성 검사
 */
export function validateArray<T>(
  value: T[] | null | undefined,
  fieldName: string,
): T[] {
  if (!Array.isArray(value)) {
    throw new ApiException(
      `${fieldName}은(는) 배열이어야 합니다`,
      'VALIDATION_ERROR',
    );
  }
  return value;
}
