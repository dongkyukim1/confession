/**
 * Button Component - 프로덕션 레벨 (2026 디자인 시스템)
 * 
 * 다양한 variants, sizes, states 지원
 */
import React, {useRef} from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {lightColors} from '../theme/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

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
}

export function Button({
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
}: ButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const containerStyle = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    styles[`${variant}Text` as keyof typeof styles] as TextStyle,
    styles[`${size}Text` as keyof typeof styles] as TextStyle,
  ];

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;
  const iconColor = getIconColor(variant, disabled);

  return (
    <Animated.View style={{transform: [{scale: scaleAnim}]}}>
      <TouchableOpacity
        style={containerStyle}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}>
        {loading ? (
          <ActivityIndicator size="small" color={iconColor} />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <Ionicons name={icon} size={iconSize} color={iconColor} style={styles.iconLeft} />
            )}
            <Text style={textStyle}>{title}</Text>
            {icon && iconPosition === 'right' && (
              <Ionicons name={icon} size={iconSize} color={iconColor} style={styles.iconRight} />
            )}
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

function getIconColor(variant: ButtonVariant, disabled: boolean): string {
  if (disabled) return lightColors.textDisabled;
  
  switch (variant) {
    case 'primary':
    case 'danger':
      return '#FFFFFF';
    case 'secondary':
      return lightColors.primary;
    case 'outline':
      return lightColors.primary;
    case 'ghost':
      return lightColors.textPrimary;
    default:
      return '#FFFFFF';
  }
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  
  // Variants
  primary: {
    backgroundColor: lightColors.primary,
  },
  secondary: {
    backgroundColor: lightColors.neutral[100],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: lightColors.error,
  },
  
  // Sizes
  sm: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  md: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  lg: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 14,
  },
  
  // States
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
  
  // Text styles
  text: {
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: lightColors.primary,
  },
  outlineText: {
    color: lightColors.primary,
  },
  ghostText: {
    color: lightColors.textPrimary,
  },
  dangerText: {
    color: '#FFFFFF',
  },
  
  // Text sizes
  smText: {
    fontSize: 13,
  },
  mdText: {
    fontSize: 15,
  },
  lgText: {
    fontSize: 17,
  },
  
  // Icons
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
