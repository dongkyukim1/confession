/**
 * Infinite Scroll Hook
 * 
 * 무한 스크롤 및 페이지네이션 처리
 */
import {useState, useCallback} from 'react';

export interface UseInfiniteScrollOptions {
  initialLimit?: number;
  threshold?: number;
}

export interface UseInfiniteScrollReturn<T> {
  data: T[];
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
}

/**
 * 무한 스크롤 Hook
 */
export function useInfiniteScroll<T>(
  fetchFn: (offset: number, limit: number) => Promise<T[]>,
  options: UseInfiniteScrollOptions = {},
): UseInfiniteScrollReturn<T> {
  const {initialLimit = 20, threshold = 0.8} = options;

  const [data, setData] = useState<T[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * 초기 데이터 로드
   */
  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const newData = await fetchFn(0, initialLimit);
      
      setData(newData);
      setOffset(newData.length);
      setHasMore(newData.length >= initialLimit);
    } catch (err) {
      setError(err as Error);
      console.error('[useInfiniteScroll] Refresh error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, initialLimit]);

  /**
   * 추가 데이터 로드
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || isLoading) {
      return;
    }

    try {
      setIsLoadingMore(true);
      setError(null);

      const newData = await fetchFn(offset, initialLimit);
      
      setData(prev => [...prev, ...newData]);
      setOffset(prev => prev + newData.length);
      setHasMore(newData.length >= initialLimit);
    } catch (err) {
      setError(err as Error);
      console.error('[useInfiniteScroll] Load more error:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [fetchFn, offset, hasMore, isLoadingMore, isLoading, initialLimit]);

  /**
   * 상태 리셋
   */
  const reset = useCallback(() => {
    setData([]);
    setOffset(0);
    setHasMore(true);
    setIsLoading(false);
    setIsLoadingMore(false);
    setError(null);
  }, []);

  return {
    data,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    refresh,
    reset,
  };
}

/**
 * FlatList용 스크롤 핸들러
 */
export function useFlatListInfiniteScroll(
  loadMore: () => Promise<void>,
  hasMore: boolean,
  isLoadingMore: boolean,
) {
  const onEndReached = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      loadMore();
    }
  }, [hasMore, isLoadingMore, loadMore]);

  return {
    onEndReached,
    onEndReachedThreshold: 0.5,
  };
}
