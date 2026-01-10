/**
 * React Query 설정
 * 
 * 데이터 캐싱, 동기화, 서버 상태 관리
 */
import {QueryClient} from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 기본 캐시 시간: 5분
      gcTime: 5 * 60 * 1000,
      
      // 데이터가 stale 되는 시간: 30초
      staleTime: 30 * 1000,
      
      // 에러 시 재시도: 3번
      retry: 3,
      
      // 재시도 딜레이: 지수 백오프
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // 윈도우 포커스 시 자동 재페칭
      refetchOnWindowFocus: false,
      
      // 마운트 시 자동 재페칭
      refetchOnMount: true,
      
      // 네트워크 재연결 시 재페칭
      refetchOnReconnect: true,
    },
    mutations: {
      // 에러 시 재시도: 1번
      retry: 1,
    },
  },
});

/**
 * Query Keys
 * 캐시 관리를 위한 키 정의
 */
export const queryKeys = {
  // 고백 관련
  confessions: {
    all: ['confessions'] as const,
    my: (deviceId: string) => ['confessions', 'my', deviceId] as const,
    viewed: (deviceId: string) => ['confessions', 'viewed', deviceId] as const,
    random: (deviceId: string) => ['confessions', 'random', deviceId] as const,
  },
  
  // 업적 관련
  achievements: {
    all: ['achievements'] as const,
    user: (deviceId: string) => ['achievements', 'user', deviceId] as const,
  },
  
  // 통계 관련
  statistics: {
    user: (deviceId: string) => ['statistics', 'user', deviceId] as const,
  },
};
