/**
 * Button Component - 프리미엄 디자인 시스템
 *
 * 고급스러운 그라디언트, 섀도우, 애니메이션 효과 적용
 * - 다양한 variants, sizes, states 지원
 * - 프리미엄 호버/프레스 애니메이션
 * - 글래스모피즘 효과 옵션
 */
import React, {useRef, useCallback, memo} from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../../contexts/ThemeContext';
import {shadows, gradients} from '../../theme/colors';
import {borderRadius} from '../../theme/spacing';
import {typography} from '../../theme/typography';
import {triggerHaptic} from '../../utils/haptics';
import Ionicons from 'react-native-vector-icons/Ionicons';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'gradient'
  | 'glass';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  haptic?: boolean;
  elevated?: boolean;
  rounded?: boolean;
}

export const Button = memo(({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  haptic = true,
  elevated = true,
  rounded = false,
}: ButtonProps) => {
  const theme = useTheme();
  const colors = theme?.colors;
  const isDark = theme?.isDark || false;

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        damping: 15,
        stiffness: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 12,
        stiffness: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const handlePress = useCallback(() => {
    if (haptic) {
      triggerHaptic('impactLight');
    }
    onPress();
  }, [haptic, onPress]);

  // 사이즈별 스타일
  const sizeStyles: Record<ButtonSize, ViewStyle & {iconSize: number; fontSize: number}> = {
    xs: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: borderRadius.sm,
      iconSize: 14,
      fontSize: typography.fontSize.xs,
    },
    sm: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: borderRadius.md,
      iconSize: 16,
      fontSize: typography.fontSize.sm,
    },
    md: {
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderRadius: borderRadius.lg,
      iconSize: 18,
      fontSize: typography.fontSize.base,
    },
    lg: {
      paddingHorizontal: 28,
      paddingVertical: 18,
      borderRadius: borderRadius.xl,
      iconSize: 22,
      fontSize: typography.fontSize.lg,
    },
    xl: {
      paddingHorizontal: 36,
      paddingVertical: 22,
      borderRadius: borderRadius['2xl'],
      iconSize: 26,
      fontSize: typography.fontSize.xl,
    },
  };

  const currentSize = sizeStyles[size];
  const themeShadows = isDark ? shadows.dark : shadows.light;

  // 배리언트별 스타일
  const getVariantStyle = (): {
    container: ViewStyle;
    text: TextStyle;
    iconColor: string;
  } => {
    const primaryColor = colors?.primary || '#404040';
    const textPrimary = colors?.textPrimary || '#404040';
    const textSecondary = colors?.textSecondary || '#737373';
    const borderColor = colors?.border || '#E5E5E5';
    const errorColor = typeof colors?.error === 'string' ? colors.error : '#EF4444';
    const neutral100 = colors?.neutral?.[100] || '#F5F5F5';

    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: primaryColor,
            ...(elevated ? themeShadows.md : {}),
          },
          text: {color: '#FFFFFF'},
          iconColor: '#FFFFFF',
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: neutral100,
            ...(elevated ? themeShadows.sm : {}),
          },
          text: {color: textPrimary},
          iconColor: textPrimary,
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: borderColor,
          },
          text: {color: textPrimary},
          iconColor: textPrimary,
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: {color: textSecondary},
          iconColor: textSecondary,
        };
      case 'danger':
        return {
          container: {
            backgroundColor: errorColor,
            ...(elevated ? themeShadows.md : {}),
          },
          text: {color: '#FFFFFF'},
          iconColor: '#FFFFFF',
        };
      case 'gradient':
        return {
          container: {
            ...(elevated ? themeShadows.lg : {}),
          },
          text: {color: '#FFFFFF'},
          iconColor: '#FFFFFF',
        };
      case 'glass':
        return {
          container: {
            backgroundColor: isDark
              ? 'rgba(30, 41, 59, 0.6)'
              : 'rgba(255, 255, 255, 0.7)',
            borderWidth: 1,
            borderColor: isDark
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(255, 255, 255, 0.5)',
            ...(elevated ? themeShadows.soft : {}),
          },
          text: {color: textPrimary},
          iconColor: textPrimary,
        };
      default:
        return {
          container: {backgroundColor: primaryColor},
          text: {color: '#FFFFFF'},
          iconColor: '#FFFFFF',
        };
    }
  };

  const variantStyle = getVariantStyle();

  const containerStyle: ViewStyle[] = [
    styles.button,
    {
      paddingHorizontal: currentSize.paddingHorizontal,
      paddingVertical: currentSize.paddingVertical,
      borderRadius: rounded ? borderRadius.full : currentSize.borderRadius,
    },
    variantStyle.container,
    ...(fullWidth ? [styles.fullWidth] : []),
    ...(disabled ? [styles.disabled] : []),
    ...(style ? [style] : []),
  ].filter(Boolean);

  const textStyles: TextStyle[] = [
    styles.text,
    {
      fontSize: currentSize.fontSize,
      letterSpacing: typography.styles.button.letterSpacing,
    },
    variantStyle.text,
    ...(textStyle ? [textStyle] : []),
  ].filter(Boolean);

  const iconColor = disabled ? (colors?.textDisabled || '#D4D4D4') : variantStyle.iconColor;

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={currentSize.iconSize}
              color={iconColor}
              style={styles.iconLeft}
            />
          )}
          <Text style={textStyles}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={currentSize.iconSize}
              color={iconColor}
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </>
  );

  // 그라디언트 버튼
  if (variant === 'gradient' && !disabled) {
    const gradientColors = isDark
      ? gradients.dark.primary
      : gradients.light.primary;

    return (
      <Animated.View
        style={[
          {transform: [{scale: scaleAnim}], opacity: opacityAnim},
          fullWidth && styles.fullWidth,
        ]}>
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={1}>
          <LinearGradient
            colors={gradientColors as unknown as string[]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={[
              containerStyle,
              elevated && themeShadows.lg,
            ]}>
            {renderContent()}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        {transform: [{scale: scaleAnim}], opacity: opacityAnim},
        fullWidth && styles.fullWidth,
      ]}>
      <TouchableOpacity
        style={containerStyle}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}>
        {renderContent()}
      </TouchableOpacity>
    </Animated.View>
  );
});

Button.displayName = 'Button';

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.45,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: 10,
  },
  iconRight: {
    marginLeft: 10,
  },
});

export default Button;
