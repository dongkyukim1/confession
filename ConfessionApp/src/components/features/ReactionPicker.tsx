/**
 * Reaction Picker Component
 *
 * Emoji reaction selector for diary entries
 */
import React, {useState, memo} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {REACTIONS} from '../../types/features';
import {useTheme} from '../../contexts/ThemeContext';
import {spacing, borderRadius, typography} from '../../theme';
import {triggerHaptic} from '../../utils/haptics';

interface ReactionPickerProps {
  onReaction: (reactionId: string) => void;
  currentReactions?: Record<string, number>;
  userReaction?: string | null;
}

export const ReactionPicker = memo(({
  onReaction,
  currentReactions = {},
  userReaction,
}: ReactionPickerProps) => {
  const theme = useTheme();
  // colors가 객체인지 확인하고 안전하게 처리
  const colors = (theme && typeof theme.colors === 'object' && theme.colors) || {
    neutral: {
      0: '#FFFFFF',
      100: '#F5F5F5',
      200: '#E5E5E5',
      600: '#525252',
      700: '#404040',
    },
    primary: '#FD5068',
    primaryScale: {
      50: '#FFF1F2',
      500: '#FD5068',
    },
  };
  const [showPicker, setShowPicker] = useState(false);
  
  // primaryScale이 없으면 primary 문자열을 사용
  const primary50 = typeof colors.primaryScale === 'object' && colors.primaryScale?.[50] 
    ? colors.primaryScale[50] 
    : '#FFF1F2';
  const primary500 = typeof colors.primaryScale === 'object' && colors.primaryScale?.[500] 
    ? colors.primaryScale[500] 
    : (typeof colors.primary === 'string' ? colors.primary : '#FD5068');

  const handleReaction = (reactionId: string) => {
    triggerHaptic('impactMedium');
    onReaction(reactionId);
    setShowPicker(false);
  };

  const totalReactions = Object.values(currentReactions).reduce(
    (sum, count) => sum + count,
    0,
  );

  return (
    <View style={styles.container}>
      {/* Show Reactions Button */}
      <Pressable
        style={[
          styles.triggerButton,
          {
            backgroundColor: showPicker
              ? primary50
              : (typeof colors.neutral === 'object' ? colors.neutral[100] : '#F5F5F5'),
            borderColor: showPicker
              ? primary500
              : (typeof colors.neutral === 'object' ? colors.neutral[200] : '#E5E5E5'),
          },
        ]}
        onPress={() => {
          triggerHaptic('impactLight');
          setShowPicker(!showPicker);
        }}>
        {userReaction ? (
          <Text style={styles.selectedEmoji}>
            {REACTIONS.find(r => r.id === userReaction)?.emoji}
          </Text>
        ) : (
          <Text style={styles.addEmoji}>➕</Text>
        )}
        {totalReactions > 0 && (
          <Text style={[styles.totalCount, {color: typeof colors.neutral === 'object' ? colors.neutral[600] : '#525252'}]}>
            {totalReactions}
          </Text>
        )}
      </Pressable>

      {/* Reaction Picker */}
      {showPicker && (
        <View
          style={[
            styles.pickerContainer,
            {
              backgroundColor: typeof colors.neutral === 'object' ? colors.neutral[0] : '#FFFFFF',
              borderColor: typeof colors.neutral === 'object' ? colors.neutral[200] : '#E5E5E5',
            },
          ]}>
          {REACTIONS.map(reaction => {
            const count = currentReactions[reaction.id] || 0;
            const isSelected = userReaction === reaction.id;

            return (
              <Pressable
                key={reaction.id}
                style={[
                  styles.reactionButton,
                  isSelected && {
                    backgroundColor: primary50,
                    borderColor: primary500,
                  },
                ]}
                onPress={() => handleReaction(reaction.id)}>
                <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                {count > 0 && (
                  <Text
                    style={[styles.reactionCount, {color: typeof colors.neutral === 'object' ? colors.neutral[600] : '#525252'}]}>
                    {count}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Reactions Summary */}
      {!showPicker && Object.keys(currentReactions).length > 0 && (
        <View style={styles.reactionsDisplay}>
          {Object.entries(currentReactions)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([reactionId, count]) => {
              const reaction = REACTIONS.find(r => r.id === reactionId);
              if (!reaction || count === 0) return null;

              return (
                <View
                  key={reactionId}
                  style={[
                    styles.reactionBadge,
                    {
                      backgroundColor: colors.neutral[100],
                      borderColor: colors.neutral[200],
                    },
                  ]}>
                  <Text style={styles.badgeEmoji}>{reaction.emoji}</Text>
                  <Text style={[styles.badgeCount, {color: colors.neutral[700]}]}>
                    {count}
                  </Text>
                </View>
              );
            })}
        </View>
      )}
    </View>
  );
});

ReactionPicker.displayName = 'ReactionPicker';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  triggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: spacing.xs,
  },
  addEmoji: {
    fontSize: typography.fontSize.base,
  },
  selectedEmoji: {
    fontSize: typography.fontSize.lg,
  },
  totalCount: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  pickerContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  reactionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  reactionEmoji: {
    fontSize: typography.fontSize.xl,
  },
  reactionCount: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    marginTop: 2,
  },
  reactionsDisplay: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  reactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: spacing.xs / 2,
  },
  badgeEmoji: {
    fontSize: typography.fontSize.sm,
  },
  badgeCount: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
});
