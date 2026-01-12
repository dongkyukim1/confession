/**
 * Tag Component - 프리미엄 디자인 시스템
 *
 * 고급스러운 라벨/배지 컴포넌트
 * - 그라디언트 배경 옵션
 * - 프리미엄 애니메이션
 * - 다양한 사이즈와 배리언트
 */
import React, {useRef, useCallback, memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  Pressable,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../../contexts/ThemeContext';
import {shadows, gradients} from '../../theme/colors';
import {borderRadius} from '../../theme/spacing';
import {typography} from '../../theme/typography';
import {triggerHaptic} from '../../utils/haptics';

type TagVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'gradient' | 'outline';
type TagSize = 'xs' | 'sm' | 'md' | 'lg';

interface TagProps {
  children: React.ReactNode;
  variant?: TagVariant;
  size?: TagSize;
  onPress?: () => void;
  selected?: boolean;
  style?: ViewStyle;
  icon?: string;
  closable?: boolean;
  onClose?: () => void;
}

export const Tag = memo(({
  children,
  variant = 'default',
  size = 'md',
  onPress,
  selected = false,
  style,
  icon,
  closable = false,
  onClose,
}: TagProps) => {
  const theme = useTheme();
  const colors = theme?.colors;
  const isDark = theme?.isDark || false;

  const scaleAnim = useRef(new Animated.Value(1)).current;

  // 안전한 색상 추출
  const neutral0 = colors?.neutral?.[0] || '#FFFFFF';
  const neutral100 = colors?.neutral?.[100] || '#F5F5F5';
  const neutral200 = colors?.neutral?.[200] || '#E5E5E5';
  const neutral700 = colors?.neutral?.[700] || '#404040';

  const primaryScale = colors?.primaryScale || {50: '#EEF2FF', 500: '#6366F1', 700: '#4338CA'};
  const successScale = typeof colors?.success === 'object' ? colors.success : {50: '#F0FDF4', 500: '#22C55E', 700: '#15803D'};
  const warningScale = typeof colors?.warning === 'object' ? colors.warning : {50: '#FFFBEB', 500: '#F59E0B', 700: '#B45309'};
  const errorScale = typeof colors?.error === 'object' ? colors.error : {50: '#FEF2F2', 500: '#EF4444', 700: '#B91C1C'};

  const themeShadows = isDark ? shadows.dark : shadows.light;
  const themeGradients = isDark ? gradients.dark : gradients.light;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      damping: 15,
      stiffness: 300,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      damping: 12,
      stiffness: 200,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    if (onPress) {
      triggerHaptic('impactLight');
      onPress();
    }
  }, [onPress]);

  const handleClose = useCallback(() => {
    if (onClose) {
      triggerHaptic('impactLight');
      onClose();
    }
  }, [onClose]);

  // 사이즈별 스타일
  const sizeStyles = {
    xs: {
      paddingVertical: 2,
      paddingHorizontal: 8,
      fontSize: typography.fontSize['2xs'] || 10,
      iconSize: 10,
      gap: 4,
    },
    sm: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      fontSize: typography.fontSize.xs,
      iconSize: 12,
      gap: 4,
    },
    md: {
      paddingVertical: 6,
      paddingHorizontal: 14,
      fontSize: typography.fontSize.sm,
      iconSize: 14,
      gap: 6,
    },
    lg: {
      paddingVertical: 8,
      paddingHorizontal: 18,
      fontSize: typography.fontSize.base,
      iconSize: 16,
      gap: 8,
    },
  };

  const currentSize = sizeStyles[size];

  // 배리언트별 스타일
  const getVariantStyles = (): {
    backgroundColor: string;
    color: string;
    borderColor?: string;
    borderWidth?: number;
  } => {
    if (selected) {
      return {
        backgroundColor: primaryScale[500],
        color: neutral0,
      };
    }

    switch (variant) {
      case 'primary':
        return {
          backgroundColor: primaryScale[50],
          color: primaryScale[700],
        };
      case 'success':
        return {
          backgroundColor: successScale[50],
          color: successScale[700],
        };
      case 'warning':
        return {
          backgroundColor: warningScale[50],
          color: warningScale[700],
        };
      case 'error':
        return {
          backgroundColor: errorScale[50],
          color: errorScale[700],
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: neutral700,
          borderColor: neutral200,
          borderWidth: 1,
        };
      case 'gradient':
        return {
          backgroundColor: 'transparent',
          color: neutral0,
        };
      default:
        return {
          backgroundColor: neutral100,
          color: neutral700,
        };
    }
  };

  const variantStyles = getVariantStyles();

  const containerStyle: ViewStyle[] = [
    styles.container,
    {
      paddingVertical: currentSize.paddingVertical,
      paddingHorizontal: currentSize.paddingHorizontal,
      gap: currentSize.gap,
      backgroundColor: variantStyles.backgroundColor,
      borderColor: variantStyles.borderColor,
      borderWidth: variantStyles.borderWidth,
    },
    selected && themeShadows.xs,
    style,
  ];

  const textStyle = {
    color: variantStyles.color,
    fontSize: currentSize.fontSize,
    fontWeight: '500' as const,
  };

  const renderContent = () => (
    <>
      {icon && (
        <Text style={[styles.icon, {fontSize: currentSize.iconSize}]}>{icon}</Text>
      )}
      <Text style={textStyle}>{children}</Text>
      {closable && (
        <Pressable onPress={handleClose} hitSlop={8}>
          <Text style={[styles.closeIcon, {color: variantStyles.color, fontSize: currentSize.iconSize}]}>
            ×
          </Text>
        </Pressable>
      )}
    </>
  );

  // 그라디언트 태그
  if (variant === 'gradient' && !selected) {
    const gradientColors = themeGradients.primary;

    const content = (
      <LinearGradient
        colors={gradientColors as unknown as string[]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={[
          containerStyle,
          {backgroundColor: undefined},
        ]}>
        {renderContent()}
      </LinearGradient>
    );

    if (onPress) {
      return (
        <Animated.View style={{transform: [{scale: scaleAnim}]}}>
          <Pressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}>
            {content}
          </Pressable>
        </Animated.View>
      );
    }

    return content;
  }

  const content = <View style={containerStyle}>{renderContent()}</View>;

  if (onPress) {
    return (
      <Animated.View style={{transform: [{scale: scaleAnim}]}}>
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}>
          {content}
        </Pressable>
      </Animated.View>
    );
  }

  return content;
});

Tag.displayName = 'Tag';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  icon: {
    lineHeight: 16,
  },
  closeIcon: {
    fontWeight: '700',
    marginLeft: 2,
  },
});

export default Tag;
