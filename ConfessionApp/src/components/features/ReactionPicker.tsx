/**
 * Reaction Picker Component
 *
 * Emoji reaction selector for diary entries
 */
import React, {useState} from 'react';
import {View, Text, StyleSheet, Pressable, Animated} from 'react-native';
import {REACTIONS} from '../../types/features';
import {useTheme} from '../../theme';
import {spacing, borderRadius, typography} from '../../theme/tokens';
import {triggerHaptic} from '../../utils/haptics';

interface ReactionPickerProps {
  onReaction: (reactionId: string) => void;
  currentReactions?: Record<string, number>;
  userReaction?: string | null;
}

export const ReactionPicker = ({
  onReaction,
  currentReactions = {},
  userReaction,
}: ReactionPickerProps) => {
  const {colors} = useTheme();
  const [showPicker, setShowPicker] = useState(false);

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
              ? colors.primary[50]
              : colors.neutral[100],
            borderColor: showPicker
              ? colors.primary[500]
              : colors.neutral[200],
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
          <Text style={[styles.totalCount, {color: colors.neutral[600]}]}>
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
              backgroundColor: colors.neutral[0],
              borderColor: colors.neutral[200],
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
                    backgroundColor: colors.primary[50],
                    borderColor: colors.primary[500],
                  },
                ]}
                onPress={() => handleReaction(reaction.id)}>
                <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                {count > 0 && (
                  <Text
                    style={[styles.reactionCount, {color: colors.neutral[600]}]}>
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
};

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
    fontSize: typography.sizes.md,
  },
  selectedEmoji: {
    fontSize: typography.sizes.lg,
  },
  totalCount: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
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
    fontSize: typography.sizes.xl,
  },
  reactionCount: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
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
    fontSize: typography.sizes.sm,
  },
  badgeCount: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
});
