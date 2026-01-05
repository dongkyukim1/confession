/**
 * 앱 전역 타입 정의
 */

export * from './database';

// 네비게이션 타입
export type RootStackParamList = {
  MainTabs: undefined;
  Write: undefined;
  Reveal: {confessionId: string};
};

export type BottomTabParamList = {
  Home: undefined;
  MyDiary: undefined;
  ViewedDiary: undefined;
  Profile: undefined;
};

// 앱 상태 타입
export interface AppState {
  hasWrittenConfession: boolean;
  deviceId: string | null;
}

// 조회한 고백 타입
export interface ViewedConfession {
  id: string;
  device_id: string;
  confession_id: string;
  viewed_at: string;
  confession?: Confession;
}

