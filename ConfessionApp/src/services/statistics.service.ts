/**
 * Statistics Service
 * 
 * 통계 관련 비즈니스 로직을 처리합니다.
 */
import {supabase} from '../lib/supabase';
import {handleApiError, withRetry, validateRequired} from './api.utils';

export interface UserStatistics {
  totalConfessions: number;
  totalViewed: number;
  currentStreak: number;
  longestStreak: number;
  favoriteWeekday: string;
  favoriteTime: string;
  moodDistribution: Record<string, number>;
  tagCloud: Array<{tag: string; count: number}>;
  weeklyActivity: Array<{date: string; count: number}>;
}

export class StatisticsService {
  /**
   * 사용자 통계 조회
   */
  static async getUserStatistics(deviceId: string): Promise<UserStatistics> {
    try {
      validateRequired(deviceId, '기기 ID');

      const [confessions, views] = await Promise.all([
        this.getConfessions(deviceId),
        this.getViews(deviceId),
      ]);

      // 기본 통계
      const totalConfessions = confessions.length;
      const totalViewed = views.length;

      // 연속 작성 일수 계산
      const {currentStreak, longestStreak} = this.calculateStreaks(confessions);

      // 선호 요일 및 시간대
      const favoriteWeekday = this.calculateFavoriteWeekday(confessions);
      const favoriteTime = this.calculateFavoriteTime(confessions);

      // 기분 분포
      const moodDistribution = this.calculateMoodDistribution(confessions);

      // 태그 클라우드
      const tagCloud = this.calculateTagCloud(confessions);

      // 주간 활동
      const weeklyActivity = this.calculateWeeklyActivity(confessions);

      const statistics: UserStatistics = {
        totalConfessions,
        totalViewed,
        currentStreak,
        longestStreak,
        favoriteWeekday,
        favoriteTime,
        moodDistribution,
        tagCloud,
        weeklyActivity,
      };

      console.log('[StatisticsService] Calculated statistics:', statistics);
      return statistics;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * 고백 데이터 조회
   */
  private static async getConfessions(
    deviceId: string,
  ): Promise<Array<{created_at: string; mood: string; tags: string[]}>> {
    const result = await withRetry(async () => {
      const {data, error} = await supabase
        .from('confessions')
        .select('created_at, mood, tags')
        .eq('device_id', deviceId)
        .order('created_at', {ascending: false});

      if (error) throw error;
      return data || [];
    });

    return result;
  }

  /**
   * 조회 데이터 조회
   */
  private static async getViews(
    deviceId: string,
  ): Promise<Array<{viewed_at: string}>> {
    const result = await withRetry(async () => {
      const {data, error} = await supabase
        .from('confession_views')
        .select('viewed_at')
        .eq('viewer_device_id', deviceId)
        .order('viewed_at', {ascending: false});

      if (error) throw error;
      return data || [];
    });

    return result;
  }

  /**
   * 연속 작성 일수 계산
   */
  private static calculateStreaks(
    confessions: Array<{created_at: string}>,
  ): {currentStreak: number; longestStreak: number} {
    if (confessions.length === 0) {
      return {currentStreak: 0, longestStreak: 0};
    }

    // 날짜별로 그룹화
    const dates = confessions
      .map(c => new Date(c.created_at).toDateString())
      .sort()
      .reverse();

    const uniqueDates = Array.from(new Set(dates));

    // 현재 연속 일수
    let currentStreak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
      currentStreak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i - 1]);
        const currDate = new Date(uniqueDates[i]);
        const diffDays = Math.floor(
          (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // 최장 연속 일수
    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currDate = new Date(uniqueDates[i]);
      const diffDays = Math.floor(
        (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return {currentStreak, longestStreak};
  }

  /**
   * 선호 요일 계산
   */
  private static calculateFavoriteWeekday(
    confessions: Array<{created_at: string}>,
  ): string {
    if (confessions.length === 0) return '데이터 없음';

    const weekdayCounts: Record<string, number> = {};
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

    confessions.forEach(c => {
      const date = new Date(c.created_at);
      const weekday = weekdays[date.getDay()];
      weekdayCounts[weekday] = (weekdayCounts[weekday] || 0) + 1;
    });

    const favorite = Object.entries(weekdayCounts).sort((a, b) => b[1] - a[1])[0];
    return favorite ? `${favorite[0]}요일` : '데이터 없음';
  }

  /**
   * 선호 시간대 계산
   */
  private static calculateFavoriteTime(
    confessions: Array<{created_at: string}>,
  ): string {
    if (confessions.length === 0) return '데이터 없음';

    const timeCounts: Record<string, number> = {};
    const timeSlots = ['새벽', '오전', '오후', '저녁', '밤'];

    confessions.forEach(c => {
      const date = new Date(c.created_at);
      const hour = date.getHours();
      let slot: string;

      if (hour >= 0 && hour < 6) slot = '새벽';
      else if (hour >= 6 && hour < 12) slot = '오전';
      else if (hour >= 12 && hour < 18) slot = '오후';
      else if (hour >= 18 && hour < 22) slot = '저녁';
      else slot = '밤';

      timeCounts[slot] = (timeCounts[slot] || 0) + 1;
    });

    const favorite = Object.entries(timeCounts).sort((a, b) => b[1] - a[1])[0];
    return favorite ? favorite[0] : '데이터 없음';
  }

  /**
   * 기분 분포 계산
   */
  private static calculateMoodDistribution(
    confessions: Array<{mood: string}>,
  ): Record<string, number> {
    const distribution: Record<string, number> = {};

    confessions.forEach(c => {
      distribution[c.mood] = (distribution[c.mood] || 0) + 1;
    });

    return distribution;
  }

  /**
   * 태그 클라우드 계산
   */
  private static calculateTagCloud(
    confessions: Array<{tags: string[]}>,
  ): Array<{tag: string; count: number}> {
    const tagCounts: Record<string, number> = {};

    confessions.forEach(c => {
      if (Array.isArray(c.tags)) {
        c.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    return Object.entries(tagCounts)
      .map(([tag, count]) => ({tag, count}))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * 주간 활동 계산 (최근 7일)
   */
  private static calculateWeeklyActivity(
    confessions: Array<{created_at: string}>,
  ): Array<{date: string; count: number}> {
    const activity: Array<{date: string; count: number}> = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const count = confessions.filter(c => {
        const confessionDate = new Date(c.created_at).toISOString().split('T')[0];
        return confessionDate === dateStr;
      }).length;

      activity.push({date: dateStr, count});
    }

    return activity;
  }
}
