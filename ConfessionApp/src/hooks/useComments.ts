/**
 * Comment Query Hooks
 *
 * React Query를 사용한 댓글 관리
 */
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {CommentService} from '../services/comment.service';
import {CommentInsert} from '../types/database';

// 쿼리 키 정의
export const commentKeys = {
  all: ['comments'] as const,
  byConfession: (confessionId: string) =>
    [...commentKeys.all, 'confession', confessionId] as const,
  count: (confessionId: string) =>
    [...commentKeys.all, 'count', confessionId] as const,
};

/**
 * 댓글 목록 조회
 */
export function useComments(confessionId: string) {
  return useQuery({
    queryKey: commentKeys.byConfession(confessionId),
    queryFn: () => CommentService.getComments(confessionId),
    enabled: !!confessionId,
    staleTime: 1000 * 60 * 2, // 2분
  });
}

/**
 * 댓글 수 조회
 */
export function useCommentCount(confessionId: string) {
  return useQuery({
    queryKey: commentKeys.count(confessionId),
    queryFn: () => CommentService.getCommentCount(confessionId),
    enabled: !!confessionId,
    staleTime: 1000 * 60 * 5, // 5분
  });
}

/**
 * 댓글 작성
 */
export function useCreateComment(confessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CommentInsert) => CommentService.createComment(data),
    onSuccess: () => {
      // 댓글 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: commentKeys.byConfession(confessionId),
      });
      // 댓글 수 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: commentKeys.count(confessionId),
      });
    },
  });
}

/**
 * 댓글 삭제
 */
export function useDeleteComment(confessionId: string, deviceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) =>
      CommentService.deleteComment(commentId, deviceId),
    onSuccess: () => {
      // 댓글 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: commentKeys.byConfession(confessionId),
      });
      // 댓글 수 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: commentKeys.count(confessionId),
      });
    },
  });
}
