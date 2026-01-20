/**
 * Achievement Service
 * 
 * 업적 관련 비즈니스 로직을 처리합니다.
 */
import {getSupabaseClient} from '../lib/supabase';
import {Achievement} from '../types';
import {handleApiError, withRetry, validateRequired} from './api.utils';

export interface AchievementProgress {
  achievementId: string;
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

export class AchievementService {
  /**
   * 모든 업적 목록 조회
   */
  static async getAllAchievements(): Promise<Achievement[]> {
    try {
      const result = await withRetry(async () => {
        const supabase = await getSupabaseClient();
        const {data, error} = await supabase
          .from('achievements')
          .select('*')
          .order('id', {ascending: true});

        if (error) throw error;
        return data || [];
      });

      return result.map(this.mapToAchievement);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * 사용자의 업적 진행 상황 조회
   */
  static async getUserAchievements(
    deviceId: string,
  ): Promise<AchievementProgress[]> {
    try {
      validateRequired(deviceId, '기기 ID');

      const result = await withRetry(async () => {
        const supabase = await getSupabaseClient();
        const {data, error} = await supabase
          .from('user_achievements')
          .select(`
            achievement_id,
            unlocked_at,
            progress,
            achievements (
              id,
              title,
              description,
              icon,
              max_progress
            )
          `)
          .eq('device_id', deviceId);

        if (error) throw error;
        return data || [];
      });

      return result.map(item => ({
        achievementId: item.achievement_id,
        isUnlocked: !!item.unlocked_at,
        unlockedAt: item.unlocked_at ? new Date(item.unlocked_at) : undefined,
        progress: item.progress || 0,
        maxProgress: (item.achievements as any)?.max_progress || 1,
      }));
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * 업적 진행도 업데이트
   */
  static async updateAchievementProgress(
    deviceId: string,
    achievementId: string,
    progress: number,
  ): Promise<boolean> {
    try {
      validateRequired(deviceId, '기기 ID');
      validateRequired(achievementId, '업적 ID');

      // 업적 정보 조회
      const supabase = await getSupabaseClient();
      const {data: achievement} = await supabase
        .from('achievements')
        .select('max_progress')
        .eq('id', achievementId)
        .single();

      if (!achievement) {
        throw new Error('업적을 찾을 수 없습니다');
      }

      const isUnlocked = progress >= achievement.max_progress;
      const now = new Date().toISOString();

      await withRetry(async () => {
        const supabaseClient = await getSupabaseClient();
        const {error} = await supabaseClient.from('user_achievements').upsert(
          {
            device_id: deviceId,
            achievement_id: achievementId,
            progress,
            unlocked_at: isUnlocked ? now : null,
            updated_at: now,
          },
          {
            onConflict: 'device_id,achievement_id',
          },
        );

        if (error) throw error;
      });

      console.log('[AchievementService] Updated achievement:', achievementId, 'Progress:', progress);
      return isUnlocked;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * 업적 달성 체크 및 자동 잠금 해제
   */
  static async checkAndUnlockAchievements(
    deviceId: string,
  ): Promise<Achievement[]> {
    try {
      validateRequired(deviceId, '기기 ID');

      // 통계 조회
      const supabase = await getSupabaseClient();
      const {data: stats} = await supabase
        .from('confessions')
        .select('id, created_at')
        .eq('device_id', deviceId);

      if (!stats || stats.length === 0) {
        return [];
      }

      const totalConfessions = stats.length;
      const unlockedAchievements: Achievement[] = [];

      // 첫 고백 작성
      if (totalConfessions >= 1) {
        const unlocked = await this.updateAchievementProgress(
          deviceId,
          'first_confession',
          1,
        );
        if (unlocked) {
          const achievement = await this.getAchievement('first_confession');
          if (achievement) unlockedAchievements.push(achievement);
        }
      }

      // 10개 작성
      if (totalConfessions >= 10) {
        const unlocked = await this.updateAchievementProgress(
          deviceId,
          'ten_confessions',
          10,
        );
        if (unlocked) {
          const achievement = await this.getAchievement('ten_confessions');
          if (achievement) unlockedAchievements.push(achievement);
        }
      }

      // 7일 연속 작성 체크
      const consecutiveDays = this.calculateConsecutiveDays(stats);
      if (consecutiveDays >= 7) {
        const unlocked = await this.updateAchievementProgress(
          deviceId,
          'seven_days_streak',
          7,
        );
        if (unlocked) {
          const achievement = await this.getAchievement('seven_days_streak');
          if (achievement) unlockedAchievements.push(achievement);
        }
      }

      return unlockedAchievements;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * 특정 업적 조회
   */
  private static async getAchievement(
    achievementId: string,
  ): Promise<Achievement | null> {
    try {
      const supabase = await getSupabaseClient();
      const {data, error} = await supabase
        .from('achievements')
        .select('*')
        .eq('id', achievementId)
        .single();

      if (error) throw error;
      if (!data) return null;

      return this.mapToAchievement(data);
    } catch (error) {
      console.error('[AchievementService] Failed to get achievement:', error);
      return null;
    }
  }

  /**
   * 연속 작성 일수 계산
   */
  private static calculateConsecutiveDays(
    confessions: Array<{created_at: string}>,
  ): number {
    if (confessions.length === 0) return 0;

    // 날짜별로 그룹화
    const dates = confessions
      .map(c => new Date(c.created_at).toDateString())
      .sort()
      .reverse();

    const uniqueDates = Array.from(new Set(dates));
    
    let consecutive = 0;
    let currentDate = new Date();

    for (const dateStr of uniqueDates) {
      const confessionDate = new Date(dateStr);
      const diffDays = Math.floor(
        (currentDate.getTime() - confessionDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === consecutive) {
        consecutive++;
      } else {
        break;
      }
    }

    return consecutive;
  }

  /**
   * DB 데이터를 앱 타입으로 변환
   */
  private static mapToAchievement(data: any): Achievement {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      icon: data.icon,
      maxProgress: data.max_progress,
    };
  }
}
