/**
 * Statistics Query Hooks
 * 
 * React Query를 사용한 통계 데이터 관리
 */
import {useQuery} from '@tanstack/react-query';
import {StatisticsService} from '../services/statistics.service';
import {queryKeys} from '../lib/queryClient';

/**
 * 사용자 통계 조회
 */
export function useStatistics(deviceId: string) {
  return useQuery({
    queryKey: queryKeys.statistics.user(deviceId),
    queryFn: () => StatisticsService.getUserStatistics(deviceId),
    enabled: !!deviceId,
    staleTime: 60 * 1000, // 1분간 캐시 유지
  });
}
