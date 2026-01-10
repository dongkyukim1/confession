/**
 * Rate Limiter
 * 
 * 스팸 방지 및 API 호출 제한을 처리합니다.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const RATE_LIMIT_KEY_PREFIX = '@rate_limit_';

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  resetTime?: Date;
}

export class RateLimiter {
  // 기본 설정: 10분에 5번
  private static readonly DEFAULT_CONFIG: RateLimitConfig = {
    maxAttempts: 5,
    windowMs: 10 * 60 * 1000,
  };

  /**
   * Rate limit 체크
   */
  static async checkRateLimit(
    key: string,
    config: RateLimitConfig = this.DEFAULT_CONFIG,
  ): Promise<RateLimitResult> {
    try {
      const storageKey = RATE_LIMIT_KEY_PREFIX + key;
      const dataJson = await AsyncStorage.getItem(storageKey);

      const now = Date.now();
      let attempts: number[] = [];

      if (dataJson) {
        const data = JSON.parse(dataJson);
        attempts = data.attempts || [];
      }

      // 시간 윈도우 밖의 시도 제거
      attempts = attempts.filter(timestamp => now - timestamp < config.windowMs);

      if (attempts.length >= config.maxAttempts) {
        const oldestAttempt = Math.min(...attempts);
        const resetTime = new Date(oldestAttempt + config.windowMs);

        console.log('[RateLimiter] Rate limit exceeded:', key);
        
        return {
          allowed: false,
          remainingAttempts: 0,
          resetTime,
        };
      }

      // 새로운 시도 기록
      attempts.push(now);
      await AsyncStorage.setItem(
        storageKey,
        JSON.stringify({attempts}),
      );

      console.log('[RateLimiter] Request allowed:', key, `(${attempts.length}/${config.maxAttempts})`);

      return {
        allowed: true,
        remainingAttempts: config.maxAttempts - attempts.length,
      };
    } catch (error) {
      console.error('[RateLimiter] Error checking rate limit:', error);
      // 에러 시 허용
      return {
        allowed: true,
        remainingAttempts: config.maxAttempts,
      };
    }
  }

  /**
   * Rate limit 초기화
   */
  static async resetRateLimit(key: string): Promise<void> {
    try {
      const storageKey = RATE_LIMIT_KEY_PREFIX + key;
      await AsyncStorage.removeItem(storageKey);
      console.log('[RateLimiter] Rate limit reset:', key);
    } catch (error) {
      console.error('[RateLimiter] Failed to reset rate limit:', error);
    }
  }

  /**
   * 남은 시간 계산 (분 단위)
   */
  static getTimeUntilReset(resetTime: Date): string {
    const now = new Date();
    const diffMs = resetTime.getTime() - now.getTime();
    const diffMinutes = Math.ceil(diffMs / 60000);

    if (diffMinutes < 1) {
      return '곧';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}분 후`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return minutes > 0 ? `${hours}시간 ${minutes}분 후` : `${hours}시간 후`;
    }
  }

  /**
   * 고백 작성 제한 (하루 10개)
   */
  static async checkConfessionLimit(deviceId: string): Promise<RateLimitResult> {
    return this.checkRateLimit(`confession_${deviceId}`, {
      maxAttempts: 10,
      windowMs: 24 * 60 * 60 * 1000, // 24시간
    });
  }

  /**
   * 고백 조회 제한 (분당 30개)
   */
  static async checkViewLimit(deviceId: string): Promise<RateLimitResult> {
    return this.checkRateLimit(`view_${deviceId}`, {
      maxAttempts: 30,
      windowMs: 60 * 1000, // 1분
    });
  }

  /**
   * 이미지 업로드 제한 (시간당 20개)
   */
  static async checkImageUploadLimit(deviceId: string): Promise<RateLimitResult> {
    return this.checkRateLimit(`image_upload_${deviceId}`, {
      maxAttempts: 20,
      windowMs: 60 * 60 * 1000, // 1시간
    });
  }
}
