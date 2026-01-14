/**
 * Comment Service
 *
 * 댓글 관련 비즈니스 로직
 */
import {supabase} from '../lib/supabase';
import {Comment, CommentInsert} from '../types/database';
import {handleApiError, withRetry, validateRequired} from './api.utils';

export class CommentService {
  /**
   * 고백의 댓글 목록 조회
   */
  static async getComments(confessionId: string): Promise<Comment[]> {
    try {
      validateRequired(confessionId, '고백 ID');

      const result = await withRetry(async () => {
        // 최상위 댓글만 조회 (parent_id가 null인 것)
        const {data, error} = await supabase
          .from('confession_comments')
          .select('*')
          .eq('confession_id', confessionId)
          .is('parent_id', null)
          .order('created_at', {ascending: true});

        if (error) throw error;
        return data || [];
      });

      // 각 댓글의 답글 조회
      const commentsWithReplies = await Promise.all(
        result.map(async comment => {
          const replies = await this.getReplies(comment.id);
          return {...comment, replies};
        }),
      );

      console.log('[CommentService] Got comments:', commentsWithReplies.length);
      return commentsWithReplies;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * 답글 조회
   */
  static async getReplies(commentId: string): Promise<Comment[]> {
    try {
      const {data, error} = await supabase
        .from('confession_comments')
        .select('*')
        .eq('parent_id', commentId)
        .order('created_at', {ascending: true});

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[CommentService] Failed to get replies:', error);
      return [];
    }
  }

  /**
   * 댓글 작성
   */
  static async createComment(data: CommentInsert): Promise<Comment> {
    try {
      validateRequired(data.confession_id, '고백 ID');
      validateRequired(data.device_id, '기기 ID');
      validateRequired(data.content, '댓글 내용');

      const result = await withRetry(async () => {
        const {data: comment, error} = await supabase
          .from('confession_comments')
          .insert([
            {
              confession_id: data.confession_id,
              device_id: data.device_id,
              content: data.content.trim(),
              parent_id: data.parent_id || null,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        if (!comment) throw new Error('댓글 작성에 실패했습니다');

        return comment;
      });

      console.log('[CommentService] Created comment:', result.id);
      return result;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * 댓글 삭제
   */
  static async deleteComment(
    commentId: string,
    deviceId: string,
  ): Promise<void> {
    try {
      validateRequired(commentId, '댓글 ID');
      validateRequired(deviceId, '기기 ID');

      await withRetry(async () => {
        // 본인이 작성한 댓글만 삭제 가능
        const {error} = await supabase
          .from('confession_comments')
          .delete()
          .eq('id', commentId)
          .eq('device_id', deviceId);

        if (error) throw error;
      });

      console.log('[CommentService] Deleted comment:', commentId);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * 댓글 수 조회
   */
  static async getCommentCount(confessionId: string): Promise<number> {
    try {
      const {count, error} = await supabase
        .from('confession_comments')
        .select('*', {count: 'exact', head: true})
        .eq('confession_id', confessionId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('[CommentService] Failed to get comment count:', error);
      return 0;
    }
  }
}
