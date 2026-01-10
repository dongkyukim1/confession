/**
 * 그림자 시스템
 * 
 * 2026 디자인 시스템: 그림자를 매우 얕게 조정
 * UI는 보이지 않을수록 좋음 - 콘텐츠가 주인공
 */

import {ViewStyle} from 'react-native';

export const shadows = {
  // 작은 그림자 - 매우 미세한 elevation
  small: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  } as ViewStyle,
  
  // 중간 그림자 - 카드 등에 사용 (매우 얕게)
  medium: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  } as ViewStyle,
  
  // 큰 그림자 - 모달, 플로팅 요소 (매우 얕게)
  large: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  } as ViewStyle,
  
  // 특별한 그림자 - 거의 사용하지 않음 (매우 얕게)
  primary: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
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






