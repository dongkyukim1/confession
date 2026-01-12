/**
 * 스와이프 가능한 카드 컴포넌트
 *
 * PanResponder 기반 제스처 처리와 방향별 애니메이션
 */

import React, {useRef, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import {Confession} from '../../types';
import {
  SwipeDirection,
  SwipeResult,
  detectSwipeDirection,
  isSwipeComplete,
  SWIPE_DIRECTIONS,
  GESTURE_CONFIG,
} from '../../utils/gestureConfig';
import {animations} from '../../theme/animations';
import {triggerHaptic} from '../../utils/haptics';
import SwipeIndicator from './SwipeIndicator';

const {width, height} = Dimensions.get('window');

interface SwipeableCardProps {
  confession: Confession;
  onSwipe: (result: SwipeResult) => void;
  onTap?: () => void;
  isTopCard: boolean;
  index: number;
  renderCard: (confession: Confession) => React.ReactNode;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  confession,
  onSwipe,
  onTap,
  isTopCard,
  index,
  renderCard,
}) => {
  // 애니메이션 값
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;

  // 상태
  const swipeInProgress = useRef(false);
  const lastHapticDirection = useRef<SwipeDirection | null>(null);

  /**
   * 스와이프 완료 처리
   */
  const handleSwipeComplete = useCallback(
    (direction: SwipeDirection, velocity: number, distance: number) => {
      swipeInProgress.current = true;

      const config = SWIPE_DIRECTIONS[direction];
      const exitX = direction === 'left' ? -width * 1.5 : direction === 'right' ? width * 1.5 : 0;
      const exitY = direction === 'up' ? -height * 1.5 : direction === 'down' ? height * 1.5 : 0;

      // 햅틱 피드백
      if (config.action === 'like') {
        triggerHaptic(animations.haptic.swipeSuccess);
      } else if (config.action === 'dislike') {
        triggerHaptic(animations.haptic.swipeReject);
      } else {
        triggerHaptic(animations.haptic.swipeSkip);
      }

      // 퇴장 애니메이션
      Animated.spring(pan, {
        toValue: {x: exitX, y: exitY},
        useNativeDriver: true,
        ...animations.spring.stiff,
      }).start(() => {
        // 콜백 호출
        onSwipe({
          direction,
          action: config.action,
          velocity,
          distance,
        });
      });
    },
    [onSwipe, pan]
  );

  /**
   * PanResponder 설정
   */
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isTopCard,
      onMoveShouldSetPanResponder: () => isTopCard,

      onPanResponderGrant: () => {
        // 드래그 시작
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
        pan.setValue({x: 0, y: 0});
        lastHapticDirection.current = null;

        // 스케일 다운
        Animated.spring(scale, {
          toValue: GESTURE_CONFIG.dragScale,
          useNativeDriver: true,
          ...animations.spring.stiff,
        }).start();
      },

      onPanResponderMove: Animated.event([null, {dx: pan.x, dy: pan.y}], {
        useNativeDriver: false,
        listener: (event, gestureState) => {
          const {dx, dy} = gestureState;

          // 방향 감지
          const direction = detectSwipeDirection(dx, dy);

          // 임계값 도달 시 햅틱
          if (direction && isSwipeComplete(0, dx, 0, GESTURE_CONFIG.distanceThreshold / 2)) {
            if (lastHapticDirection.current !== direction) {
              triggerHaptic(animations.haptic.threshold);
              lastHapticDirection.current = direction;
            }
          }
        },
      }),

      onPanResponderRelease: (event, gestureState) => {
        pan.flattenOffset();

        const {dx, dy, vx, vy} = gestureState;
        const velocityX = vx * 1000;
        const velocityY = vy * 1000;

        // 방향 감지 (속도 우선, 거리 fallback)
        const directionByVelocity = detectSwipeDirection(velocityX, velocityY);
        const directionByDistance = detectSwipeDirection(dx, dy);
        const direction = directionByVelocity || directionByDistance;

        // 스케일 복귀
        Animated.spring(scale, {
          toValue: GESTURE_CONFIG.restScale,
          useNativeDriver: true,
          ...animations.spring.stiff,
        }).start();

        // 스와이프 완료 여부 확인
        if (direction) {
          const velocity = direction === 'left' || direction === 'right' ? velocityX : velocityY;
          const distance = direction === 'left' || direction === 'right' ? dx : dy;

          if (isSwipeComplete(velocity, distance)) {
            handleSwipeComplete(direction, velocity, distance);
            return;
          }
        }

        // 스와이프 미완료 - 복귀
        Animated.spring(pan, {
          toValue: {x: 0, y: 0},
          useNativeDriver: true,
          ...animations.spring.gentle,
        }).start();
      },
    })
  ).current;

  /**
   * 카드 회전 계산
   */
  const rotate = pan.x.interpolate({
    inputRange: [-width, 0, width],
    outputRange: ['-15deg', '0deg', '15deg'],
    extrapolate: 'clamp',
  });

  /**
   * 오버레이 투명도 계산
   */
  const leftOverlayOpacity = pan.x.interpolate({
    inputRange: [-width, -GESTURE_CONFIG.overlayFadeEnd, -GESTURE_CONFIG.overlayFadeStart, 0],
    outputRange: [GESTURE_CONFIG.maxOverlayOpacity, GESTURE_CONFIG.maxOverlayOpacity, 0, 0],
    extrapolate: 'clamp',
  });

  const rightOverlayOpacity = pan.x.interpolate({
    inputRange: [0, GESTURE_CONFIG.overlayFadeStart, GESTURE_CONFIG.overlayFadeEnd, width],
    outputRange: [0, 0, GESTURE_CONFIG.maxOverlayOpacity, GESTURE_CONFIG.maxOverlayOpacity],
    extrapolate: 'clamp',
  });

  const upOverlayOpacity = pan.y.interpolate({
    inputRange: [-height, -GESTURE_CONFIG.overlayFadeEnd, -GESTURE_CONFIG.overlayFadeStart, 0],
    outputRange: [GESTURE_CONFIG.maxOverlayOpacity, GESTURE_CONFIG.maxOverlayOpacity, 0, 0],
    extrapolate: 'clamp',
  });

  const downOverlayOpacity = pan.y.interpolate({
    inputRange: [0, GESTURE_CONFIG.overlayFadeStart, GESTURE_CONFIG.overlayFadeEnd, height],
    outputRange: [0, 0, GESTURE_CONFIG.maxOverlayOpacity, GESTURE_CONFIG.maxOverlayOpacity],
    extrapolate: 'clamp',
  });

  /**
   * 카드 탭 핸들러
   */
  const handleTap = useCallback(() => {
    if (!swipeInProgress.current && onTap) {
      triggerHaptic(animations.haptic.cardPop);
      onTap();
    }
  }, [onTap]);

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.container,
          {
            transform: [
              {translateX: pan.x},
              {translateY: pan.y},
              {rotate},
              {scale},
            ],
            zIndex: isTopCard ? 100 : 100 - index,
          },
        ]}
      >
        {/* 카드 컨텐츠 */}
        <View style={styles.card}>{renderCard(confession)}</View>

        {/* 스와이프 인디케이터 - Left (Dislike) */}
        <SwipeIndicator
          direction="left"
          opacity={leftOverlayOpacity}
          style={styles.indicatorLeft}
        />

        {/* 스와이프 인디케이터 - Right (Like) */}
        <SwipeIndicator
          direction="right"
          opacity={rightOverlayOpacity}
          style={styles.indicatorRight}
        />

        {/* 스와이프 인디케이터 - Up (SuperLike) */}
        <SwipeIndicator direction="up" opacity={upOverlayOpacity} style={styles.indicatorUp} />

        {/* 스와이프 인디케이터 - Down (Skip) */}
        <SwipeIndicator direction="down" opacity={downOverlayOpacity} style={styles.indicatorDown} />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: width * 0.9,
    height: height * 0.7,
    alignSelf: 'center',
  },
  card: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  indicatorLeft: {
    top: 60,
    left: 40,
  },
  indicatorRight: {
    top: 60,
    right: 40,
  },
  indicatorUp: {
    top: 40,
    alignSelf: 'center',
  },
  indicatorDown: {
    bottom: 40,
    alignSelf: 'center',
  },
});

export default SwipeableCard;
