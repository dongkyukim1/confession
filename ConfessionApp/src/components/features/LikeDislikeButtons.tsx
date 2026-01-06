/**
 * 좋아요/싫어요 버튼 컴포넌트
 * 
 * 다른 사람의 일기에 좋아요/싫어요 반응을 남길 수 있는 버튼
 */
import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {LikeType} from '../../types/database';
import {useTheme} from '../../theme';
import {spacing, borderRadius, typography} from '../../theme/tokens';
import {triggerHaptic} from '../../utils/haptics';

interface LikeDislikeButtonsProps {
  likeCount: number;
  dislikeCount: number;
  userLikeType: LikeType | null;
  onLike: () => void;
  onDislike: () => void;
  disabled?: boolean;
}

export const LikeDislikeButtons = ({
  likeCount,
  dislikeCount,
  userLikeType,
  onLike,
  onDislike,
  disabled = false,
}: LikeDislikeButtonsProps) => {
  const {colors} = useTheme();

  const handleLike = () => {
    if (disabled) return;
    triggerHaptic('impactMedium');
    onLike();
  };

  const handleDislike = () => {
    if (disabled) return;
    triggerHaptic('impactMedium');
    onDislike();
  };

  const isLiked = userLikeType === 'like';
  const isDisliked = userLikeType === 'dislike';

  return (
    <View style={styles.container}>
      {/* 좋아요 버튼 */}
      <Pressable
        onPress={handleLike}
        disabled={disabled}
        style={[
          styles.button,
          {
            backgroundColor: isLiked
              ? colors.success[50]
              : colors.neutral[100],
            borderColor: isLiked
              ? colors.success[500]
              : colors.neutral[200],
            opacity: disabled ? 0.5 : 1,
          },
        ]}>
        <Text style={[styles.icon, isLiked && styles.activeIcon]}>
          {isLiked ? '👍' : '👍🏻'}
        </Text>
        {likeCount > 0 && (
          <Text
            style={[
              styles.count,
              {
                color: isLiked ? colors.success[700] : colors.neutral[600],
              },
            ]}>
            {likeCount}
          </Text>
        )}
      </Pressable>

      {/* 싫어요 버튼 */}
      <Pressable
        onPress={handleDislike}
        disabled={disabled}
        style={[
          styles.button,
          {
            backgroundColor: isDisliked
              ? colors.danger[50]
              : colors.neutral[100],
            borderColor: isDisliked
              ? colors.danger[500]
              : colors.neutral[200],
            opacity: disabled ? 0.5 : 1,
          },
        ]}>
        <Text style={[styles.icon, isDisliked && styles.activeIcon]}>
          {isDisliked ? '👎' : '👎🏻'}
        </Text>
        {dislikeCount > 0 && (
          <Text
            style={[
              styles.count,
              {
                color: isDisliked ? colors.danger[700] : colors.neutral[600],
              },
            ]}>
            {dislikeCount}
          </Text>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    gap: spacing.xs,
    minWidth: 70,
    justifyContent: 'center',
  },
  icon: {
    fontSize: typography.sizes.xl,
  },
  activeIcon: {
    transform: [{scale: 1.1}],
  },
  count: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});

