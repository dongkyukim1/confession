/**
 * Confession Service
 *
 * 고백 관련 비즈니스 로직을 처리합니다.
 */
import {supabase} from '../lib/supabase';
import {Confession, NewConfession, ViewedConfession} from '../types';
import {handleApiError, withRetry, validateRequired} from './api.utils';
import {StreakService} from './streak.service';
import {MissionService} from './mission.service';

export class ConfessionService {
  /**
   * 새로운 고백 작성
   */
  static async createConfession(
    deviceId: string,
    data: NewConfession,
  ): Promise<Confession> {
    try {
      validateRequired(deviceId, '기기 ID');
      validateRequired(data.content, '내용');
      validateRequired(data.mood, '기분');

      const confessionData = {
        device_id: deviceId,
        content: data.content,
        mood: data.mood,
        tags: data.tags || [],
        images: data.images || [],
        is_anonymous: data.isAnonymous ?? true,
        created_at: new Date().toISOString(),
      };

      const result = await withRetry(async () => {
        const {data: confession, error} = await supabase
          .from('confessions')
          .insert([confessionData])
          .select()
          .single();

        if (error) throw error;
        if (!confession) throw new Error('고백 생성에 실패했습니다');

        return confession;
      });

      console.log('[ConfessionService] Created confession:', result.id);

      // 스트릭 업데이트
      try {
        await StreakService.updateStreakOnConfession(deviceId);
      } catch (streakError) {
        console.warn('[ConfessionService] Failed to update streak:', streakError);
      }

      // 미션 진행도 업데이트
      try {
        await MissionService.onConfessionCreated(deviceId, {
          hasMood: !!data.mood,
          hasTags: data.tags && data.tags.length > 0,
          hasImages: data.images && data.images.length > 0,
          contentLength: data.content.length,
        });
      } catch (missionError) {
        console.warn('[ConfessionService] Failed to update missions:', missionError);
      }

      return this.mapToConfession(result);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * 랜덤 고백 조회 (본인 제외)
   */
  static async getRandomConfession(deviceId: string): Promise<Confession | null> {
    try {
      validateRequired(deviceId, '기기 ID');

      const result = await withRetry(async () => {
        // 1단계: 이미 본 고백 ID 목록 조회 (파라미터화된 쿼리)
        const {data: viewedData} = await supabase
          .from('confession_views')
          .select('confession_id')
          .eq('viewer_device_id', deviceId);

        const viewedIds = viewedData?.map(v => v.confession_id) || [];

        // 2단계: 본인이 작성하지 않고, 아직 보지 않은 고백 조회
        let query = supabase
          .from('confessions')
          .select('*')
          .neq('device_id', deviceId)
          .order('created_at', {ascending: false})
          .limit(10);

        // 이미 본 고백 제외 (배열이 비어있지 않을 때만)
        if (viewedIds.length > 0) {
          query = query.not('id', 'in', `(${viewedIds.join(',')})`);
        }

        const {data: confessions, error} = await query;

        if (error) throw error;
        return confessions;
      });

      if (!result || result.length === 0) {
        return null;
      }

      // 랜덤 선택
      const randomIndex = Math.floor(Math.random() * result.length);
      const confession = result[randomIndex];

      console.log('[ConfessionService] Got random confession:', confession.id);
      return this.mapToConfession(confession);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * 고백 조회 기록
   */
  static async markAsViewed(
    confessionId: string,
    viewerDeviceId: string,
  ): Promise<void> {
    try {
      validateRequired(confessionId, '고백 ID');
      validateRequired(viewerDeviceId, '기기 ID');

      await withRetry(async () => {
        const {error} = await supabase.from('confession_views').insert([
          {
            confession_id: confessionId,
            viewer_device_id: viewerDeviceId,
            viewed_at: new Date().toISOString(),
          },
        ]);

        if (error) throw error;
      });

      console.log('[ConfessionService] Marked as viewed:', confessionId);

      // 미션 진행도 업데이트 (고백 읽기)
      try {
        await MissionService.onConfessionRead(viewerDeviceId);
      } catch (missionError) {
        console.warn('[ConfessionService] Failed to update read mission:', missionError);
      }
    } catch (error) {
      // 이미 조회한 경우 무시 (중복 키 에러)
      if (error.code === '23505') {
        console.log('[ConfessionService] Already viewed:', confessionId);
        return;
      }
      throw handleApiError(error);
    }
  }

  /**
   * 내가 작성한 고백 목록 조회
   */
  static async getMyConfessions(
    deviceId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<Confession[]> {
    try {
      validateRequired(deviceId, '기기 ID');

      const result = await withRetry(async () => {
        const {data, error} = await supabase
          .from('confessions')
          .select('*')
          .eq('device_id', deviceId)
          .order('created_at', {ascending: false})
          .range(offset, offset + limit - 1);

        if (error) throw error;
        return data || [];
      });

      console.log('[ConfessionService] Got my confessions:', result.length);
      return result.map(this.mapToConfession);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * 내가 본 고백 목록 조회
   * viewed_confessions 테이블 사용 (통일된 테이블)
   */
  static async getViewedConfessions(
    deviceId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<ViewedConfession[]> {
    try {
      validateRequired(deviceId, '기기 ID');

      const result = await withRetry(async () => {
        const {data, error} = await supabase
          .from('viewed_confessions')
          .select(`
            id,
            device_id,
            confession_id,
            viewed_at,
            confession:confessions(*)
          `)
          .eq('device_id', deviceId)
          .order('viewed_at', {ascending: false})
          .range(offset, offset + limit - 1);

        if (error) throw error;
        return data || [];
      });

      console.log('[ConfessionService] Got viewed confessions:', result.length);

      return result as ViewedConfession[];
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * 고백 삭제
   */
  static async deleteConfession(
    confessionId: string,
    deviceId: string,
  ): Promise<void> {
    try {
      validateRequired(confessionId, '고백 ID');
      validateRequired(deviceId, '기기 ID');

      await withRetry(async () => {
        // 본인이 작성한 고백만 삭제 가능
        const {error} = await supabase
          .from('confessions')
          .delete()
          .eq('id', confessionId)
          .eq('device_id', deviceId);

        if (error) throw error;
      });

      console.log('[ConfessionService] Deleted confession:', confessionId);
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
      deviceId: data.device_id,
      content: data.content,
      mood: data.mood,
      tags: data.tags || [],
      images: data.images || [],
      isAnonymous: data.is_anonymous ?? true,
      createdAt: new Date(data.created_at),
      viewCount: data.view_count || 0,
    };
  }
}
