/**
 * Streak Service
 *
 * 스트릭(연속 기록) 관련 비즈니스 로직을 처리합니다.
 */
import {getSupabaseClient} from '../lib/supabase';
import {UserStreak} from '../types';
import {handleApiError, withRetry, validateRequired} from './api.utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_STORAGE_KEY = '@user_streak';

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastConfessionDate: string | null;
  todayCompleted: boolean;
  streakMilestone: StreakMilestone | null;
}

export type StreakMilestone = {
  days: number;
  badge: string;
  title: string;
};

const STREAK_MILESTONES: StreakMilestone[] = [
  {days: 7, badge: '🔥', title: '일주일 연속!'},
  {days: 30, badge: '🔥🔥', title: '한 달 연속!'},
  {days: 100, badge: '🔥🔥🔥', title: '100일 연속!'},
];

export class StreakService {
  /**
   * 사용자 스트릭 정보 조회
   */
  static async getStreakInfo(deviceId: string): Promise<StreakInfo> {
    try {
      validateRequired(deviceId, '기기 ID');

      // 먼저 로컬에서 조회
      const localStreak = await this.getLocalStreak();
      if (localStreak && this.isValidLocalStreak(localStreak)) {
        return this.mapToStreakInfo(localStreak);
      }

      // 서버에서 조회
      const supabase = await getSupabaseClient();
      const result = await withRetry(async () => {
        const {data, error} = await supabase
          .from('user_streaks')
          .select('*')
          .eq('device_id', deviceId)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
      });

      if (result) {
        await this.saveLocalStreak(result);
        return this.mapToStreakInfo(result);
      }

      // 스트릭 데이터가 없으면 새로 생성
      return this.initializeStreak(deviceId);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * 스트릭 초기화
   */
  static async initializeStreak(deviceId: string): Promise<StreakInfo> {
    try {
      const now = new Date().toISOString();
      const newStreak = {
        device_id: deviceId,
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: null,
        updated_at: now,
      };

      const supabase = await getSupabaseClient();
      await withRetry(async () => {
        const {error} = await supabase.from('user_streaks').upsert(newStreak, {
          onConflict: 'device_id',
        });
        if (error) throw error;
      });

      console.log('[StreakService] Initialized streak for device:', deviceId);
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastConfessionDate: null,
        todayCompleted: false,
        streakMilestone: null,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * 고백 작성 시 스트릭 업데이트
   */
  static async updateStreakOnConfession(deviceId: string): Promise<StreakInfo> {
    try {
      validateRequired(deviceId, '기기 ID');

      const currentStreak = await this.getStreakInfo(deviceId);
      const today = this.getDateString(new Date());
      const lastDate = currentStreak.lastConfessionDate;

      // 오늘 이미 작성했으면 스킵
      if (lastDate === today) {
        console.log('[StreakService] Already wrote today');
        return currentStreak;
      }

      let newCurrentStreak = 1;
      let newLongestStreak = currentStreak.longestStreak;

      if (lastDate) {
        const yesterday = this.getDateString(
          new Date(Date.now() - 24 * 60 * 60 * 1000),
        );

        if (lastDate === yesterday) {
          // 어제 작성했으면 스트릭 증가
          newCurrentStreak = currentStreak.currentStreak + 1;
        }
        // 그 외에는 스트릭 리셋 (newCurrentStreak = 1)
      }

      // 최장 스트릭 업데이트
      if (newCurrentStreak > newLongestStreak) {
        newLongestStreak = newCurrentStreak;
      }

      const now = new Date().toISOString();
      const updatedStreak = {
        device_id: deviceId,
        current_streak: newCurrentStreak,
        longest_streak: newLongestStreak,
        last_activity_date: today,
        updated_at: now,
      };

      const supabase = await getSupabaseClient();
      await withRetry(async () => {
        const {error} = await supabase.from('user_streaks').upsert(updatedStreak, {
          onConflict: 'device_id',
        });
        if (error) throw error;
      });

      await this.saveLocalStreak(updatedStreak as any);

      console.log(
        '[StreakService] Updated streak:',
        newCurrentStreak,
        'Longest:',
        newLongestStreak,
      );

      return this.mapToStreakInfo(updatedStreak as any);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * 스트릭 마일스톤 달성 확인
   */
  static getAchievedMilestone(streak: number): StreakMilestone | null {
    // 역순으로 확인하여 가장 높은 마일스톤 반환
    for (let i = STREAK_MILESTONES.length - 1; i >= 0; i--) {
      if (streak >= STREAK_MILESTONES[i].days) {
        return STREAK_MILESTONES[i];
      }
    }
    return null;
  }

  /**
   * 다음 마일스톤까지 남은 일수
   */
  static getDaysToNextMilestone(streak: number): {days: number; milestone: StreakMilestone} | null {
    for (const milestone of STREAK_MILESTONES) {
      if (streak < milestone.days) {
        return {
          days: milestone.days - streak,
          milestone,
        };
      }
    }
    return null;
  }

  /**
   * 오늘 날짜 문자열 반환 (YYYY-MM-DD)
   */
  private static getDateString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * 로컬 스트릭 조회
   */
  private static async getLocalStreak(): Promise<UserStreak | null> {
    try {
      const stored = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  /**
   * 로컬 스트릭 저장
   */
  private static async saveLocalStreak(streak: UserStreak): Promise<void> {
    try {
      await AsyncStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(streak));
    } catch (error) {
      console.error('[StreakService] Failed to save local streak:', error);
    }
  }

  /**
   * 로컬 스트릭 유효성 확인
   */
  private static isValidLocalStreak(streak: UserStreak): boolean {
    if (!streak.updated_at) return false;
    const updatedAt = new Date(streak.updated_at);
    const now = new Date();
    // 1시간 이내면 유효
    return now.getTime() - updatedAt.getTime() < 60 * 60 * 1000;
  }

  /**
   * DB 데이터를 앱 타입으로 변환
   */
  private static mapToStreakInfo(data: any): StreakInfo {
    const today = this.getDateString(new Date());
    // DB 컬럼명은 last_activity_date, 앱 내부에서는 lastConfessionDate로 사용
    const lastDate = data.last_activity_date || data.last_confession_date || null;
    const todayCompleted = lastDate === today;

    return {
      currentStreak: data.current_streak || 0,
      longestStreak: data.longest_streak || 0,
      lastConfessionDate: lastDate,
      todayCompleted,
      streakMilestone: this.getAchievedMilestone(data.current_streak || 0),
    };
  }
}
