/**
 * Button Component
 *
 * 2026 디자인 시스템: 버튼은 눈에 띄지 않게
 * - 뉴트럴 컬러 기본
 * - 그림자 제거 또는 매우 얕은 그림자
 * - Flat 스타일 우선
 * - 브랜드 컬러는 중요한 CTA에만 사용
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
import {useTheme} from '../../contexts/ThemeContext';
import {spacing, borderRadius, typography, shadows} from '../../theme';
import {triggerHaptic} from '../../utils/haptics';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'accent';
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
  const theme = useTheme();
  // colors가 객체인지 확인하고 안전하게 처리
  const colors = (theme && typeof theme.colors === 'object' && theme.colors) || {
    primary: '#FD5068',
    primaryScale: {
      50: '#FFF1F2',
      100: '#FFE4E6',
      200: '#FECDD3',
      300: '#FDA4AF',
      400: '#FB7185',
      500: '#FD5068',
      600: '#E8395F',
      700: '#BE185D',
      800: '#9F1239',
      900: '#881337',
    },
    neutral: {
      0: '#FFFFFF',
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#E5E5E5',
      300: '#D4D4D4',
      400: '#A3A3A3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      1000: '#000000',
    },
    error: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
    },
  };
  const isDark = theme?.isDark || false;
  
  // primaryScale이 없으면 primary 문자열을 사용
  const primaryColor = typeof colors.primaryScale === 'object' && colors.primaryScale?.[500] 
    ? colors.primaryScale[500] 
    : (typeof colors.primary === 'string' ? colors.primary : '#FD5068');

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
    // 2026 디자인 시스템: 그림자 제거 또는 매우 얕은 그림자
    const baseContainer: ViewStyle = {
      // 그림자 제거 (Flat 스타일)
    };
    // 2026 디자인 시스템: Bold 최소화
    const baseText: TextStyle = {
      fontWeight: typography.fontWeight.regular,  // semibold → regular
    };

    const neutral0 = typeof colors.neutral === 'object' ? colors.neutral[0] : '#FFFFFF';
    const neutral200 = typeof colors.neutral === 'object' ? colors.neutral[200] : '#E8E8E8';
    const neutral500 = typeof colors.neutral === 'object' ? colors.neutral[500] : '#737373';
    const neutral700 = typeof colors.neutral === 'object' ? colors.neutral[700] : '#404040';
    const neutral900 = typeof colors.neutral === 'object' ? colors.neutral[900] : '#171717';
    const error500 = typeof colors.error === 'object' ? colors.error[500] : '#EF4444';
    const accentColor = typeof colors.accent === 'string' ? colors.accent : '#EC4899';
    
    switch (variant) {
      case 'primary':
        // 뉴트럴 700 배경, 뉴트럴 0 텍스트 (눈에 띄지 않게)
        return {
          container: {
            backgroundColor: neutral700,
          },
          text: {
            ...baseText,
            color: neutral0,
          },
        };
      case 'secondary':
        // 투명 배경, 뉴트럴 700 텍스트, 얕은 테두리
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: neutral200,  // 매우 얕은 테두리
          },
          text: {
            ...baseText,
            color: neutral700,
          },
        };
      case 'ghost':
        // 완전 투명, 뉴트럴 500 텍스트
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: {
            ...baseText,
            color: neutral500,
          },
        };
      case 'destructive':
        return {
          container: {
            backgroundColor: error500,
          },
          text: {
            ...baseText,
            color: neutral0,
          },
        };
      case 'accent':
        // 브랜드 컬러 (좋아요, 중요한 액션에만 사용)
        return {
          container: {
            backgroundColor: accentColor,
          },
          text: {
            ...baseText,
            color: neutral0,
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
            fontSize: typography.fontSize.sm,
          },
        };
      case 'md':
        return {
          container: {
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            borderRadius: borderRadius.xl, // 틴더 스타일: 더 둥근 모서리
          },
          text: {
            fontSize: typography.fontSize.base,
          },
        };
      case 'lg':
        return {
          container: {
            paddingVertical: spacing.lg - 6,
            paddingHorizontal: spacing.xl,
            borderRadius: borderRadius.xl, // 틴더 스타일: 더 둥근 모서리
          },
          text: {
            fontSize: typography.fontSize.lg,
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
          color={variant === 'ghost' ? primaryColor : (typeof colors.neutral === 'object' ? colors.neutral[0] : '#FFFFFF')}
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
