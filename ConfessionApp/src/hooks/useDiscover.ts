/**
 * Discover Query Hooks
 *
 * React Query를 사용한 발견/검색 기능
 */
import {useQuery} from '@tanstack/react-query';
import {DiscoverService} from '../services/discover.service';

// 쿼리 키 정의
export const discoverKeys = {
  all: ['discover'] as const,
  popular: () => [...discoverKeys.all, 'popular'] as const,
  trending: (hours: number) => [...discoverKeys.all, 'trending', hours] as const,
  recent: () => [...discoverKeys.all, 'recent'] as const,
  byMood: (mood: string) => [...discoverKeys.all, 'mood', mood] as const,
  byTag: (tag: string) => [...discoverKeys.all, 'tag', tag] as const,
  byKeyword: (keyword: string) => [...discoverKeys.all, 'keyword', keyword] as const,
  popularTags: () => [...discoverKeys.all, 'popularTags'] as const,
};

/**
 * 인기 고백 조회
 */
export function usePopularConfessions(limit: number = 20) {
  return useQuery({
    queryKey: discoverKeys.popular(),
    queryFn: () => DiscoverService.getPopular(limit),
    staleTime: 1000 * 60 * 5, // 5분
  });
}

/**
 * 트렌딩 고백 조회
 */
export function useTrendingConfessions(hours: number = 24, limit: number = 20) {
  return useQuery({
    queryKey: discoverKeys.trending(hours),
    queryFn: () => DiscoverService.getTrending(hours, limit),
    staleTime: 1000 * 60 * 5, // 5분
  });
}

/**
 * 최신 고백 조회
 */
export function useRecentConfessions(limit: number = 20) {
  return useQuery({
    queryKey: discoverKeys.recent(),
    queryFn: () => DiscoverService.getRecent(limit),
    staleTime: 1000 * 60 * 2, // 2분
  });
}

/**
 * 무드별 고백 검색
 */
export function useConfessionsByMood(mood: string, limit: number = 20) {
  return useQuery({
    queryKey: discoverKeys.byMood(mood),
    queryFn: () => DiscoverService.searchByMood(mood, limit),
    enabled: !!mood,
    staleTime: 1000 * 60 * 5, // 5분
  });
}

/**
 * 태그별 고백 검색
 */
export function useConfessionsByTag(tag: string, limit: number = 20) {
  return useQuery({
    queryKey: discoverKeys.byTag(tag),
    queryFn: () => DiscoverService.searchByTag(tag, limit),
    enabled: !!tag,
    staleTime: 1000 * 60 * 5, // 5분
  });
}

/**
 * 키워드 검색
 */
export function useConfessionsByKeyword(keyword: string, limit: number = 20) {
  return useQuery({
    queryKey: discoverKeys.byKeyword(keyword),
    queryFn: () => DiscoverService.searchByKeyword(keyword, limit),
    enabled: keyword.length >= 2, // 최소 2글자 이상
    staleTime: 1000 * 60 * 2, // 2분
  });
}

/**
 * 인기 태그 조회
 */
export function usePopularTags(limit: number = 10) {
  return useQuery({
    queryKey: discoverKeys.popularTags(),
    queryFn: () => DiscoverService.getPopularTags(limit),
    staleTime: 1000 * 60 * 10, // 10분
  });
}
