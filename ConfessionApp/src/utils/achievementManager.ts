/**
 * 업적 관리 유틸리티
 * 
 * 게이미피케이션 업적 해제 및 조회 로직
 */
import {supabase} from '../lib/supabase';
import {AchievementType, Achievement} from '../types/database';
import {calculateStreak} from './statistics';
import {Confession} from '../types';

/**
 * 특정 업적이 이미 해제되었는지 확인
 */
export const hasUnlockedAchievement = async (
  deviceId: string,
  achievementType: AchievementType,
): Promise<boolean> => {
  try {
    const {data, error} = await supabase
      .from('user_achievements')
      .select('id')
      .eq('device_id', deviceId)
      .eq('achievement_type', achievementType)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = 결과 없음 (정상)
      console.error('업적 확인 오류:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('업적 확인 예외:', error);
    return false;
  }
};

/**
 * 업적 해제 (조건 확인 후 unlock)
 */
export const checkAndUnlockAchievement = async (
  deviceId: string,
  achievementType: AchievementType,
): Promise<Achievement | null> => {
  try {
    // 이미 해제된 업적인지 확인
    const alreadyUnlocked = await hasUnlockedAchievement(deviceId, achievementType);
    if (alreadyUnlocked) {
      return null;
    }

    // 업적 타입별 조건 확인
    const canUnlock = await checkAchievementCondition(deviceId, achievementType);
    if (!canUnlock) {
      return null;
    }

    // 업적 해제
    const {data, error} = await supabase
      .from('user_achievements')
      .insert({
        device_id: deviceId,
        achievement_type: achievementType,
        viewed: false,
      })
      .select()
      .single();

    if (error) {
      console.error('업적 해제 오류:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('업적 해제 예외:', error);
    return null;
  }
};

/**
 * 업적 달성 조건 확인
 */
const checkAchievementCondition = async (
  deviceId: string,
  achievementType: AchievementType,
): Promise<boolean> => {
  try {
    switch (achievementType) {
      case 'first_post': {
        // 첫 글 작성: 총 글 개수가 1개인지 확인
        const {count, error} = await supabase
          .from('confessions')
          .select('*', {count: 'exact', head: true})
          .eq('device_id', deviceId);

        if (error) throw error;
        return count === 1;
      }

      case 'first_like': {
        // 첫 좋아요 받기: 이 조건은 외부에서 직접 체크하므로 여기서는 true 반환
        // (RevealScreen에서 like_count === 1일 때 호출됨)
        return true;
      }

      case 'like_received': {
        // 좋아요 받을 때마다: 항상 true (애니메이션만 표시)
        return true;
      }

      case '7_day_streak': {
        // 7일 연속 작성: calculateStreak로 확인
        const {data: entries, error} = await supabase
          .from('confessions')
          .select('id, created_at, content, device_id, view_count, mood, images, tags')
          .eq('device_id', deviceId)
          .order('created_at', {ascending: false});

        if (error) throw error;
        if (!entries || entries.length === 0) return false;

        const {current} = calculateStreak(entries as Confession[]);
        return current >= 7;
      }

      default:
        return false;
    }
  } catch (error) {
    console.error('업적 조건 확인 오류:', error);
    return false;
  }
};

/**
 * 미확인 업적 조회
 */
export const getUnviewedAchievements = async (
  deviceId: string,
): Promise<Achievement[]> => {
  try {
    const {data, error} = await supabase
      .from('user_achievements')
      .select('*')
      .eq('device_id', deviceId)
      .eq('viewed', false)
      .order('unlocked_at', {ascending: false});

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('미확인 업적 조회 오류:', error);
    return [];
  }
};

/**
 * 업적을 확인 완료로 표시
 */
export const markAchievementAsViewed = async (
  achievementId: string,
): Promise<boolean> => {
  try {
    const {error} = await supabase
      .from('user_achievements')
      .update({viewed: true})
      .eq('id', achievementId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('업적 확인 표시 오류:', error);
    return false;
  }
};

/**
 * 모든 업적 조회 (프로필/통계용)
 */
export const getAllAchievements = async (
  deviceId: string,
): Promise<Achievement[]> => {
  try {
    const {data, error} = await supabase
      .from('user_achievements')
      .select('*')
      .eq('device_id', deviceId)
      .order('unlocked_at', {ascending: false});

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('업적 조회 오류:', error);
    return [];
  }
};

/**
 * 7일 연속 작성 업적 체크 (글 작성 후 호출)
 */
export const checkStreakAchievement = async (
  deviceId: string,
): Promise<Achievement | null> => {
  return checkAndUnlockAchievement(deviceId, '7_day_streak');
};

