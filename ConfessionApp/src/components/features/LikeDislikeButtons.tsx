/**
 * 좋아요/싫어요 버튼 컴포넌트
 * 
 * 다른 사람의 일기에 좋아요/싫어요 반응을 남길 수 있는 버튼
 */
import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {LikeType} from '../../types/database';
import {useTheme} from '../../contexts/ThemeContext';
import {spacing, borderRadius, typography} from '../../theme';
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
  const theme = useTheme();
  // colors가 객체인지 확인하고 안전하게 처리
  const colors = (theme && typeof theme.colors === 'object' && theme.colors) || {
    success: {
      50: '#F0FDF4',
      500: '#21D07C', // 틴더 그린
      700: '#15803D',
    },
    danger: {
      50: '#FEF2F2',
      500: '#E94E4E', // 틴더 레드
      700: '#B91C1C',
    },
    neutral: {
      100: '#F5F5F5',
      200: '#E5E5E5',
      600: '#525252',
    },
  };

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
              ? (typeof colors.danger === 'object' ? colors.danger[50] : '#FEF2F2')
              : (typeof colors.neutral === 'object' ? colors.neutral[100] : '#F5F5F5'),
            borderColor: isDisliked
              ? (typeof colors.danger === 'object' ? colors.danger[500] : '#E94E4E')
              : (typeof colors.neutral === 'object' ? colors.neutral[200] : '#E5E5E5'),
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
                color: isDisliked 
                  ? (typeof colors.danger === 'object' ? colors.danger[700] : '#B91C1C')
                  : (typeof colors.neutral === 'object' ? colors.neutral[600] : '#525252'),
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
    fontSize: typography.fontSize.xl,
  },
  activeIcon: {
    transform: [{scale: 1.1}],
  },
  count: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
});



