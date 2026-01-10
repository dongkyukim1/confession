/**
 * Confession Query Hooks
 * 
 * React Query를 사용한 고백 데이터 관리
 */
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {ConfessionService} from '../services/confession.service';
import {Confession, NewConfession} from '../types';
import {queryKeys} from '../lib/queryClient';

/**
 * 내 고백 목록 조회
 */
export function useMyConfessions(deviceId: string, limit: number = 20) {
  return useQuery({
    queryKey: queryKeys.confessions.my(deviceId),
    queryFn: () => ConfessionService.getMyConfessions(deviceId, limit),
    enabled: !!deviceId,
  });
}

/**
 * 조회한 고백 목록 조회
 */
export function useViewedConfessions(deviceId: string, limit: number = 20) {
  return useQuery({
    queryKey: queryKeys.confessions.viewed(deviceId),
    queryFn: () => ConfessionService.getViewedConfessions(deviceId, limit),
    enabled: !!deviceId,
  });
}

/**
 * 랜덤 고백 조회
 */
export function useRandomConfession(deviceId: string) {
  return useQuery({
    queryKey: queryKeys.confessions.random(deviceId),
    queryFn: () => ConfessionService.getRandomConfession(deviceId),
    enabled: !!deviceId,
    staleTime: 0, // 항상 새로운 랜덤 고백을 가져오기 위해
  });
}

/**
 * 고백 작성
 */
export function useCreateConfession(deviceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NewConfession) =>
      ConfessionService.createConfession(deviceId, data),
    onSuccess: (newConfession: Confession) => {
      // 내 고백 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.confessions.my(deviceId),
      });

      // 통계 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.statistics.user(deviceId),
      });

      console.log('[useCreateConfession] Confession created:', newConfession.id);
    },
  });
}

/**
 * 고백 조회 기록
 */
export function useMarkAsViewed(deviceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (confessionId: string) =>
      ConfessionService.markAsViewed(confessionId, deviceId),
    onSuccess: () => {
      // 조회한 고백 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.confessions.viewed(deviceId),
      });

      // 통계 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.statistics.user(deviceId),
      });
    },
  });
}

/**
 * 고백 삭제
 */
export function useDeleteConfession(deviceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (confessionId: string) =>
      ConfessionService.deleteConfession(confessionId, deviceId),
    onSuccess: () => {
      // 내 고백 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.confessions.my(deviceId),
      });

      // 통계 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.statistics.user(deviceId),
      });
    },
  });
}
