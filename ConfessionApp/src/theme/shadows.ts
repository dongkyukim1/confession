/**
 * 그림자 시스템
 * 
 * 부드럽고 자연스러운 elevation을 위한 그림자 스타일
 */

import {ViewStyle} from 'react-native';

export const shadows = {
  // 작은 그림자 - 약간 떠있는 느낌
  small: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  } as ViewStyle,
  
  // 중간 그림자 - 카드 등에 사용
  medium: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  } as ViewStyle,
  
  // 큰 그림자 - 모달, 플로팅 요소
  large: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  } as ViewStyle,
  
  // 특별한 그림자 - 버튼 등의 포인트 요소
  primary: {
    shadowColor: '#5B5FEF',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  } as ViewStyle,
  
  // 그림자 없음
  none: {
    shadowColor: 'transparent',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as ViewStyle,
} as const;

export type ShadowKey = keyof typeof shadows;






