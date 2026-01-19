/**
 * NetworkContext - 네트워크 상태 관리
 * 오프라인 감지 및 네트워크 상태 전역 관리
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import {AppState, AppStateStatus} from 'react-native';

// NetInfo가 설치되어 있는지 확인 (옵셔널 의존성)
let NetInfo: typeof import('@react-native-community/netinfo').default | null =
  null;
try {
  NetInfo = require('@react-native-community/netinfo').default;
} catch {
  console.log(
    '[NetworkContext] @react-native-community/netinfo not installed, using fallback',
  );
}

// =====================================================
// 타입 정의
// =====================================================

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
  isWifi: boolean;
  isCellular: boolean;
}

interface NetworkContextValue {
  // 상태
  networkState: NetworkState;
  isOnline: boolean;
  isOffline: boolean;

  // 동작
  refreshNetworkState: () => Promise<void>;

  // 유틸
  getConnectionQuality: () => 'good' | 'moderate' | 'poor' | 'offline';
}

const defaultNetworkState: NetworkState = {
  isConnected: true,
  isInternetReachable: true,
  type: 'unknown',
  isWifi: false,
  isCellular: false,
};

const NetworkContext = createContext<NetworkContextValue | null>(null);

// =====================================================
// Provider 컴포넌트
// =====================================================

interface NetworkProviderProps {
  children: ReactNode;
}

export function NetworkProvider({children}: NetworkProviderProps) {
  const [networkState, setNetworkState] =
    useState<NetworkState>(defaultNetworkState);

  // 네트워크 상태 업데이트
  const updateNetworkState = useCallback((state: any) => {
    if (!state) {
      return;
    }

    setNetworkState({
      isConnected: state.isConnected ?? true,
      isInternetReachable: state.isInternetReachable ?? true,
      type: state.type ?? 'unknown',
      isWifi: state.type === 'wifi',
      isCellular: state.type === 'cellular',
    });
  }, []);

  // 네트워크 상태 새로고침
  const refreshNetworkState = useCallback(async () => {
    if (!NetInfo) {
      // NetInfo 없으면 기본값 유지
      return;
    }

    try {
      const state = await NetInfo.fetch();
      updateNetworkState(state);
    } catch (error) {
      console.error('[NetworkContext] Failed to fetch network state:', error);
    }
  }, [updateNetworkState]);

  // 초기 로드 및 구독
  useEffect(() => {
    // NetInfo가 없으면 기본값 사용
    if (!NetInfo) {
      console.log('[NetworkContext] Using default online state (NetInfo not available)');
      return;
    }

    // 초기 상태 가져오기
    NetInfo.fetch().then(updateNetworkState);

    // 네트워크 상태 변화 구독
    const unsubscribe = NetInfo.addEventListener(updateNetworkState);

    return () => {
      unsubscribe();
    };
  }, [updateNetworkState]);

  // 앱 상태 변화 시 네트워크 새로고침
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        refreshNetworkState();
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, [refreshNetworkState]);

  // 편의 속성
  const isOnline = useMemo(
    () =>
      networkState.isConnected &&
      (networkState.isInternetReachable === null ||
        networkState.isInternetReachable === true),
    [networkState.isConnected, networkState.isInternetReachable],
  );

  const isOffline = useMemo(() => !isOnline, [isOnline]);

  // 연결 품질 판단
  const getConnectionQuality = useCallback((): 'good' | 'moderate' | 'poor' | 'offline' => {
    if (!networkState.isConnected) {
      return 'offline';
    }
    if (networkState.isInternetReachable === false) {
      return 'poor';
    }
    if (networkState.isWifi) {
      return 'good';
    }
    if (networkState.isCellular) {
      return 'moderate';
    }
    return 'moderate';
  }, [networkState]);

  const value = useMemo(
    () => ({
      networkState,
      isOnline,
      isOffline,
      refreshNetworkState,
      getConnectionQuality,
    }),
    [networkState, isOnline, isOffline, refreshNetworkState, getConnectionQuality],
  );

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
}

// =====================================================
// Hook
// =====================================================

export function useNetwork(): NetworkContextValue {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}

// =====================================================
// 단순 연결 상태만 필요한 경우
// =====================================================

export function useIsOnline(): boolean {
  const {isOnline} = useNetwork();
  return isOnline;
}

export function useIsOffline(): boolean {
  const {isOffline} = useNetwork();
  return isOffline;
}

export default NetworkContext;
