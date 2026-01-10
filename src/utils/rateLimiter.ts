/**
 * Rate Limiter Utility
 * 클라이언트 사이드 rate limiting으로 스팸 방지
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Rate limit 규칙
 */
export interface RateLimitRule {
  key: string;
  maxAttempts: number;
  windowMs: number; // 시간 윈도우 (밀리초)
  message?: string;
}

/**
 * Rate limit 결과
 */
export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  resetTime: Date;
  message?: string;
}

/**
 * Rate limit 저장 데이터
 */
interface RateLimitData {
  attempts: number;
  resetTime: number;
}

/**
 * 기본 rate limit 규칙
 */
export const DEFAULT_RATE_LIMITS: Record<string, RateLimitRule> = {
  // 고해성사 작성: 5분당 1개
  confession_write: {
    key: 'confession_write',
    maxAttempts: 1,
    windowMs: 5 * 60 * 1000, // 5분
    message: '고해성사는 5분에 1개씩만 작성할 수 있습니다.',
  },

  // 좋아요/싫어요: 10초당 1개
  like_action: {
    key: 'like_action',
    maxAttempts: 1,
    windowMs: 10 * 1000, // 10초
    message: '잠시 후 다시 시도해주세요.',
  },

  // 신고: 1분당 1개
  report_action: {
    key: 'report_action',
    maxAttempts: 1,
    windowMs: 60 * 1000, // 1분
    message: '신고는 1분에 1개씩만 할 수 있습니다.',
  },

  // 이미지 업로드: 1분당 5개
  image_upload: {
    key: 'image_upload',
    maxAttempts: 5,
    windowMs: 60 * 1000, // 1분
    message: '이미지는 1분에 5개까지만 업로드할 수 있습니다.',
  },

  // API 호출: 10초당 10개
  api_call: {
    key: 'api_call',
    maxAttempts: 10,
    windowMs: 10 * 1000, // 10초
    message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  },
};

/**
 * Rate Limiter Class
 */
class RateLimiter {
  /**
   * AsyncStorage 키 생성
   */
  private getStorageKey(ruleKey: string): string {
    return `@rate_limit_${ruleKey}`;
  }

  /**
   * Rate limit 데이터 로드
   */
  private async loadData(ruleKey: string): Promise<RateLimitData | null> {
    try {
      const data = await AsyncStorage.getItem(this.getStorageKey(ruleKey));

      if (!data) {
        return null;
      }

      return JSON.parse(data);
    } catch (error) {
      console.error('[Rate Limiter] Failed to load data:', error);
      return null;
    }
  }

  /**
   * Rate limit 데이터 저장
   */
  private async saveData(
    ruleKey: string,
    data: RateLimitData,
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.getStorageKey(ruleKey),
        JSON.stringify(data),
      );
    } catch (error) {
      console.error('[Rate Limiter] Failed to save data:', error);
    }
  }

  /**
   * Rate limit 데이터 삭제
   */
  private async clearData(ruleKey: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.getStorageKey(ruleKey));
    } catch (error) {
      console.error('[Rate Limiter] Failed to clear data:', error);
    }
  }

  /**
   * Rate limit 체크
   */
  async check(rule: RateLimitRule): Promise<RateLimitResult> {
    const now = Date.now();
    const data = await this.loadData(rule.key);

    // 데이터가 없으면 첫 시도
    if (!data) {
      await this.saveData(rule.key, {
        attempts: 1,
        resetTime: now + rule.windowMs,
      });

      return {
        allowed: true,
        remainingAttempts: rule.maxAttempts - 1,
        resetTime: new Date(now + rule.windowMs),
      };
    }

    // 윈도우가 만료되었으면 리셋
    if (now >= data.resetTime) {
      await this.saveData(rule.key, {
        attempts: 1,
        resetTime: now + rule.windowMs,
      });

      return {
        allowed: true,
        remainingAttempts: rule.maxAttempts - 1,
        resetTime: new Date(now + rule.windowMs),
      };
    }

    // 시도 횟수가 한도를 초과했는지 확인
    if (data.attempts >= rule.maxAttempts) {
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: new Date(data.resetTime),
        message: rule.message || '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
      };
    }

    // 시도 횟수 증가
    await this.saveData(rule.key, {
      attempts: data.attempts + 1,
      resetTime: data.resetTime,
    });

    return {
      allowed: true,
      remainingAttempts: rule.maxAttempts - data.attempts - 1,
      resetTime: new Date(data.resetTime),
    };
  }

  /**
   * Rate limit 체크 (간편 버전)
   */
  async checkSimple(ruleKey: string): Promise<boolean> {
    const rule = DEFAULT_RATE_LIMITS[ruleKey];

    if (!rule) {
      console.warn(`[Rate Limiter] Unknown rule: ${ruleKey}`);
      return true; // 규칙이 없으면 허용
    }

    const result = await this.check(rule);
    return result.allowed;
  }

  /**
   * Rate limit 리셋
   */
  async reset(ruleKey: string): Promise<void> {
    await this.clearData(ruleKey);
  }

  /**
   * 모든 rate limit 리셋
   */
  async resetAll(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const rateLimitKeys = allKeys.filter(key =>
        key.startsWith('@rate_limit_'),
      );

      await AsyncStorage.multiRemove(rateLimitKeys);
      console.log('[Rate Limiter] All rate limits reset');
    } catch (error) {
      console.error('[Rate Limiter] Failed to reset all:', error);
    }
  }

  /**
   * 남은 시간 가져오기 (초)
   */
  async getRemainingTime(ruleKey: string): Promise<number> {
    const data = await this.loadData(ruleKey);

    if (!data) {
      return 0;
    }

    const now = Date.now();
    const remaining = Math.max(0, data.resetTime - now);

    return Math.ceil(remaining / 1000);
  }

  /**
   * 남은 시도 횟수 가져오기
   */
  async getRemainingAttempts(ruleKey: string): Promise<number> {
    const rule = DEFAULT_RATE_LIMITS[ruleKey];

    if (!rule) {
      return 0;
    }

    const data = await this.loadData(ruleKey);

    if (!data) {
      return rule.maxAttempts;
    }

    const now = Date.now();

    // 윈도우가 만료되었으면 최대 시도 횟수 반환
    if (now >= data.resetTime) {
      return rule.maxAttempts;
    }

    return Math.max(0, rule.maxAttempts - data.attempts);
  }

  /**
   * 사용자 친화적 메시지 생성
   */
  async getUserFriendlyMessage(ruleKey: string): Promise<string> {
    const rule = DEFAULT_RATE_LIMITS[ruleKey];

    if (!rule) {
      return '잠시 후 다시 시도해주세요.';
    }

    const remainingTime = await this.getRemainingTime(ruleKey);

    if (remainingTime === 0) {
      return rule.message || '잠시 후 다시 시도해주세요.';
    }

    // 초를 분/초로 변환
    if (remainingTime < 60) {
      return `${remainingTime}초 후에 다시 시도해주세요.`;
    }

    const minutes = Math.ceil(remainingTime / 60);
    return `${minutes}분 후에 다시 시도해주세요.`;
  }

  /**
   * 오래된 rate limit 데이터 정리
   */
  async cleanup(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const rateLimitKeys = allKeys.filter(key =>
        key.startsWith('@rate_limit_'),
      );

      const now = Date.now();

      for (const key of rateLimitKeys) {
        const data = await this.loadData(key.replace('@rate_limit_', ''));

        // 리셋 시간이 지난 데이터 삭제
        if (data && now >= data.resetTime) {
          await AsyncStorage.removeItem(key);
        }
      }

      console.log('[Rate Limiter] Cleanup completed');
    } catch (error) {
      console.error('[Rate Limiter] Failed to cleanup:', error);
    }
  }

  /**
   * Daily limit 체크 (하루 최대 횟수 제한)
   */
  async checkDailyLimit(
    actionKey: string,
    maxDaily: number,
  ): Promise<RateLimitResult> {
    const today = new Date().toISOString().split('T')[0];
    const dailyKey = `${actionKey}_daily_${today}`;

    const rule: RateLimitRule = {
      key: dailyKey,
      maxAttempts: maxDaily,
      windowMs: 24 * 60 * 60 * 1000, // 24시간
      message: `하루 최대 ${maxDaily}번까지만 가능합니다.`,
    };

    return this.check(rule);
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

/**
 * React Hook: useRateLimit
 * 컴포넌트에서 rate limiting을 쉽게 사용할 수 있는 훅
 */
export function useRateLimit(ruleKey: string) {
  const [remainingAttempts, setRemainingAttempts] = React.useState<number>(0);
  const [remainingTime, setRemainingTime] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadStatus();
  }, [ruleKey]);

  const loadStatus = async () => {
    setIsLoading(true);
    const attempts = await rateLimiter.getRemainingAttempts(ruleKey);
    const time = await rateLimiter.getRemainingTime(ruleKey);

    setRemainingAttempts(attempts);
    setRemainingTime(time);
    setIsLoading(false);
  };

  const checkLimit = async (): Promise<RateLimitResult> => {
    const rule = DEFAULT_RATE_LIMITS[ruleKey];

    if (!rule) {
      return {
        allowed: true,
        remainingAttempts: 0,
        resetTime: new Date(),
      };
    }

    const result = await rateLimiter.check(rule);
    await loadStatus();
    return result;
  };

  const reset = async () => {
    await rateLimiter.reset(ruleKey);
    await loadStatus();
  };

  return {
    remainingAttempts,
    remainingTime,
    isLoading,
    checkLimit,
    reset,
  };
}

// React import
import React from 'react';
