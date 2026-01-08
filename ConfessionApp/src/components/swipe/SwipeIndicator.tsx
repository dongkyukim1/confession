/**
 * 스와이프 방향 인디케이터
 *
 * 드래그 중 방향 피드백을 시각적으로 표시
 */

import React from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {SwipeDirection, SWIPE_DIRECTIONS} from '../../utils/gestureConfig';
import {spacing, typography, borderRadius} from '../../theme';

interface SwipeIndicatorProps {
  direction: SwipeDirection;
  opacity: Animated.AnimatedInterpolation<number>;
  style?: any;
}

export const SwipeIndicator: React.FC<SwipeIndicatorProps> = ({
  direction,
  opacity,
  style,
}) => {
  const config = SWIPE_DIRECTIONS[direction];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          backgroundColor: config.color,
        },
        style,
      ]}
    >
      <Text style={styles.icon}>{config.icon}</Text>
      <Text style={styles.label}>{config.label}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    fontSize: 40,
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.styles.captionBold,
    color: '#FFFFFF',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
});

export default SwipeIndicator;
