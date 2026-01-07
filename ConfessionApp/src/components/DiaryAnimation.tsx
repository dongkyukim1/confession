/**
 * 일기 애니메이션 컴포넌트
 * 
 * 일기 작성/열람 관련 화면에 사용되는 애니메이션
 */

import React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';
import {LottieAnimation} from './LottieAnimation';
import {spacing} from '../theme';

interface DiaryAnimationProps {
  /** 컨테이너 스타일 */
  style?: ViewStyle;
  /** 애니메이션 크기 */
  size?: number;
  /** 자동 재생 여부 */
  autoPlay?: boolean;
  /** 반복 재생 여부 */
  loop?: boolean;
}

/**
 * 일기 관련 Lottie 애니메이션
 * 
 * 글 작성 완료, 일기 열람 등의 상황에서 사용
 * 
 * @example
 * ```tsx
 * // 일기 작성 완료 화면
 * <DiaryAnimation size={300} loop={false} />
 * 
 * // 일기장 메인 화면
 * <DiaryAnimation size={200} />
 * ```
 */
export const DiaryAnimation: React.FC<DiaryAnimationProps> = ({
  style,
  size = 250,
  autoPlay = true,
  loop = true,
}) => {
  return (
    <View style={[styles.container, style]}>
      <LottieAnimation
        type="diary"
        size={size}
        autoPlay={autoPlay}
        loop={loop}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
});


