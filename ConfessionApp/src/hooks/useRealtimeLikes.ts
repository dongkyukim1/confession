/**
 * useRealtimeLikes - 실시간 좋아요 업데이트 훅
 *
 * Supabase Realtime을 사용하여 좋아요/싫어요 변경사항을 실시간으로 수신
 */
import {useState, useEffect, useCallback} from 'react';
import {supabase} from '../lib/supabase';
import {LikeType} from '../types/database';

// =====================================================
// 타입 정의
// =====================================================

interface RealtimeLikeState {
  likeCount: number;
  dislikeCount: number;
  isSubscribed: boolean;
  error: string | null;
}

interface RealtimeLikeEvent {
  eventType: 'INSERT' | 'DELETE';
  likeType: LikeType;
  confessionId: string;
}

// =====================================================
// 훅
// =====================================================

export function useRealtimeLikes(
  confessionId: string,
  initialLikes: number = 0,
  initialDislikes: number = 0,
) {
  const [state, setState] = useState<RealtimeLikeState>({
    likeCount: initialLikes,
    dislikeCount: initialDislikes,
    isSubscribed: false,
    error: null,
  });

  // 좋아요 이벤트 처리
  const handleLikeEvent = useCallback((event: RealtimeLikeEvent) => {
    setState(prev => {
      let {likeCount, dislikeCount} = prev;

      if (event.eventType === 'INSERT') {
        if (event.likeType === 'like') {
          likeCount += 1;
        } else {
          dislikeCount += 1;
        }
      } else if (event.eventType === 'DELETE') {
        if (event.likeType === 'like') {
          likeCount = Math.max(0, likeCount - 1);
        } else {
          dislikeCount = Math.max(0, dislikeCount - 1);
        }
      }

      return {...prev, likeCount, dislikeCount};
    });
  }, []);

  // Realtime 구독
  useEffect(() => {
    if (!confessionId) {
      return;
    }

    const channelName = `likes:${confessionId}`;

    // Supabase Realtime 채널 생성
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'likes',
          filter: `confession_id=eq.${confessionId}`,
        },
        payload => {
          console.log('[Realtime] Like INSERT:', payload);
          handleLikeEvent({
            eventType: 'INSERT',
            likeType: payload.new.like_type as LikeType,
            confessionId: payload.new.confession_id,
          });
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'likes',
          filter: `confession_id=eq.${confessionId}`,
        },
        payload => {
          console.log('[Realtime] Like DELETE:', payload);
          handleLikeEvent({
            eventType: 'DELETE',
            likeType: payload.old.like_type as LikeType,
            confessionId: payload.old.confession_id,
          });
        },
      )
      .subscribe(status => {
        console.log(`[Realtime] Channel ${channelName} status:`, status);
        setState(prev => ({
          ...prev,
          isSubscribed: status === 'SUBSCRIBED',
          error: status === 'CHANNEL_ERROR' ? 'Failed to subscribe' : null,
        }));
      });

    // 정리
    return () => {
      console.log(`[Realtime] Unsubscribing from ${channelName}`);
      supabase.removeChannel(channel);
    };
  }, [confessionId, handleLikeEvent]);

  // 초기값 동기화
  useEffect(() => {
    setState(prev => ({
      ...prev,
      likeCount: initialLikes,
      dislikeCount: initialDislikes,
    }));
  }, [initialLikes, initialDislikes]);

  return {
    likeCount: state.likeCount,
    dislikeCount: state.dislikeCount,
    isSubscribed: state.isSubscribed,
    error: state.error,
  };
}

// =====================================================
// 여러 고백에 대한 실시간 구독 훅
// =====================================================

interface RealtimeLikesMap {
  [confessionId: string]: {
    likeCount: number;
    dislikeCount: number;
  };
}

export function useRealtimeLikesBatch(
  confessionIds: string[],
  initialData: RealtimeLikesMap = {},
) {
  const [likesMap, setLikesMap] = useState<RealtimeLikesMap>(initialData);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (confessionIds.length === 0) {
      return;
    }

    const channelName = `likes:batch:${confessionIds.slice(0, 3).join('-')}`;

    // 여러 고백에 대한 실시간 구독
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
        },
        payload => {
          const confessionId =
            payload.new?.confession_id || payload.old?.confession_id;
          const likeType = (payload.new?.like_type ||
            payload.old?.like_type) as LikeType;

          if (!confessionIds.includes(confessionId)) {
            return;
          }

          setLikesMap(prev => {
            const current = prev[confessionId] || {likeCount: 0, dislikeCount: 0};
            let {likeCount, dislikeCount} = current;

            if (payload.eventType === 'INSERT') {
              if (likeType === 'like') {
                likeCount += 1;
              } else {
                dislikeCount += 1;
              }
            } else if (payload.eventType === 'DELETE') {
              if (likeType === 'like') {
                likeCount = Math.max(0, likeCount - 1);
              } else {
                dislikeCount = Math.max(0, dislikeCount - 1);
              }
            }

            return {
              ...prev,
              [confessionId]: {likeCount, dislikeCount},
            };
          });
        },
      )
      .subscribe(status => {
        setIsSubscribed(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [confessionIds.join(',')]);

  // 초기 데이터 동기화
  useEffect(() => {
    setLikesMap(prev => ({...prev, ...initialData}));
  }, [JSON.stringify(initialData)]);

  return {
    likesMap,
    isSubscribed,
    getLikes: (id: string) => likesMap[id] || {likeCount: 0, dislikeCount: 0},
  };
}

// =====================================================
// 실시간 댓글 훅 (추가)
// =====================================================

interface RealtimeComment {
  id: string;
  confession_id: string;
  device_id: string;
  content: string;
  created_at: string;
}

export function useRealtimeComments(confessionId: string) {
  const [newComments, setNewComments] = useState<RealtimeComment[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!confessionId) {
      return;
    }

    const channelName = `comments:${confessionId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `confession_id=eq.${confessionId}`,
        },
        payload => {
          console.log('[Realtime] New comment:', payload);
          setNewComments(prev => [...prev, payload.new as RealtimeComment]);
        },
      )
      .subscribe(status => {
        setIsSubscribed(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [confessionId]);

  const clearNewComments = useCallback(() => {
    setNewComments([]);
  }, []);

  return {
    newComments,
    newCommentsCount: newComments.length,
    isSubscribed,
    clearNewComments,
  };
}

export default useRealtimeLikes;
