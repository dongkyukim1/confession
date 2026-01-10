/**
 * Achievement Service
 * 업적 관련 모든 데이터 작업을 추상화
 */

import {supabase} from '../lib/supabase';
import {apiCall, apiCallWithRetry, ApiResponse} from './api.utils';

/**
 * 업적 타입
 */
export type AchievementType =
  | 'first_post'
  | 'first_like'
  | 'like_received'
  | '7_day_streak';

export interface Achievement {
  id: string;
  device_id: string;
  achievement_type: AchievementType;
  unlocked_at: string;
  viewed: boolean;
}

/**
 * 업적 메타데이터
 */
export interface AchievementMetadata {
  type: AchievementType;
  title: string;
  description: string;
  icon: string;
  color: string;
}

/**
 * 업적 정의
 */
export const ACHIEVEMENT_DEFINITIONS: Record<
  AchievementType,
  AchievementMetadata
> = {
  first_post: {
    type: 'first_post',
    title: '첫 고해성사',
    description: '첫 번째 고해성사를 작성했습니다',
    icon: 'create-outline',
    color: '#5B5FEF',
  },
  first_like: {
    type: 'first_like',
    title: '첫 공감',
    description: '처음으로 좋아요를 눌렀습니다',
    icon: 'heart-outline',
    color: '#FF6B6B',
  },
  like_received: {
    type: 'like_received',
    title: '공감받다',
    description: '첫 번째 좋아요를 받았습니다',
    icon: 'heart',
    color: '#FF6B6B',
  },
  '7_day_streak': {
    type: '7_day_streak',
    title: '7일 연속',
    description: '7일 연속 고해성사를 작성했습니다',
    icon: 'flame',
    color: '#FFA500',
  },
};

/**
 * Achievement Service Class
 */
class AchievementService {
  /**
   * 사용자의 모든 업적 조회
   */
  async getUserAchievements(
    deviceId: string,
  ): Promise<ApiResponse<Achievement[]>> {
    return apiCallWithRetry(async () => {
      const {data, error} = await supabase
        .from('user_achievements')
        .select('*')
        .eq('device_id', deviceId)
        .order('unlocked_at', {ascending: false});

      if (error) {
        throw error;
      }

      return data || [];
    });
  }

  /**
   * 특정 업적 조회
   */
  async getAchievement(
    deviceId: string,
    achievementType: AchievementType,
  ): Promise<ApiResponse<Achievement | null>> {
    return apiCallWithRetry(async () => {
      const {data, error} = await supabase
        .from('user_achievements')
        .select('*')
        .eq('device_id', deviceId)
        .eq('achievement_type', achievementType)
        .single();

      if (error) {
        // 데이터가 없을 경우는 에러가 아님
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    });
  }

  /**
   * 업적 달성 확인
   */
  async hasAchievement(
    deviceId: string,
    achievementType: AchievementType,
  ): Promise<ApiResponse<boolean>> {
    const result = await this.getAchievement(deviceId, achievementType);
    return {
      ...result,
      data: result.data !== null,
    };
  }

  /**
   * 업적 해제
   */
  async unlockAchievement(
    deviceId: string,
    achievementType: AchievementType,
  ): Promise<ApiResponse<Achievement>> {
    return apiCall(async () => {
      // 이미 해제되었는지 확인
      const existing = await this.getAchievement(deviceId, achievementType);

      if (existing.data) {
        return existing.data;
      }

      // 새 업적 추가
      const {data, error} = await supabase
        .from('user_achievements')
        .insert([
          {
            device_id: deviceId,
            achievement_type: achievementType,
            viewed: false,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    });
  }

  /**
   * 업적 확인 표시 (viewed = true)
   */
  async markAchievementAsViewed(
    achievementId: string,
  ): Promise<ApiResponse<void>> {
    return apiCall(async () => {
      const {error} = await supabase
        .from('user_achievements')
        .update({viewed: true})
        .eq('id', achievementId);

      if (error) {
        throw error;
      }
    });
  }

  /**
   * 미확인 업적 조회
   */
  async getUnviewedAchievements(
    deviceId: string,
  ): Promise<ApiResponse<Achievement[]>> {
    return apiCallWithRetry(async () => {
      const {data, error} = await supabase
        .from('user_achievements')
        .select('*')
        .eq('device_id', deviceId)
        .eq('viewed', false)
        .order('unlocked_at', {ascending: false});

      if (error) {
        throw error;
      }

      return data || [];
    });
  }

  /**
   * 업적 달성률 계산
   */
  async getAchievementProgress(
    deviceId: string,
  ): Promise<
    ApiResponse<{
      total: number;
      unlocked: number;
      percentage: number;
    }>
  > {
    const result = await this.getUserAchievements(deviceId);

    if (!result.success || !result.data) {
      return {
        ...result,
        data: {total: 0, unlocked: 0, percentage: 0},
      };
    }

    const totalAchievements = Object.keys(ACHIEVEMENT_DEFINITIONS).length;
    const unlockedAchievements = result.data.length;
    const percentage =
      totalAchievements > 0
        ? Math.round((unlockedAchievements / totalAchievements) * 100)
        : 0;

    return {
      data: {
        total: totalAchievements,
        unlocked: unlockedAchievements,
        percentage,
      },
      error: null,
      success: true,
    };
  }

  /**
   * 업적 메타데이터 가져오기
   */
  getAchievementMetadata(
    achievementType: AchievementType,
  ): AchievementMetadata {
    return ACHIEVEMENT_DEFINITIONS[achievementType];
  }

  /**
   * 모든 업적 메타데이터 가져오기
   */
  getAllAchievementMetadata(): AchievementMetadata[] {
    return Object.values(ACHIEVEMENT_DEFINITIONS);
  }

  /**
   * 첫 포스트 업적 체크 및 해제
   */
  async checkAndUnlockFirstPost(
    deviceId: string,
  ): Promise<ApiResponse<Achievement | null>> {
    return apiCall(async () => {
      // 이미 해제되었는지 확인
      const hasAchievement = await this.hasAchievement(deviceId, 'first_post');
      if (hasAchievement.data) {
        return null;
      }

      // 첫 포스트인지 확인
      const {count} = await supabase
        .from('confessions')
        .select('*', {count: 'exact', head: true})
        .eq('device_id', deviceId);

      if (count === 1) {
        const result = await this.unlockAchievement(deviceId, 'first_post');
        return result.data;
      }

      return null;
    });
  }

  /**
   * 첫 좋아요 업적 체크 및 해제
   */
  async checkAndUnlockFirstLike(
    deviceId: string,
  ): Promise<ApiResponse<Achievement | null>> {
    return apiCall(async () => {
      // 이미 해제되었는지 확인
      const hasAchievement = await this.hasAchievement(deviceId, 'first_like');
      if (hasAchievement.data) {
        return null;
      }

      // 첫 좋아요인지 확인
      const {count} = await supabase
        .from('likes')
        .select('*', {count: 'exact', head: true})
        .eq('device_id', deviceId)
        .eq('like_type', 'like');

      if (count === 1) {
        const result = await this.unlockAchievement(deviceId, 'first_like');
        return result.data;
      }

      return null;
    });
  }

  /**
   * 좋아요 받음 업적 체크 및 해제
   */
  async checkAndUnlockLikeReceived(
    deviceId: string,
  ): Promise<ApiResponse<Achievement | null>> {
    return apiCall(async () => {
      // 이미 해제되었는지 확인
      const hasAchievement = await this.hasAchievement(
        deviceId,
        'like_received',
      );
      if (hasAchievement.data) {
        return null;
      }

      // 본인 고해성사 ID 가져오기
      const {data: confessions} = await supabase
        .from('confessions')
        .select('id')
        .eq('device_id', deviceId);

      if (!confessions || confessions.length === 0) {
        return null;
      }

      const confessionIds = confessions.map(c => c.id);

      // 본인 고해성사에 좋아요가 있는지 확인
      const {count} = await supabase
        .from('likes')
        .select('*', {count: 'exact', head: true})
        .in('confession_id', confessionIds)
        .eq('like_type', 'like');

      if (count && count > 0) {
        const result = await this.unlockAchievement(deviceId, 'like_received');
        return result.data;
      }

      return null;
    });
  }

  /**
   * 7일 연속 업적 체크 및 해제
   */
  async checkAndUnlock7DayStreak(
    deviceId: string,
  ): Promise<ApiResponse<Achievement | null>> {
    return apiCall(async () => {
      // 이미 해제되었는지 확인
      const hasAchievement = await this.hasAchievement(deviceId, '7_day_streak');
      if (hasAchievement.data) {
        return null;
      }

      // 7일 연속 작성 확인 (간단한 로직)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const {data: recentConfessions} = await supabase
        .from('confessions')
        .select('created_at')
        .eq('device_id', deviceId)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', {ascending: false});

      if (!recentConfessions || recentConfessions.length < 7) {
        return null;
      }

      // 연속 7일인지 확인 (각 날짜별로 최소 1개씩)
      const dates = new Set(
        recentConfessions.map(c =>
          new Date(c.created_at).toISOString().split('T')[0],
        ),
      );

      if (dates.size >= 7) {
        const result = await this.unlockAchievement(deviceId, '7_day_streak');
        return result.data;
      }

      return null;
    });
  }
}

// Singleton instance
export const achievementService = new AchievementService();
