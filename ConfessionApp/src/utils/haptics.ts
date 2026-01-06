/**
 * 햅틱 피드백 유틸리티
 * 
 * iOS와 Android에서 진동 피드백을 제공합니다.
 */
import {Platform, Vibration} from 'react-native';

/**
 * 경량 햅틱 피드백 (버튼 클릭용)
 */
export const lightHaptic = () => {
  if (Platform.OS === 'ios') {
    // iOS에서는 짧은 진동
    Vibration.vibrate(10);
  } else {
    // Android에서는 매우 짧은 진동
    Vibration.vibrate(10);
  }
};

/**
 * 중급 햅틱 피드백 (성공/경고용)
 */
export const mediumHaptic = () => {
  if (Platform.OS === 'ios') {
    Vibration.vibrate(20);
  } else {
    Vibration.vibrate(20);
  }
};

/**
 * 강한 햅틱 피드백 (에러/파괴적 액션용)
 */
export const strongHaptic = () => {
  if (Platform.OS === 'ios') {
    Vibration.vibrate([0, 30]);
  } else {
    Vibration.vibrate(30);
  }
};

/**
 * 성공 패턴 햅틱 (짧은-길게-짧은)
 */
export const successHaptic = () => {
  if (Platform.OS === 'ios') {
    Vibration.vibrate([0, 10, 50, 15]);
  } else {
    Vibration.vibrate([0, 10, 50, 15]);
  }
};

/**
 * 에러 패턴 햅틱 (두 번 짧게)
 */
export const errorHaptic = () => {
  if (Platform.OS === 'ios') {
    Vibration.vibrate([0, 15, 30, 15]);
  } else {
    Vibration.vibrate([0, 15, 30, 15]);
  }
};





