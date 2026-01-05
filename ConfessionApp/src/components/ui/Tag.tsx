/**
 * Tag Component
 *
 * Small label/badge for categorization
 */
import React from 'react';
import {View, Text, StyleSheet, ViewStyle, Pressable} from 'react-native';
import {useTheme} from '../../theme';
import {spacing, borderRadius, typography} from '../../theme/tokens';
import {triggerHaptic} from '../../utils/haptics';

type TagVariant = 'default' | 'primary' | 'success' | 'warning' | 'error';
type TagSize = 'sm' | 'md';

interface TagProps {
  children: React.ReactNode;
  variant?: TagVariant;
  size?: TagSize;
  onPress?: () => void;
  selected?: boolean;
  style?: ViewStyle;
  icon?: string;
}

export const Tag = ({
  children,
  variant = 'default',
  size = 'md',
  onPress,
  selected = false,
  style,
  icon,
}: TagProps) => {
  const {colors, isDark} = useTheme();

  const getVariantStyles = () => {
    const baseStyle = {
      backgroundColor: colors.neutral[100],
      color: colors.neutral[700],
    };

    if (selected) {
      return {
        backgroundColor: colors.primary[500],
        color: colors.neutral[0],
      };
    }

    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary[50],
          color: colors.primary[700],
        };
      case 'success':
        return {
          backgroundColor: colors.success[50],
          color: colors.success[700],
        };
      case 'warning':
        return {
          backgroundColor: colors.warning[50],
          color: colors.warning[700],
        };
      case 'error':
        return {
          backgroundColor: colors.error[50],
          color: colors.error[700],
        };
      default:
        return baseStyle;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: spacing.xs / 2,
          paddingHorizontal: spacing.sm,
          fontSize: typography.sizes.xs,
        };
      case 'md':
        return {
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.md,
          fontSize: typography.sizes.sm,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const handlePress = () => {
    if (onPress) {
      triggerHaptic('impactLight');
      onPress();
    }
  };

  const content = (
    <View
      style={[
        styles.container,
        {
          backgroundColor: variantStyles.backgroundColor,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
        },
        style,
      ]}>
      {icon && <Text style={[styles.icon, {fontSize: sizeStyles.fontSize}]}>{icon}</Text>}
      <Text
        style={[
          styles.text,
          {
            color: variantStyles.color,
            fontSize: sizeStyles.fontSize,
          },
        ]}>
        {children}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={handlePress} style={({pressed}) => pressed && styles.pressed}>
        {content}
      </Pressable>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  text: {
    fontWeight: typography.weights.medium,
  },
  icon: {
    lineHeight: typography.sizes.sm * typography.lineHeights.tight,
  },
  pressed: {
    opacity: 0.7,
  },
});
