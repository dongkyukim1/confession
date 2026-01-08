/**
 * Card Component
 *
 * 2026 디자인 시스템: Soft shadow 또는 그림자 제거
 * - 배경은 뉴트럴 0 (순백)
 * - 테두리는 뉴트럴 200 (매우 얕음)
 */
import React from 'react';
import {View, StyleSheet, ViewStyle, Pressable} from 'react-native';
import {useTheme} from '../../contexts/ThemeContext';
import {spacing, borderRadius, shadows} from '../../theme';
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
  const theme = useTheme();
  // colors가 객체인지 확인하고 안전하게 처리
  const colors = (theme && typeof theme.colors === 'object' && theme.colors) || {
    neutral: {
      0: '#FFFFFF',
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#E5E5E5',
    },
  };
  const isDark = theme?.isDark || false;
  
  const neutral0 = typeof colors.neutral === 'object' ? colors.neutral[0] : '#FFFFFF';
  const neutral50 = typeof colors.neutral === 'object' ? colors.neutral[50] : '#FAFAFA';
  const neutral100 = typeof colors.neutral === 'object' ? colors.neutral[100] : '#F5F5F5';
  const neutral200 = typeof colors.neutral === 'object' ? colors.neutral[200] : '#E5E5E5';

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        // 2026 디자인 시스템: 그림자 제거 (Flat 스타일)
        return {
          backgroundColor: neutral0,
          // 그림자 제거
        };
      case 'outlined':
        // 뉴트럴 0 배경, 뉴트럴 200 테두리 (매우 얕음)
        return {
          backgroundColor: neutral0,
          borderWidth: 1,
          borderColor: neutral200,
        };
      case 'filled':
        // 배경은 뉴트럴 50/100
        return {
          backgroundColor: isDark ? neutral100 : neutral50,
        };
    }
  };

  const containerStyle: ViewStyle[] = [
    styles.container,
    getVariantStyles(),
    {
      padding: spacing[padding],
      borderRadius: borderRadius.xl, // 틴더 스타일: 더 둥근 모서리
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
