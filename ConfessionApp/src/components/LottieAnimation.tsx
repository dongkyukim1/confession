/**
 * Lottie 애니메이션 컴포넌트
 * 
 * Lottie JSON 파일을 렌더링하는 재사용 가능한 컴포넌트
 */

import React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';
import LottieView from 'lottie-react-native';
import {ANIMATIONS} from '../constants/assets';

type AnimationType = keyof typeof ANIMATIONS;

interface LottieAnimationProps {
  /** 애니메이션 타입 */
  type: AnimationType;
  /** 자동 재생 여부 */
  autoPlay?: boolean;
  /** 반복 재생 여부 */
  loop?: boolean;
  /** 컨테이너 스타일 */
  style?: ViewStyle;
  /** 애니메이션 크기 (width, height 동일) */
  size?: number;
  /** 재생 속도 (1.0이 기본) */
  speed?: number;
}

/**
 * Lottie 애니메이션을 렌더링하는 컴포넌트
 * 
 * @example
 * ```tsx
 * // 기본 사용
 * <LottieAnimation type="loading" />
 * 
 * // 커스텀 설정
 * <LottieAnimation 
 *   type="diary" 
 *   size={200}
 *   loop={false}
 *   speed={1.5}
 * />
 * ```
 */
export const LottieAnimation: React.FC<LottieAnimationProps> = ({
  type,
  autoPlay = true,
  loop = true,
  style,
  size = 200,
  speed = 1.0,
}) => {
  return (
    <View style={[styles.container, style]}>
      <LottieView
        source={ANIMATIONS[type]}
        autoPlay={autoPlay}
        loop={loop}
        speed={speed}
        style={{
          width: size,
          height: size,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});



