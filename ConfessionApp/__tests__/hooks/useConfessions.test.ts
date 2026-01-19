/**
 * useConfessions Hook Tests
 */
import {renderHook, waitFor} from '@testing-library/react-native';
import React from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {
  useMyConfessions,
  useViewedConfessions,
  useMyConfessionsInfinite,
  useViewedConfessionsInfinite,
  flattenInfiniteData,
} from '../../src/hooks/useConfessions';

// Mock the confession service
jest.mock('../../src/services/confession.service', () => ({
  ConfessionService: {
    getMyConfessions: jest.fn(() => Promise.resolve([])),
    getViewedConfessions: jest.fn(() => Promise.resolve([])),
    getRandomConfession: jest.fn(() => Promise.resolve(null)),
    createConfession: jest.fn(() => Promise.resolve({id: 'new-id'})),
    markAsViewed: jest.fn(() => Promise.resolve()),
    deleteConfession: jest.fn(() => Promise.resolve()),
  },
}));

// Create a wrapper with QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({children}: {children: React.ReactNode}) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useConfessions Hooks', () => {
  describe('useMyConfessions', () => {
    it('should not fetch when deviceId is empty', () => {
      const {result} = renderHook(() => useMyConfessions(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
    });

    it('should fetch when deviceId is provided', async () => {
      const {result} = renderHook(() => useMyConfessions('test-device-id'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual([]);
    });
  });

  describe('useViewedConfessions', () => {
    it('should not fetch when deviceId is empty', () => {
      const {result} = renderHook(() => useViewedConfessions(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
    });

    it('should fetch when deviceId is provided', async () => {
      const {result} = renderHook(
        () => useViewedConfessions('test-device-id'),
        {
          wrapper: createWrapper(),
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual([]);
    });
  });

  describe('useMyConfessionsInfinite', () => {
    it('should not fetch when deviceId is empty', () => {
      const {result} = renderHook(() => useMyConfessionsInfinite(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should provide fetchNextPage function', async () => {
      const {result} = renderHook(
        () => useMyConfessionsInfinite('test-device-id'),
        {
          wrapper: createWrapper(),
        },
      );

      expect(typeof result.current.fetchNextPage).toBe('function');
    });

    it('should provide hasNextPage state', async () => {
      const {result} = renderHook(
        () => useMyConfessionsInfinite('test-device-id'),
        {
          wrapper: createWrapper(),
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.hasNextPage).toBe('boolean');
    });
  });

  describe('useViewedConfessionsInfinite', () => {
    it('should not fetch when deviceId is empty', () => {
      const {result} = renderHook(() => useViewedConfessionsInfinite(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should provide fetchNextPage function', async () => {
      const {result} = renderHook(
        () => useViewedConfessionsInfinite('test-device-id'),
        {
          wrapper: createWrapper(),
        },
      );

      expect(typeof result.current.fetchNextPage).toBe('function');
    });
  });
});

describe('flattenInfiniteData', () => {
  it('should return empty array for undefined input', () => {
    const result = flattenInfiniteData(undefined);
    expect(result).toEqual([]);
  });

  it('should return empty array for empty pages', () => {
    const result = flattenInfiniteData([]);
    expect(result).toEqual([]);
  });

  it('should flatten single page data', () => {
    const pages = [
      {
        data: [{id: '1'}, {id: '2'}],
        nextOffset: 2,
        hasMore: true,
      },
    ];

    const result = flattenInfiniteData(pages);
    expect(result).toEqual([{id: '1'}, {id: '2'}]);
  });

  it('should flatten multiple pages data', () => {
    const pages = [
      {
        data: [{id: '1'}, {id: '2'}],
        nextOffset: 2,
        hasMore: true,
      },
      {
        data: [{id: '3'}, {id: '4'}],
        nextOffset: 4,
        hasMore: false,
      },
    ];

    const result = flattenInfiniteData(pages);
    expect(result).toEqual([{id: '1'}, {id: '2'}, {id: '3'}, {id: '4'}]);
  });

  it('should handle pages with empty data arrays', () => {
    const pages = [
      {
        data: [{id: '1'}],
        nextOffset: 1,
        hasMore: true,
      },
      {
        data: [],
        nextOffset: 1,
        hasMore: false,
      },
    ];

    const result = flattenInfiniteData(pages);
    expect(result).toEqual([{id: '1'}]);
  });
});
