/**
 * Card Component
 *
 * Reusable card container with variants
 */
import React from 'react';
import {View, StyleSheet, ViewStyle, Pressable} from 'react-native';
import {useTheme} from '../../theme';
import {spacing, borderRadius, shadows} from '../../theme/tokens';
import {triggerHaptic} from '../../utils/haptics';

type CardVariant = 'elevated' | 'outlined' | 'filled';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  style?: ViewStyle;
  padding?: keyof typeof spacing;
  haptic?: boolean;
}

export const Card = ({
  children,
  variant = 'elevated',
  onPress,
  style,
  padding = 'lg',
  haptic = true,
}: CardProps) => {
  const {colors, isDark} = useTheme();

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.neutral[0],
          ...shadows.md,
        };
      case 'outlined':
        return {
          backgroundColor: colors.neutral[0],
          borderWidth: 1,
          borderColor: colors.neutral[200],
        };
      case 'filled':
        return {
          backgroundColor: isDark ? colors.neutral[100] : colors.neutral[50],
        };
    }
  };

  const containerStyle: ViewStyle[] = [
    styles.container,
    getVariantStyles(),
    {
      padding: spacing[padding],
      borderRadius: borderRadius.lg,
    },
    style,
  ];

  const handlePress = () => {
    if (haptic) {
      triggerHaptic('impactLight');
    }
    onPress?.();
  };

  if (onPress) {
    return (
      <Pressable
        style={({pressed}) => [
          ...containerStyle,
          pressed && styles.pressed,
        ]}
        onPress={handlePress}>
        {children}
      </Pressable>
    );
  }

  return <View style={containerStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.9,
    transform: [{scale: 0.98}],
  },
});
