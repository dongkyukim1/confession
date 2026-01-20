/**
 * Discover Service
 *
 * 인기/트렌딩 고백 검색 및 발견 기능
 */
import {getSupabaseClient} from '../lib/supabase';
import {Confession} from '../types';
import {handleApiError, withRetry, validateRequired} from './api.utils';

export class DiscoverService {
  /**
   * 인기 고백 조회 (좋아요 수 기준)
   */
  static async getPopular(limit: number = 20): Promise<Confession[]> {
    try {
      const result = await withRetry(async () => {
        const supabase = await getSupabaseClient();
        const {data, error} = await supabase
          .from('confessions')
          .select('*')
          .eq('is_public', true) // 공개된 글만
          .order('like_count', {ascending: false, nullsFirst: false})
          .limit(limit);

        if (error) throw error;
        return data || [];
      });

      console.log('[DiscoverService] Got popular confessions:', result.length);
      return result.map(this.mapToConfession);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * 트렌딩 고백 조회 (최근 24시간 내 인기)
   */
  static async getTrending(hours: number = 24, limit: number = 20): Promise<Confession[]> {
    try {
      const result = await withRetry(async () => {
        const supabase = await getSupabaseClient();
        const cutoffTime = new Date();
        cutoffTime.setHours(cutoffTime.getHours() - hours);

        const {data, error} = await supabase
          .from('confessions')
          .select('*')
          .eq('is_public', true) // 공개된 글만
          .gte('created_at', cutoffTime.toISOString())
          .order('like_count', {ascending: false, nullsFirst: false})
          .order('view_count', {ascending: false, nullsFirst: false})
          .limit(limit);

        if (error) throw error;
        return data || [];
      });

      console.log('[DiscoverService] Got trending confessions:', result.length);
      return result.map(this.mapToConfession);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * 최신 고백 조회
   */
  static async getRecent(limit: number = 20): Promise<Confession[]> {
    try {
      const result = await withRetry(async () => {
        const supabase = await getSupabaseClient();
        const {data, error} = await supabase
          .from('confessions')
          .select('*')
          .eq('is_public', true) // 공개된 글만
          .order('created_at', {ascending: false})
          .limit(limit);

        if (error) throw error;
        return data || [];
      });

      console.log('[DiscoverService] Got recent confessions:', result.length);
      return result.map(this.mapToConfession);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * 무드별 고백 검색
   */
  static async searchByMood(mood: string, limit: number = 20): Promise<Confession[]> {
    try {
      validateRequired(mood, '무드');

      const result = await withRetry(async () => {
        const supabase = await getSupabaseClient();
        const {data, error} = await supabase
          .from('confessions')
          .select('*')
          .eq('is_public', true) // 공개된 글만
          .eq('mood', mood)
          .order('created_at', {ascending: false})
          .limit(limit);

        if (error) throw error;
        return data || [];
      });

      console.log('[DiscoverService] Got confessions by mood:', result.length);
      return result.map(this.mapToConfession);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * 태그별 고백 검색
   */
  static async searchByTag(tag: string, limit: number = 20): Promise<Confession[]> {
    try {
      validateRequired(tag, '태그');

      const result = await withRetry(async () => {
        const supabase = await getSupabaseClient();
        const {data, error} = await supabase
          .from('confessions')
          .select('*')
          .eq('is_public', true) // 공개된 글만
          .contains('tags', [tag])
          .order('created_at', {ascending: false})
          .limit(limit);

        if (error) throw error;
        return data || [];
      });

      console.log('[DiscoverService] Got confessions by tag:', result.length);
      return result.map(this.mapToConfession);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * 키워드 검색
   */
  static async searchByKeyword(keyword: string, limit: number = 20): Promise<Confession[]> {
    try {
      validateRequired(keyword, '검색어');

      const result = await withRetry(async () => {
        const supabase = await getSupabaseClient();
        const {data, error} = await supabase
          .from('confessions')
          .select('*')
          .eq('is_public', true) // 공개된 글만
          .ilike('content', `%${keyword}%`)
          .order('created_at', {ascending: false})
          .limit(limit);

        if (error) throw error;
        return data || [];
      });

      console.log('[DiscoverService] Got confessions by keyword:', result.length);
      return result.map(this.mapToConfession);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * 인기 태그 목록 조회
   */
  static async getPopularTags(limit: number = 10): Promise<string[]> {
    try {
      const result = await withRetry(async () => {
        const supabase = await getSupabaseClient();
        const {data, error} = await supabase
          .from('confessions')
          .select('tags')
          .eq('is_public', true) // 공개된 글만
          .not('tags', 'is', null);

        if (error) throw error;
        return data || [];
      });

      // 태그 빈도 계산
      const tagCounts: Record<string, number> = {};
      result.forEach((item: {tags: string[] | null}) => {
        item.tags?.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      // 빈도 순 정렬
      const sortedTags = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([tag]) => tag);

      console.log('[DiscoverService] Got popular tags:', sortedTags.length);
      return sortedTags;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * DB 데이터를 앱 타입으로 변환
   */
  private static mapToConfession(data: any): Confession {
    return {
      id: data.id,
      device_id: data.device_id,
      content: data.content,
      mood: data.mood,
      tags: data.tags || [],
      images: data.images || [],
      created_at: data.created_at,
      view_count: data.view_count || 0,
      like_count: data.like_count || 0,
      dislike_count: data.dislike_count || 0,
      report_count: data.report_count || 0,
    };
  }
}
