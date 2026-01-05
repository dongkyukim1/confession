/**
 * Empty State Component
 *
 * Displays friendly empty states
 */
import React from 'react';
import {View, Text, StyleSheet, ViewStyle} from 'react-native';
import {useTheme} from '../../theme';
import {spacing, typography} from '../../theme/tokens';
import {Button} from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState = ({
  icon = '📭',
  title,
  description,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) => {
  const {colors} = useTheme();

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.title, {color: colors.neutral[900]}]}>{title}</Text>
      {description && (
        <Text style={[styles.description, {color: colors.neutral[600]}]}>
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button onPress={onAction} variant="primary" size="md" style={styles.button}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.sizes.md,
    textAlign: 'center',
    lineHeight: typography.sizes.md * typography.lineHeights.relaxed,
    marginBottom: spacing.lg,
  },
  button: {
    marginTop: spacing.md,
  },
});
