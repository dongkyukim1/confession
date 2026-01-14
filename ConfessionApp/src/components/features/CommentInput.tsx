/**
 * 댓글 입력 컴포넌트
 *
 * 댓글 및 답글 작성 인풋
 */
import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Comment} from '../../types/database';
import {useCreateComment} from '../../hooks/useComments';
import {useThemeColors} from '../../hooks/useThemeColors';
import {spacing, typography, borderRadius} from '../../theme';
import {lightColors} from '../../theme/colors';

interface CommentInputProps {
  confessionId: string;
  deviceId: string;
  replyingTo?: Comment | null;
  onCancelReply?: () => void;
  onCommentAdded?: () => void;
}

const MAX_LENGTH = 200;

export function CommentInput({
  confessionId,
  deviceId,
  replyingTo,
  onCancelReply,
  onCommentAdded,
}: CommentInputProps) {
  const [content, setContent] = useState('');
  const inputRef = useRef<TextInput>(null);
  const {colors, neutral} = useThemeColors();

  const {mutate: createComment, isPending} = useCreateComment(confessionId);

  const styles = getStyles(colors, neutral);

  // 답글 모드 전환 시 인풋 포커스
  useEffect(() => {
    if (replyingTo) {
      inputRef.current?.focus();
    }
  }, [replyingTo]);

  const handleSubmit = () => {
    const trimmedContent = content.trim();
    if (!trimmedContent || isPending) return;

    createComment(
      {
        confession_id: confessionId,
        device_id: deviceId,
        content: trimmedContent,
        parent_id: replyingTo?.id || null,
      },
      {
        onSuccess: () => {
          setContent('');
          Keyboard.dismiss();
          onCommentAdded?.();
        },
      },
    );
  };

  const handleCancel = () => {
    setContent('');
    onCancelReply?.();
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      {/* 답글 표시 */}
      {replyingTo && (
        <View style={styles.replyingToContainer}>
          <Text style={styles.replyingToText}>
            <Ionicons name="return-down-forward" size={14} color={neutral[500]} />{' '}
            답글 작성 중
          </Text>
          <TouchableOpacity onPress={handleCancel} activeOpacity={0.7}>
            <Ionicons name="close" size={18} color={neutral[500]} />
          </TouchableOpacity>
        </View>
      )}

      {/* 입력 영역 */}
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={replyingTo ? '답글을 입력하세요...' : '댓글을 입력하세요...'}
          placeholderTextColor={neutral[400]}
          value={content}
          onChangeText={setContent}
          maxLength={MAX_LENGTH}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          editable={!isPending}
        />

        <View style={styles.inputFooter}>
          <Text style={styles.charCount}>
            {content.length}/{MAX_LENGTH}
          </Text>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!content.trim() || isPending) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!content.trim() || isPending}
            activeOpacity={0.7}>
            {isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="send" size={16} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>게시</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const getStyles = (
  colors: typeof lightColors,
  neutral: Record<number, string>,
) =>
  StyleSheet.create({
    container: {
      borderTopWidth: 1,
      borderTopColor: neutral[100],
      backgroundColor: neutral[0],
    },
    replyingToContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      backgroundColor: neutral[50],
    },
    replyingToText: {
      fontSize: typography.fontSize.sm,
      color: neutral[600],
    },
    inputContainer: {
      padding: spacing.md,
    },
    input: {
      backgroundColor: neutral[50],
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
      fontSize: typography.fontSize.base,
      color: neutral[700],
      minHeight: 60,
      maxHeight: 100,
    },
    inputFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.sm,
    },
    charCount: {
      fontSize: typography.fontSize.xs,
      color: neutral[400],
    },
    submitButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.lg,
      gap: spacing.xs,
    },
    submitButtonDisabled: {
      backgroundColor: neutral[300],
    },
    submitButtonText: {
      fontSize: typography.fontSize.sm,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });

export default CommentInput;
