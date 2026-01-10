/**
 * Confession Service
 * 고해성사 관련 모든 데이터 작업을 추상화
 */

import {supabase} from '../lib/supabase';
import {
  apiCall,
  apiCallWithRetry,
  ApiResponse,
  calculatePagination,
  PaginatedResponse,
} from './api.utils';

/**
 * 고해성사 타입
 */
export interface Confession {
  id: string;
  content: string;
  device_id: string;
  created_at: string;
  view_count: number;
  mood?: string;
  images?: string[];
  tags?: string[];
  like_count?: number;
  dislike_count?: number;
  report_count?: number;
}

/**
 * 고해성사 생성 데이터
 */
export interface CreateConfessionData {
  content: string;
  device_id: string;
  mood?: string;
  images?: string[];
  tags?: string[];
}

/**
 * 좋아요/싫어요 타입
 */
export type LikeType = 'like' | 'dislike';

export interface Like {
  id: string;
  device_id: string;
  confession_id: string;
  like_type: LikeType;
  created_at: string;
}

/**
 * 신고 사유
 */
export type ReportReason =
  | 'offensive'
  | 'sexual'
  | 'spam'
  | 'violence'
  | 'other';

export interface Report {
  id: string;
  device_id: string;
  confession_id: string;
  reason: ReportReason;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}

/**
 * Confession Service Class
 */
class ConfessionService {
  /**
   * 모든 고해성사 조회 (페이지네이션)
   */
  async getAllConfessions(
    page = 0,
    limit = 20,
  ): Promise<ApiResponse<PaginatedResponse<Confession>>> {
    return apiCallWithRetry(async () => {
      const {from, to} = calculatePagination(page, limit);

      // 총 개수 조회
      const {count} = await supabase
        .from('confessions')
        .select('*', {count: 'exact', head: true});

      // 데이터 조회
      const {data, error} = await supabase
        .from('confessions')
        .select('*')
        .order('created_at', {ascending: false})
        .range(from, to);

      if (error) {
        throw error;
      }

      return {
        data: data || [],
        page,
        limit,
        total: count || 0,
        hasMore: (count || 0) > to + 1,
      };
    });
  }

  /**
   * 특정 고해성사 조회
   */
  async getConfessionById(id: string): Promise<ApiResponse<Confession>> {
    return apiCallWithRetry(async () => {
      const {data, error} = await supabase
        .from('confessions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    });
  }

  /**
   * 랜덤 고해성사 조회
   */
  async getRandomConfession(
    deviceId: string,
  ): Promise<ApiResponse<Confession>> {
    return apiCallWithRetry(async () => {
      // 본인 고해성사 제외
      const {data, error} = await supabase
        .from('confessions')
        .select('*')
        .neq('device_id', deviceId)
        .order('created_at', {ascending: false})
        .limit(100);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('고해성사를 찾을 수 없습니다.');
      }

      // 클라이언트에서 랜덤 선택
      const randomIndex = Math.floor(Math.random() * data.length);
      return data[randomIndex];
    });
  }

  /**
   * 내 고해성사 조회 (페이지네이션)
   */
  async getMyConfessions(
    deviceId: string,
    page = 0,
    limit = 20,
  ): Promise<ApiResponse<PaginatedResponse<Confession>>> {
    return apiCallWithRetry(async () => {
      const {from, to} = calculatePagination(page, limit);

      // 총 개수 조회
      const {count} = await supabase
        .from('confessions')
        .select('*', {count: 'exact', head: true})
        .eq('device_id', deviceId);

      // 데이터 조회
      const {data, error} = await supabase
        .from('confessions')
        .select('*')
        .eq('device_id', deviceId)
        .order('created_at', {ascending: false})
        .range(from, to);

      if (error) {
        throw error;
      }

      return {
        data: data || [],
        page,
        limit,
        total: count || 0,
        hasMore: (count || 0) > to + 1,
      };
    });
  }

  /**
   * 태그로 필터링된 내 고해성사 조회
   */
  async getMyConfessionsByTag(
    deviceId: string,
    tag: string,
  ): Promise<ApiResponse<Confession[]>> {
    return apiCallWithRetry(async () => {
      const {data, error} = await supabase
        .from('confessions')
        .select('*')
        .eq('device_id', deviceId)
        .contains('tags', [tag])
        .order('created_at', {ascending: false});

      if (error) {
        throw error;
      }

      return data || [];
    });
  }

  /**
   * 고해성사 생성
   */
  async createConfession(
    confessionData: CreateConfessionData,
  ): Promise<ApiResponse<Confession>> {
    return apiCall(async () => {
      // 유효성 검사
      if (!confessionData.content || confessionData.content.trim().length === 0) {
        throw new Error('내용을 입력해주세요.');
      }

      if (confessionData.content.length > 500) {
        throw new Error('내용은 500자 이내로 작성해주세요.');
      }

      const {data, error} = await supabase
        .from('confessions')
        .insert([confessionData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    });
  }

  /**
   * 고해성사 삭제
   */
  async deleteConfession(
    id: string,
    deviceId: string,
  ): Promise<ApiResponse<void>> {
    return apiCall(async () => {
      // 본인 고해성사만 삭제 가능
      const {error} = await supabase
        .from('confessions')
        .delete()
        .eq('id', id)
        .eq('device_id', deviceId);

      if (error) {
        throw error;
      }
    });
  }

  /**
   * 조회수 증가
   */
  async incrementViewCount(id: string): Promise<ApiResponse<void>> {
    return apiCall(async () => {
      const {error} = await supabase.rpc('increment_view_count', {
        confession_id: id,
      });

      if (error) {
        // RPC 함수가 없을 경우 수동으로 증가
        const {data: current} = await supabase
          .from('confessions')
          .select('view_count')
          .eq('id', id)
          .single();

        const newCount = (current?.view_count || 0) + 1;

        const {error: updateError} = await supabase
          .from('confessions')
          .update({view_count: newCount})
          .eq('id', id);

        if (updateError) {
          throw updateError;
        }
      }
    });
  }

  /**
   * 좋아요/싫어요 추가
   */
  async addLike(
    confessionId: string,
    deviceId: string,
    likeType: LikeType,
  ): Promise<ApiResponse<Like>> {
    return apiCall(async () => {
      // 기존 좋아요/싫어요 확인
      const {data: existing} = await supabase
        .from('likes')
        .select('*')
        .eq('confession_id', confessionId)
        .eq('device_id', deviceId)
        .single();

      // 이미 존재하면 삭제 후 새로 추가 (토글 방식)
      if (existing) {
        await supabase
          .from('likes')
          .delete()
          .eq('confession_id', confessionId)
          .eq('device_id', deviceId);

        // 같은 타입이면 삭제만 하고 종료
        if (existing.like_type === likeType) {
          return existing;
        }
      }

      // 새로운 좋아요/싫어요 추가
      const {data, error} = await supabase
        .from('likes')
        .insert([
          {
            confession_id: confessionId,
            device_id: deviceId,
            like_type: likeType,
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
   * 좋아요/싫어요 상태 조회
   */
  async getLikeStatus(
    confessionId: string,
    deviceId: string,
  ): Promise<ApiResponse<LikeType | null>> {
    return apiCallWithRetry(async () => {
      const {data, error} = await supabase
        .from('likes')
        .select('like_type')
        .eq('confession_id', confessionId)
        .eq('device_id', deviceId)
        .single();

      if (error) {
        // 데이터가 없을 경우는 에러가 아님
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data?.like_type || null;
    });
  }

  /**
   * 좋아요/싫어요 개수 조회
   */
  async getLikeCounts(
    confessionId: string,
  ): Promise<ApiResponse<{likes: number; dislikes: number}>> {
    return apiCallWithRetry(async () => {
      const {data: likes} = await supabase
        .from('likes')
        .select('*', {count: 'exact', head: true})
        .eq('confession_id', confessionId)
        .eq('like_type', 'like');

      const {data: dislikes} = await supabase
        .from('likes')
        .select('*', {count: 'exact', head: true})
        .eq('confession_id', confessionId)
        .eq('like_type', 'dislike');

      return {
        likes: likes || 0,
        dislikes: dislikes || 0,
      };
    });
  }

  /**
   * 신고 추가
   */
  async reportConfession(
    confessionId: string,
    deviceId: string,
    reason: ReportReason,
    description?: string,
  ): Promise<ApiResponse<Report>> {
    return apiCall(async () => {
      // 중복 신고 확인
      const {data: existing} = await supabase
        .from('reports')
        .select('*')
        .eq('confession_id', confessionId)
        .eq('device_id', deviceId)
        .single();

      if (existing) {
        throw new Error('이미 신고한 고해성사입니다.');
      }

      // 신고 추가
      const {data, error} = await supabase
        .from('reports')
        .insert([
          {
            confession_id: confessionId,
            device_id: deviceId,
            reason,
            description,
            status: 'pending',
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
   * 본인이 조회한 고해성사 목록
   * (likes 테이블에서 본인이 반응한 confession_id 추출)
   */
  async getViewedConfessions(
    deviceId: string,
    page = 0,
    limit = 20,
  ): Promise<ApiResponse<PaginatedResponse<Confession>>> {
    return apiCallWithRetry(async () => {
      const {from, to} = calculatePagination(page, limit);

      // 본인이 좋아요/싫어요한 confession_id 조회
      const {data: likedIds, error: likeError} = await supabase
        .from('likes')
        .select('confession_id')
        .eq('device_id', deviceId);

      if (likeError) {
        throw likeError;
      }

      const confessionIds = [
        ...new Set(likedIds?.map(l => l.confession_id) || []),
      ];

      if (confessionIds.length === 0) {
        return {
          data: [],
          page,
          limit,
          total: 0,
          hasMore: false,
        };
      }

      // 해당 고해성사들 조회
      const {data, error, count} = await supabase
        .from('confessions')
        .select('*', {count: 'exact'})
        .in('id', confessionIds)
        .order('created_at', {ascending: false})
        .range(from, to);

      if (error) {
        throw error;
      }

      return {
        data: data || [],
        page,
        limit,
        total: count || 0,
        hasMore: (count || 0) > to + 1,
      };
    });
  }
}

// Singleton instance
export const confessionService = new ConfessionService();
