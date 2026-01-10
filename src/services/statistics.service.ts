/**
 * Statistics Service
 * 통계 관련 모든 데이터 작업을 추상화
 */

import {supabase} from '../lib/supabase';
import {apiCallWithRetry, ApiResponse} from './api.utils';
import {Confession} from './confession.service';

/**
 * 통계 데이터 타입
 */
export interface UserStatistics {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  totalWords: number;
  averageWordsPerEntry: number;
  mostUsedTags: Array<{tag: string; count: number}>;
  moodDistribution: Array<{mood: string; count: number}>;
  totalViews: number;
  totalLikes: number;
  totalDislikes: number;
}

export interface TimeBasedStatistics {
  entriesByHour: Array<{hour: number; count: number}>;
  entriesByDay: Array<{day: string; count: number}>;
  entriesByMonth: Array<{month: string; count: number}>;
}

/**
 * Statistics Service Class
 */
class StatisticsService {
  /**
   * 사용자 전체 통계 조회
   */
  async getUserStatistics(
    deviceId: string,
  ): Promise<ApiResponse<UserStatistics>> {
    return apiCallWithRetry(async () => {
      // 모든 고해성사 조회
      const {data: confessions, error} = await supabase
        .from('confessions')
        .select('*')
        .eq('device_id', deviceId)
        .order('created_at', {ascending: true});

      if (error) {
        throw error;
      }

      if (!confessions || confessions.length === 0) {
        return this.getEmptyStatistics();
      }

      // 총 단어 수 계산
      const totalWords = confessions.reduce(
        (sum, c) => sum + (c.content?.length || 0),
        0,
      );

      // 평균 단어 수
      const averageWordsPerEntry =
        confessions.length > 0 ? Math.round(totalWords / confessions.length) : 0;

      // 태그 사용 빈도
      const tagCounts = this.calculateTagFrequency(confessions);

      // 기분 분포
      const moodCounts = this.calculateMoodDistribution(confessions);

      // Streak 계산
      const {currentStreak, longestStreak} = this.calculateStreaks(confessions);

      // 총 조회수
      const totalViews = confessions.reduce(
        (sum, c) => sum + (c.view_count || 0),
        0,
      );

      // 좋아요/싫어요 통계 (본인 고해성사에 대한)
      const confessionIds = confessions.map(c => c.id);
      const {likes, dislikes} = await this.getLikesForConfessions(confessionIds);

      return {
        totalEntries: confessions.length,
        currentStreak,
        longestStreak,
        totalWords,
        averageWordsPerEntry,
        mostUsedTags: tagCounts,
        moodDistribution: moodCounts,
        totalViews,
        totalLikes: likes,
        totalDislikes: dislikes,
      };
    });
  }

  /**
   * 시간대별 통계 조회
   */
  async getTimeBasedStatistics(
    deviceId: string,
  ): Promise<ApiResponse<TimeBasedStatistics>> {
    return apiCallWithRetry(async () => {
      const {data: confessions, error} = await supabase
        .from('confessions')
        .select('created_at')
        .eq('device_id', deviceId);

      if (error) {
        throw error;
      }

      if (!confessions || confessions.length === 0) {
        return {
          entriesByHour: [],
          entriesByDay: [],
          entriesByMonth: [],
        };
      }

      // 시간대별 분포
      const entriesByHour = this.calculateEntriesByHour(confessions);

      // 요일별 분포
      const entriesByDay = this.calculateEntriesByDay(confessions);

      // 월별 분포
      const entriesByMonth = this.calculateEntriesByMonth(confessions);

      return {
        entriesByHour,
        entriesByDay,
        entriesByMonth,
      };
    });
  }

  /**
   * 빈 통계 객체 반환
   */
  private getEmptyStatistics(): UserStatistics {
    return {
      totalEntries: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalWords: 0,
      averageWordsPerEntry: 0,
      mostUsedTags: [],
      moodDistribution: [],
      totalViews: 0,
      totalLikes: 0,
      totalDislikes: 0,
    };
  }

  /**
   * 태그 사용 빈도 계산
   */
  private calculateTagFrequency(
    confessions: Confession[],
  ): Array<{tag: string; count: number}> {
    const tagMap = new Map<string, number>();

    confessions.forEach(confession => {
      if (confession.tags && Array.isArray(confession.tags)) {
        confession.tags.forEach(tag => {
          tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
        });
      }
    });

    return Array.from(tagMap.entries())
      .map(([tag, count]) => ({tag, count}))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // 상위 10개만
  }

  /**
   * 기분 분포 계산
   */
  private calculateMoodDistribution(
    confessions: Confession[],
  ): Array<{mood: string; count: number}> {
    const moodMap = new Map<string, number>();

    confessions.forEach(confession => {
      if (confession.mood) {
        moodMap.set(confession.mood, (moodMap.get(confession.mood) || 0) + 1);
      }
    });

    return Array.from(moodMap.entries())
      .map(([mood, count]) => ({mood, count}))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Streak 계산 (연속 작성 일수)
   */
  private calculateStreaks(confessions: Confession[]): {
    currentStreak: number;
    longestStreak: number;
  } {
    if (confessions.length === 0) {
      return {currentStreak: 0, longestStreak: 0};
    }

    // 날짜별로 그룹화
    const dates = confessions.map(c =>
      new Date(c.created_at).toISOString().split('T')[0],
    );

    const uniqueDates = [...new Set(dates)].sort();

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split('T')[0];

    // 현재 Streak 계산
    if (uniqueDates[uniqueDates.length - 1] === today) {
      currentStreak = 1;
      for (let i = uniqueDates.length - 2; i >= 0; i--) {
        const diff = this.getDayDifference(uniqueDates[i], uniqueDates[i + 1]);
        if (diff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    } else if (uniqueDates[uniqueDates.length - 1] === yesterday) {
      currentStreak = 1;
      for (let i = uniqueDates.length - 2; i >= 0; i--) {
        const diff = this.getDayDifference(uniqueDates[i], uniqueDates[i + 1]);
        if (diff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // 최장 Streak 계산
    for (let i = 1; i < uniqueDates.length; i++) {
      const diff = this.getDayDifference(uniqueDates[i - 1], uniqueDates[i]);
      if (diff === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    return {currentStreak, longestStreak};
  }

  /**
   * 두 날짜 간의 일수 차이 계산
   */
  private getDayDifference(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * 특정 고해성사들의 좋아요/싫어요 수 조회
   */
  private async getLikesForConfessions(
    confessionIds: string[],
  ): Promise<{likes: number; dislikes: number}> {
    if (confessionIds.length === 0) {
      return {likes: 0, dislikes: 0};
    }

    const {count: likes} = await supabase
      .from('likes')
      .select('*', {count: 'exact', head: true})
      .in('confession_id', confessionIds)
      .eq('like_type', 'like');

    const {count: dislikes} = await supabase
      .from('likes')
      .select('*', {count: 'exact', head: true})
      .in('confession_id', confessionIds)
      .eq('like_type', 'dislike');

    return {
      likes: likes || 0,
      dislikes: dislikes || 0,
    };
  }

  /**
   * 시간대별 작성 빈도 계산
   */
  private calculateEntriesByHour(
    confessions: Array<{created_at: string}>,
  ): Array<{hour: number; count: number}> {
    const hourMap = new Map<number, number>();

    confessions.forEach(confession => {
      const hour = new Date(confession.created_at).getHours();
      hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
    });

    // 0-23시까지 모든 시간 포함
    const result: Array<{hour: number; count: number}> = [];
    for (let i = 0; i < 24; i++) {
      result.push({hour: i, count: hourMap.get(i) || 0});
    }

    return result;
  }

  /**
   * 요일별 작성 빈도 계산
   */
  private calculateEntriesByDay(
    confessions: Array<{created_at: string}>,
  ): Array<{day: string; count: number}> {
    const dayMap = new Map<string, number>();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

    confessions.forEach(confession => {
      const dayIndex = new Date(confession.created_at).getDay();
      const dayName = dayNames[dayIndex];
      dayMap.set(dayName, (dayMap.get(dayName) || 0) + 1);
    });

    return dayNames.map(day => ({
      day,
      count: dayMap.get(day) || 0,
    }));
  }

  /**
   * 월별 작성 빈도 계산
   */
  private calculateEntriesByMonth(
    confessions: Array<{created_at: string}>,
  ): Array<{month: string; count: number}> {
    const monthMap = new Map<string, number>();

    confessions.forEach(confession => {
      const date = new Date(confession.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
    });

    return Array.from(monthMap.entries())
      .map(([month, count]) => ({month, count}))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * 일일 통계 조회 (홈 화면용)
   */
  async getDailyStatistics(deviceId: string): Promise<
    ApiResponse<{
      todayCount: number;
      totalCount: number;
      viewedCount: number;
    }>
  > {
    return apiCallWithRetry(async () => {
      const today = new Date().toISOString().split('T')[0];

      // 오늘 작성한 고해성사 수
      const {count: todayCount} = await supabase
        .from('confessions')
        .select('*', {count: 'exact', head: true})
        .eq('device_id', deviceId)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);

      // 총 고해성사 수
      const {count: totalCount} = await supabase
        .from('confessions')
        .select('*', {count: 'exact', head: true})
        .eq('device_id', deviceId);

      // 조회한 고해성사 수 (본인이 좋아요/싫어요한 수)
      const {count: viewedCount} = await supabase
        .from('likes')
        .select('*', {count: 'exact', head: true})
        .eq('device_id', deviceId);

      return {
        todayCount: todayCount || 0,
        totalCount: totalCount || 0,
        viewedCount: viewedCount || 0,
      };
    });
  }
}

// Singleton instance
export const statisticsService = new StatisticsService();
