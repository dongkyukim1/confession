/**
 * 애니메이션 빈 상태 컴포넌트
 * 
 * Lottie 애니메이션을 사용한 빈 상태 표시
 */

import React from 'react';
import {View, Text, StyleSheet, ViewStyle} from 'react-native';
import LottieView from 'lottie-react-native';
import {typography, spacing} from '../theme';
import {useTheme} from '../contexts/ThemeContext';
import {ANIMATIONS} from '../constants/assets';

interface AnimatedEmptyStateProps {
  /** 빈 상태 제목 */
  title?: string;
  /** 빈 상태 설명 */
  description?: string;
  /** 애니메이션 크기 */
  size?: number;
  /** 컨테이너 스타일 */
  style?: ViewStyle;
}

/**
 * Lottie 애니메이션을 사용한 빈 상태 컴포넌트
 * 
 * @example
 * ```tsx
 * <AnimatedEmptyState 
 *   title="일기가 없어요" 
 *   description="첫 일기를 작성해보세요" 
 * />
 * ```
 */
export const AnimatedEmptyState: React.FC<AnimatedEmptyStateProps> = ({
  title = '데이터가 없습니다',
  description,
  size = 200,
  style,
}) => {
  const {colors} = useTheme();
  const styles = getStyles(colors, size);

  return (
    <View style={[styles.container, style]}>
      <LottieView
        source={ANIMATIONS.emptyDocument}
        autoPlay
        loop
        style={styles.animation}
      />
      
      <Text style={styles.title}>{title}</Text>
      
      {description && (
        <Text style={styles.description}>{description}</Text>
      )}
    </View>
  );
};

const getStyles = (colors: any, size: number) => StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.xl,
  },
  animation: {
    width: size,
    height: size,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
