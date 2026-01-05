/**
 * Button Component
 *
 * Reusable button with multiple variants and states
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';
import {useTheme} from '../../theme';
import {spacing, borderRadius, typography, shadows} from '../../theme/tokens';
import {triggerHaptic} from '../../utils/haptics';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  haptic?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = ({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  haptic = true,
  icon,
  iconPosition = 'left',
}: ButtonProps) => {
  const {colors, isDark} = useTheme();

  const handlePress = (event: GestureResponderEvent) => {
    if (disabled || loading) return;
    if (haptic) {
      triggerHaptic('impactLight');
    }
    onPress?.(event);
  };

  const getVariantStyles = (): {
    container: ViewStyle;
    text: TextStyle;
  } => {
    const baseContainer: ViewStyle = {
      ...shadows.md,
    };
    const baseText: TextStyle = {
      fontWeight: typography.weights.semibold,
    };

    switch (variant) {
      case 'primary':
        return {
          container: {
            ...baseContainer,
            backgroundColor: colors.primary[500],
          },
          text: {
            ...baseText,
            color: colors.neutral[0],
          },
        };
      case 'secondary':
        return {
          container: {
            ...baseContainer,
            backgroundColor: isDark ? colors.neutral[100] : colors.neutral[100],
            borderWidth: 1,
            borderColor: colors.neutral[300],
          },
          text: {
            ...baseText,
            color: colors.neutral[900],
          },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: {
            ...baseText,
            color: colors.primary[500],
          },
        };
      case 'destructive':
        return {
          container: {
            ...baseContainer,
            backgroundColor: colors.error[500],
          },
          text: {
            ...baseText,
            color: colors.neutral[0],
          },
        };
    }
  };

  const getSizeStyles = (): {
    container: ViewStyle;
    text: TextStyle;
  } => {
    switch (size) {
      case 'sm':
        return {
          container: {
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            borderRadius: borderRadius.md,
          },
          text: {
            fontSize: typography.sizes.sm,
          },
        };
      case 'md':
        return {
          container: {
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            borderRadius: borderRadius.lg,
          },
          text: {
            fontSize: typography.sizes.md,
          },
        };
      case 'lg':
        return {
          container: {
            paddingVertical: spacing.lg - 6,
            paddingHorizontal: spacing.xl,
            borderRadius: borderRadius.lg,
          },
          text: {
            fontSize: typography.sizes.lg,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const containerStyle: ViewStyle[] = [
    styles.container,
    variantStyles.container,
    sizeStyles.container,
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const buttonTextStyle: TextStyle[] = [
    styles.text,
    variantStyles.text,
    sizeStyles.text,
    (disabled || loading) && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'ghost' ? colors.primary[500] : colors.neutral[0]}
          size="small"
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text style={buttonTextStyle}>{children}</Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
});
