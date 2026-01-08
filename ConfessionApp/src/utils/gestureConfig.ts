/**
 * 제스처 설정 시스템
 *
 * Tinder 스타일 스와이프 제스처의 방향별 의미와 액션 정의
 */

// 스와이프 방향 타입
export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

// 스와이프 액션 타입
export type SwipeAction = 'like' | 'dislike' | 'superlike' | 'skip';

// 스와이프 결과 타입
export interface SwipeResult {
  direction: SwipeDirection;
  action: SwipeAction;
  velocity: number;
  distance: number;
}

// 방향별 설정
export interface DirectionConfig {
  action: SwipeAction;
  color: string;
  icon: string;
  label: string;
  description: string;
}

/**
 * 스와이프 방향별 설정
 */
export const SWIPE_DIRECTIONS: Record<SwipeDirection, DirectionConfig> = {
  // 좌측 스와이프: Dislike
  left: {
    action: 'dislike',
    color: '#E94E4E',      // 레드
    icon: '👎',
    label: '싫어요',
    description: '이 고백이 마음에 들지 않아요',
  },

  // 우측 스와이프: Like
  right: {
    action: 'like',
    color: '#21D07C',      // 그린
    icon: '👍',
    label: '좋아요',
    description: '이 고백에 공감해요',
  },

  // 상단 스와이프: Super Like
  up: {
    action: 'superlike',
    color: '#00B8E6',      // 블루
    icon: '⭐',
    label: '최고예요',
    description: '이 고백이 정말 마음에 들어요',
  },

  // 하단 스와이프: Skip
  down: {
    action: 'skip',
    color: '#C7C7CC',      // 회색
    icon: '↓',
    label: '건너뛰기',
    description: '나중에 다시 볼게요',
  },
};

/**
 * 액션별 설정 (역방향 조회용)
 */
export const ACTIONS_TO_DIRECTION: Record<SwipeAction, SwipeDirection> = {
  like: 'right',
  dislike: 'left',
  superlike: 'up',
  skip: 'down',
};

/**
 * 제스처 속도로 방향 감지
 */
export const detectSwipeDirection = (
  velocityX: number,
  velocityY: number
): SwipeDirection | null => {
  const absVX = Math.abs(velocityX);
  const absVY = Math.abs(velocityY);

  // 수평 스와이프가 우세
  if (absVX > absVY) {
    return velocityX > 0 ? 'right' : 'left';
  }

  // 수직 스와이프가 우세
  if (absVY > absVX) {
    return velocityY > 0 ? 'down' : 'up';
  }

  return null;
};

/**
 * 제스처 거리로 방향 감지
 */
export const detectSwipeDirectionByDistance = (
  distanceX: number,
  distanceY: number
): SwipeDirection | null => {
  const absX = Math.abs(distanceX);
  const absY = Math.abs(distanceY);

  // 수평 이동이 우세
  if (absX > absY) {
    return distanceX > 0 ? 'right' : 'left';
  }

  // 수직 이동이 우세
  if (absY > absX) {
    return distanceY > 0 ? 'down' : 'up';
  }

  return null;
};

/**
 * 스와이프 완료 여부 확인
 */
export const isSwipeComplete = (
  velocity: number,
  distance: number,
  velocityThreshold: number = 1000,
  distanceThreshold: number = 120
): boolean => {
  return Math.abs(velocity) > velocityThreshold || Math.abs(distance) > distanceThreshold;
};

/**
 * 오버레이 투명도 계산
 * @param distance 드래그 거리
 * @param startFade 페이드 시작 거리 (default: 40)
 * @param endFade 페이드 완료 거리 (default: 80)
 * @param maxOpacity 최대 투명도 (default: 0.8)
 */
export const calculateOverlayOpacity = (
  distance: number,
  startFade: number = 40,
  endFade: number = 80,
  maxOpacity: number = 0.8
): number => {
  const absDistance = Math.abs(distance);

  if (absDistance < startFade) {
    return 0;
  }

  if (absDistance >= endFade) {
    return maxOpacity;
  }

  // 선형 보간
  const progress = (absDistance - startFade) / (endFade - startFade);
  return progress * maxOpacity;
};

/**
 * 회전 각도 계산
 * @param distance 드래그 거리
 * @param multiplier 회전 배율 (default: 0.15)
 * @param maxRotation 최대 회전 각도 (default: 15)
 */
export const calculateRotation = (
  distance: number,
  multiplier: number = 0.15,
  maxRotation: number = 15
): number => {
  const rotation = distance * multiplier;
  return Math.max(-maxRotation, Math.min(maxRotation, rotation));
};

/**
 * 스와이프 진행 상태 계산
 * @param distance 현재 드래그 거리
 * @param threshold 임계값 거리
 * @returns 0~1 사이의 진행도
 */
export const calculateSwipeProgress = (
  distance: number,
  threshold: number = 120
): number => {
  const absDistance = Math.abs(distance);
  return Math.min(1, absDistance / threshold);
};

/**
 * 제스처 설정 기본값
 */
export const GESTURE_CONFIG = {
  // 임계값
  velocityThreshold: 1000,
  distanceThreshold: 120,

  // 회전
  rotationMultiplier: 0.15,
  maxRotation: 15,

  // 오버레이
  overlayFadeStart: 40,
  overlayFadeEnd: 80,
  maxOverlayOpacity: 0.8,

  // 스케일
  dragScale: 0.95,
  restScale: 1.0,

  // 퇴장 애니메이션 거리
  exitDistance: 500,
  exitDuration: 300,

  // 복귀 애니메이션 설정
  returnSpring: {
    stiffness: 300,
    damping: 20,
  },
} as const;

export default SWIPE_DIRECTIONS;
