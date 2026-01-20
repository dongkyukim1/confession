/**
 * Card Component - 프리미엄 디자인 시스템
 *
 * 고급스러운 깊이감과 글래스모피즘 효과
 * - 다양한 variants: elevated, outlined, filled, glass, gradient
 * - 프리미엄 섀도우 및 애니메이션
 * - 다크모드 최적화
 */
import React, {useRef, useCallback, memo} from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Pressable,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../../contexts/ThemeContext';
import {shadows, gradients, glassmorphism} from '../../theme/colors';
import {spacing, borderRadius} from '../../theme/spacing';
import {triggerHaptic} from '../../utils/haptics';

type CardVariant = 'elevated' | 'outlined' | 'filled' | 'glass' | 'gradient' | 'soft';
type CardElevation = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  elevation?: CardElevation;
  onPress?: () => void;
  style?: ViewStyle;
  padding?: keyof typeof spacing;
  radius?: keyof typeof borderRadius;
  haptic?: boolean;
  animated?: boolean;
}

export const Card = memo(({
  children,
  variant = 'elevated',
  elevation = 'md',
  onPress,
  style,
  padding = 4,
  radius = 'xl',
  haptic = true,
  animated = true,
}: CardProps) => {
  const theme = useTheme();
  const colors = theme?.colors;
  const isDark = theme?.isDark || false;

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // 안전한 색상 추출
  const neutral0 = colors?.neutral?.[0] || '#FFFFFF';
  const neutral50 = colors?.neutral?.[50] || '#FAFAFA';
  const neutral100 = colors?.neutral?.[100] || '#F5F5F5';
  const neutral200 = colors?.neutral?.[200] || '#E5E5E5';

  const themeShadows = isDark ? shadows.dark : shadows.light;
  const themeGradients = isDark ? gradients.dark : gradients.light;

  const handlePressIn = useCallback(() => {
    if (!animated) return;
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.99, // 프리미엄: 더 미세한 스케일 (0.98 → 0.99)
        damping: 20, // 더 부드러운 댐핑
        stiffness: 280,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.96, // 약간 더 높은 투명도
        duration: 80, // 더 빠른 응답
        useNativeDriver: true,
      }),
    ]).start();
  }, [animated, scaleAnim, opacityAnim]);

  const handlePressOut = useCallback(() => {
    if (!animated) return;
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 15, // 더 부드러운 복귀
        stiffness: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 120, // 더 빠른 복귀
        useNativeDriver: true,
      }),
    ]).start();
  }, [animated, scaleAnim, opacityAnim]);

  const handlePress = useCallback(() => {
    if (haptic) {
      triggerHaptic('impactLight');
    }
    onPress?.();
  }, [haptic, onPress]);

  // 섀도우 스타일 가져오기
  const getShadowStyle = () => {
    if (elevation === 'none') return {};
    const shadowStyle = themeShadows[elevation];
    if (shadowStyle === 'none' || typeof shadowStyle === 'string') return {};
    return shadowStyle;
  };

  // 배리언트별 스타일
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: neutral0,
          ...getShadowStyle(),
        };
      case 'outlined':
        return {
          backgroundColor: neutral0,
          borderWidth: 1,
          borderColor: neutral200,
        };
      case 'filled':
        return {
          backgroundColor: isDark ? neutral100 : neutral50,
        };
      case 'glass':
        const glassStyle = isDark ? glassmorphism.dark : glassmorphism.light;
        return {
          backgroundColor: glassStyle.background,
          borderWidth: glassStyle.borderWidth,
          borderColor: glassStyle.border,
          ...getShadowStyle(),
        };
      case 'soft':
        return {
          backgroundColor: neutral50,
          ...themeShadows.xs,
        };
      case 'gradient':
        return {
          ...getShadowStyle(),
        };
      default:
        return {
          backgroundColor: neutral0,
        };
    }
  };

  const containerStyle: ViewStyle[] = [
    styles.container,
    getVariantStyles(),
    {
      padding: spacing[padding],
      borderRadius: borderRadius[radius],
    },
    style,
  ];

  // 그라디언트 카드
  if (variant === 'gradient') {
    const gradientColors = themeGradients.card;

    if (onPress) {
      return (
        <Animated.View
          style={[
            {transform: [{scale: scaleAnim}], opacity: opacityAnim},
          ]}>
          <Pressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}>
            <LinearGradient
              colors={gradientColors as unknown as string[]}
              start={{x: 0, y: 0}}
              end={{x: 0, y: 1}}
              style={[
                containerStyle,
                getShadowStyle(),
              ]}>
              {children}
            </LinearGradient>
          </Pressable>
        </Animated.View>
      );
    }

    return (
      <LinearGradient
        colors={gradientColors as unknown as string[]}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={[containerStyle, getShadowStyle()]}>
        {children}
      </LinearGradient>
    );
  }

  if (onPress) {
    return (
      <Animated.View
        style={[
          {transform: [{scale: scaleAnim}], opacity: opacityAnim},
        ]}>
        <Pressable
          style={containerStyle}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}>
          {children}
        </Pressable>
      </Animated.View>
    );
  }

  return <View style={containerStyle}>{children}</View>;
});

Card.displayName = 'Card';

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});

export default Card;
