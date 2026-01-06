/**
 * 애니메이션 로딩 컴포넌트
 * 
 * Lottie 애니메이션을 사용한 로딩 인디케이터
 */

import React from 'react';
import {View, Text, StyleSheet, ViewStyle} from 'react-native';
import LottieView from 'lottie-react-native';
import {typography, spacing} from '../theme';
import {useTheme} from '../contexts/ThemeContext';
import {ANIMATIONS} from '../constants/assets';

interface AnimatedLoadingProps {
  /** 로딩 메시지 */
  message?: string;
  /** 애니메이션 크기 */
  size?: number;
  /** 컨테이너 스타일 */
  style?: ViewStyle;
  /** 전체 화면으로 표시할지 여부 */
  fullScreen?: boolean;
}

/**
 * Lottie 애니메이션을 사용한 로딩 컴포넌트
 * 
 * @example
 * ```tsx
 * // 기본 사용
 * <AnimatedLoading message="불러오는 중..." />
 * 
 * // 전체 화면
 * <AnimatedLoading fullScreen message="처리 중..." />
 * ```
 */
export const AnimatedLoading: React.FC<AnimatedLoadingProps> = ({
  message = '잠시만 기다려주세요...',
  size = 150,
  style,
  fullScreen = false,
}) => {
  const {colors} = useTheme();
  const styles = getStyles(colors, size);

  return (
    <View style={[fullScreen ? styles.fullScreenContainer : styles.container, style]}>
      <LottieView
        source={ANIMATIONS.loading}
        autoPlay
        loop
        style={styles.animation}
      />
      
      {message && (
        <Text style={styles.message}>{message}</Text>
      )}
    </View>
  );
};

const getStyles = (colors: any, size: number) => StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  fullScreenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  animation: {
    width: size,
    height: size,
    marginBottom: spacing.md,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
