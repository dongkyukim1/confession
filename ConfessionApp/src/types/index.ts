/**
 * 타입 정의 통합 Export
 */

// Database 타입
export * from './database';

// Navigation 타입
export type RootStackParamList = {
  MainTabs: undefined;
  Write: undefined;
  Reveal: undefined;
  AnimationShowcase: undefined;
  IconShowcase: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  MyDiary: undefined;
  ViewedDiary: undefined;
  Profile: undefined;
};
