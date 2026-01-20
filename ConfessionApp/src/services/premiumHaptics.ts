/**
 * Premium Haptics Service
 *
 * 프리미엄 햅틱 피드백 서비스
 * 고급스러운 터치 피드백 패턴 제공
 */
import {triggerHaptic} from '../utils/haptics';

/**
 * 프리미엄 햅틱 패턴 서비스
 */
export const PremiumHaptics = {
  /**
   * 부드러운 탭 (버튼, 카드 터치)
   */
  softTap: () => {
    triggerHaptic('impactLight');
  },

  /**
   * 성공 피드백 (완료, 저장 성공)
   */
  success: () => {
    triggerHaptic('notificationSuccess');
  },

  /**
   * 임계점 피드백 (스와이프 임계점 도달)
   */
  threshold: () => {
    triggerHaptic('impactMedium');
  },

  /**
   * 새로고침 피드백 (Pull-to-refresh)
   * 연속 두 번의 미세한 진동
   */
  refresh: () => {
    triggerHaptic('impactLight');
    setTimeout(() => {
      triggerHaptic('impactMedium');
    }, 80);
  },

  /**
   * 선택 피드백 (토글, 옵션 선택)
   */
  selection: () => {
    triggerHaptic('impactLight');
  },

  /**
   * 경고 피드백 (삭제 확인, 위험 동작)
   */
  warning: () => {
    triggerHaptic('notificationWarning');
  },

  /**
   * 에러 피드백 (실패, 오류)
   */
  error: () => {
    triggerHaptic('notificationError');
  },

  /**
   * 드래그 시작 피드백
   */
  dragStart: () => {
    triggerHaptic('impactLight');
  },

  /**
   * 드래그 끝 피드백 (드롭)
   */
  dragEnd: () => {
    triggerHaptic('impactMedium');
  },

  /**
   * 리스트 아이템 스와이프 피드백
   * 스와이프 방향에 따른 연속 진동
   */
  swipe: () => {
    triggerHaptic('impactLight');
    setTimeout(() => {
      triggerHaptic('impactLight');
    }, 60);
  },

  /**
   * FAB 탭 피드백 (플로팅 액션 버튼)
   */
  fabTap: () => {
    triggerHaptic('impactMedium');
  },

  /**
   * 좋아요/싫어요 피드백
   */
  like: () => {
    triggerHaptic('impactLight');
    setTimeout(() => {
      triggerHaptic('notificationSuccess');
    }, 50);
  },

  /**
   * 탭 전환 피드백
   */
  tabSwitch: () => {
    triggerHaptic('impactLight');
  },

  /**
   * 모달 열림 피드백
   */
  modalOpen: () => {
    triggerHaptic('impactMedium');
  },

  /**
   * 모달 닫힘 피드백
   */
  modalClose: () => {
    triggerHaptic('impactLight');
  },
};

export default PremiumHaptics;
