/**
 * 댓글 목록 컴포넌트
 *
 * 댓글과 답글을 표시하는 목록
 */
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Comment} from '../../types/database';
import {useComments, useDeleteComment} from '../../hooks/useComments';
import {useThemeColors} from '../../hooks/useThemeColors';
import {spacing, typography} from '../../theme';
import {lightColors} from '../../theme/colors';
import {AnimatedEmptyState} from '../AnimatedEmptyState';
import {AnimatedLoading} from '../AnimatedLoading';
import CommentInput from './CommentInput';

interface CommentListProps {
  confessionId: string;
  deviceId: string;
}

export function CommentList({confessionId, deviceId}: CommentListProps) {
  const {colors, neutral} = useThemeColors();
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

  const {data: comments, isLoading, refetch} = useComments(confessionId);
  const {mutate: deleteComment} = useDeleteComment(confessionId, deviceId);

  const styles = getStyles(colors, neutral);

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return '방금';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR', {month: 'short', day: 'numeric'});
  };

  const handleDelete = (comment: Comment) => {
    if (comment.device_id !== deviceId) {
      Alert.alert('권한 없음', '본인이 작성한 댓글만 삭제할 수 있습니다.');
      return;
    }

    Alert.alert('댓글 삭제', '이 댓글을 삭제하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => deleteComment(comment.id),
      },
    ]);
  };

  const renderComment = ({item}: {item: Comment}) => (
    <View style={styles.commentContainer}>
      {/* 메인 댓글 */}
      <View style={styles.commentItem}>
        <View style={styles.commentHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={28} color={neutral[400]} />
          </View>
          <Text style={styles.timeText}>{formatTimeAgo(item.created_at)}</Text>
        </View>
        <Text style={styles.commentContent}>{item.content}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setReplyingTo(item)}
            activeOpacity={0.7}>
            <Ionicons name="chatbubble-outline" size={16} color={neutral[500]} />
            <Text style={styles.actionText}>답글</Text>
          </TouchableOpacity>
          {item.device_id === deviceId && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDelete(item)}
              activeOpacity={0.7}>
              <Ionicons name="trash-outline" size={16} color={neutral[500]} />
              <Text style={styles.actionText}>삭제</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 답글 목록 */}
      {item.replies && item.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {item.replies.map(reply => (
            <View key={reply.id} style={styles.replyItem}>
              <View style={styles.replyIndicator} />
              <View style={styles.replyContent}>
                <View style={styles.commentHeader}>
                  <View style={styles.avatarContainer}>
                    <Ionicons
                      name="person-circle"
                      size={24}
                      color={neutral[400]}
                    />
                  </View>
                  <Text style={styles.timeText}>
                    {formatTimeAgo(reply.created_at)}
                  </Text>
                </View>
                <Text style={styles.commentContent}>{reply.content}</Text>
                {reply.device_id === deviceId && (
                  <View style={styles.commentActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDelete(reply)}
                      activeOpacity={0.7}>
                      <Ionicons
                        name="trash-outline"
                        size={14}
                        color={neutral[500]}
                      />
                      <Text style={styles.actionText}>삭제</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <AnimatedLoading message="댓글을 불러오는 중..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>댓글</Text>
        <Text style={styles.count}>{comments?.length || 0}개</Text>
      </View>

      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <AnimatedEmptyState
            title="아직 댓글이 없습니다"
            description="첫 번째 댓글을 남겨보세요"
            size={120}
          />
        }
        scrollEnabled={false}
        contentContainerStyle={styles.listContent}
      />

      {/* 댓글 입력 */}
      <CommentInput
        confessionId={confessionId}
        deviceId={deviceId}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        onCommentAdded={() => {
          setReplyingTo(null);
          refetch();
        }}
      />
    </View>
  );
}

const getStyles = (
  colors: typeof lightColors,
  neutral: Record<number, string>,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: neutral[100],
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: '600',
      color: neutral[800],
    },
    count: {
      fontSize: typography.fontSize.sm,
      color: neutral[500],
      marginLeft: spacing.sm,
    },
    loadingContainer: {
      padding: spacing.xl,
      alignItems: 'center',
    },
    listContent: {
      paddingBottom: spacing.xl,
    },
    commentContainer: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: neutral[50],
    },
    commentItem: {},
    commentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    avatarContainer: {
      marginRight: spacing.xs,
    },
    timeText: {
      fontSize: typography.fontSize.xs,
      color: neutral[500],
    },
    commentContent: {
      fontSize: typography.fontSize.base,
      color: neutral[700],
      lineHeight: typography.fontSize.base * 1.5,
      marginLeft: spacing.xl + spacing.xs,
    },
    commentActions: {
      flexDirection: 'row',
      marginLeft: spacing.xl + spacing.xs,
      marginTop: spacing.sm,
      gap: spacing.md,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    actionText: {
      fontSize: typography.fontSize.sm,
      color: neutral[500],
    },
    repliesContainer: {
      marginTop: spacing.md,
      marginLeft: spacing.xl,
    },
    replyItem: {
      flexDirection: 'row',
      marginTop: spacing.sm,
    },
    replyIndicator: {
      width: 2,
      backgroundColor: neutral[200],
      marginRight: spacing.md,
      borderRadius: 1,
    },
    replyContent: {
      flex: 1,
    },
  });

export default CommentList;
