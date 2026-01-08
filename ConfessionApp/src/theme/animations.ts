/**
 * 애니메이션 토큰 시스템
 *
 * 2026 디자인 시스템: 빠르고 짧은 애니메이션 (200-300ms)
 * - 감정 흐름을 끊지 않게
 * - 튀는 효과 금지
 */

import {Animated, Easing} from 'react-native';

// 스프링 애니메이션 설정 (2026 디자인 시스템: 튀는 효과 금지)
export const springConfigs = {
  // 카드 스냅 (빠르고 단단함)
  stiff: {
    stiffness: 300,
    damping: 30,  // damping 증가 (튀는 효과 감소)
    mass: 1,
  },
  // 진입 애니메이션 (튀는 효과 제거)
  bouncy: {
    stiffness: 150,
    damping: 25,  // damping 증가 (튀는 효과 제거)
    mass: 1,
  },
  // 부드러운 전환
  gentle: {
    stiffness: 100,
    damping: 20,  // damping 증가
    mass: 1,
  },
  // 미묘한 움직임
  subtle: {
    stiffness: 200,
    damping: 30,  // damping 증가
    mass: 1,
  },
} as const;

// 타이밍 애니메이션 설정 (2026 디자인 시스템: 빠르고 짧게)
export const timingConfigs = {
  instant: 0,
  fast: 200,      // 빠른 애니메이션
  normal: 250,    // 기본 애니메이션 (300 → 250)
  slow: 300,      // 느린 애니메이션 (500 → 300, 최대)
  slower: 300,    // 매우 느린 애니메이션 (800 → 300, 최대)
} as const;

// Easing 함수
export const easings = {
  linear: Easing.linear,
  easeIn: Easing.in(Easing.ease),
  easeOut: Easing.out(Easing.ease),
  easeInOut: Easing.inOut(Easing.ease),
  spring: Easing.elastic(1),
  bounce: Easing.bounce,
} as const;

// 제스처 임계값 설정
export const gestureThresholds = {
  // 스와이프 속도 임계값 (pixels/second)
  swipeVelocity: 1000,
  // 스와이프 거리 임계값 (pixels)
  swipeDistance: 120,
  // 회전 배율 (드래그 거리에 비례)
  rotationMultiplier: 0.15,
  // 피드백 시작 거리
  feedbackDistance: 40,
  // 최대 회전 각도 (degrees)
  maxRotation: 15,
} as const;

// 햅틱 피드백 패턴
export const hapticPatterns = {
  cardFlip: 'impactMedium' as const,
  swipeSuccess: 'notificationSuccess' as const,
  swipeReject: 'notificationWarning' as const,
  swipeSkip: 'impactLight' as const,
  cardPop: 'impactLight' as const,
  buttonPress: 'impactLight' as const,
  achievementUnlock: 'notificationSuccess' as const,
  selectionChanged: 'selectionChanged' as const,
  threshold: 'impactMedium' as const,
} as const;

// 카드 애니메이션 설정
export const cardAnimations = {
  // 카드 진입 애니메이션
  enter: {
    scale: {from: 0.8, to: 1.0},
    opacity: {from: 0, to: 1},
    translateY: {from: 50, to: 0},
    duration: timingConfigs.normal,
    spring: 'bouncy' as const,
  },
  // 카드 퇴장 애니메이션
  exit: {
    duration: timingConfigs.normal,
    spring: 'stiff' as const,
  },
  // 카드 스택 스케일
  stackScale: [1.0, 0.95, 0.90],
  // 카드 스택 Y 오프셋
  stackOffsetY: [0, -5, -10],
  // 카드 스택 투명도
  stackOpacity: [1.0, 0.8, 0.5],
} as const;

// 스와이프 애니메이션 설정
export const swipeAnimations = {
  // 오버레이 페이드인 거리
  overlayFadeStart: 40,
  overlayFadeEnd: 80,
  // 최대 오버레이 투명도
  maxOverlayOpacity: 0.8,
  // 스와이프 방향별 색상
  colors: {
    left: '#E94E4E',   // Dislike 레드
    right: '#21D07C',  // Like 그린
    up: '#00B8E6',     // SuperLike 블루
    down: '#C7C7CC',   // Skip 회색
  },
  // 스와이프 방향별 아이콘
  icons: {
    left: '👎',
    right: '👍',
    up: '⭐',
    down: '↓',
  },
} as const;

// 마이크로 인터랙션 설정 (2026 디자인 시스템: 빠르고 짧게)
export const microInteractions = {
  // 버튼 프레스
  buttonPress: {
    scaleFrom: 1.0,
    scaleTo: 0.97,  // 스케일 변화 최소화
    duration: 150,   // 빠르게 (100 → 150)
  },
  // 카드 탭
  cardTap: {
    scaleFrom: 1.0,
    scaleTo: 0.99,   // 스케일 변화 최소화
    duration: 150,   // 빠르게
  },
  // 토글 스위치
  toggle: {
    duration: 200,   // 빠르게
    spring: 'stiff' as const,
  },
  // 뱃지 펄스 (튀는 효과 제거)
  badgePulse: {
    scaleFrom: 1.0,
    scaleTo: 1.1,    // 스케일 변화 최소화 (1.3 → 1.1)
    duration: 200,   // 빠르게 (400 → 200)
    spring: 'gentle' as const,  // bouncy → gentle (튀는 효과 제거)
  },
} as const;

// 타입 정의
export type SpringPreset = keyof typeof springConfigs;
export type TimingPreset = keyof typeof timingConfigs;
export type EasingPreset = keyof typeof easings;
export type HapticPattern = typeof hapticPatterns[keyof typeof hapticPatterns];

/**
 * 스프링 애니메이션 생성 헬퍼
 */
export const createSpringAnimation = (
  value: Animated.Value,
  toValue: number,
  preset: SpringPreset = 'gentle'
): Animated.CompositeAnimation => {
  return Animated.spring(value, {
    toValue,
    useNativeDriver: true,
    ...springConfigs[preset],
  });
};

/**
 * 타이밍 애니메이션 생성 헬퍼
 */
export const createTimingAnimation = (
  value: Animated.Value,
  toValue: number,
  duration: TimingPreset | number = 'normal',
  easing: EasingPreset = 'easeInOut'
): Animated.CompositeAnimation => {
  const durationValue = typeof duration === 'string' ? timingConfigs[duration] : duration;

  return Animated.timing(value, {
    toValue,
    duration: durationValue,
    easing: easings[easing],
    useNativeDriver: true,
  });
};

/**
 * 시퀀스 애니메이션 생성 헬퍼
 */
export const createSequence = (
  animations: Animated.CompositeAnimation[]
): Animated.CompositeAnimation => {
  return Animated.sequence(animations);
};

/**
 * 병렬 애니메이션 생성 헬퍼
 */
export const createParallel = (
  animations: Animated.CompositeAnimation[]
): Animated.CompositeAnimation => {
  return Animated.parallel(animations);
};

/**
 * 스태거 애니메이션 생성 헬퍼
 */
export const createStagger = (
  delay: number,
  animations: Animated.CompositeAnimation[]
): Animated.CompositeAnimation => {
  return Animated.stagger(delay, animations);
};

// 기본 export
export const animations = {
  spring: springConfigs,
  timing: timingConfigs,
  easing: easings,
  gesture: gestureThresholds,
  haptic: hapticPatterns,
  card: cardAnimations,
  swipe: swipeAnimations,
  micro: microInteractions,

  // 헬퍼 함수
  createSpring: createSpringAnimation,
  createTiming: createTimingAnimation,
  sequence: createSequence,
  parallel: createParallel,
  stagger: createStagger,
} as const;

export default animations;
