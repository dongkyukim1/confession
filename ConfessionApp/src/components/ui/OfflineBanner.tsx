/**
 * OfflineBanner - 오프라인 상태 표시 배너
 * 네트워크 연결이 끊어졌을 때 상단에 표시
 */
import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../contexts/ThemeContext';
import {useNetwork} from '../../contexts/NetworkContext';
import {alertA11y} from '../../utils/a11y';

interface OfflineBannerProps {
  style?: ViewStyle;
  onRetry?: () => void;
  showRetryButton?: boolean;
}

export function OfflineBanner({
  style,
  onRetry,
  showRetryButton = true,
}: OfflineBannerProps) {
  const {colors} = useTheme();
  const {isOffline, refreshNetworkState} = useNetwork();
  const insets = useSafeAreaInsets();

  // 애니메이션 값
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const isVisible = useRef(false);

  useEffect(() => {
    if (isOffline && !isVisible.current) {
      // 슬라이드 인
      isVisible.current = true;
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else if (!isOffline && isVisible.current) {
      // 슬라이드 아웃
      isVisible.current = false;
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isOffline, slideAnim]);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
    refreshNetworkState();
  };

  // 오프라인 아니면 렌더링 안 함 (애니메이션 완료 후)
  if (!isOffline && !isVisible.current) {
    return null;
  }

  const styles = createStyles(colors, insets.top);

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {transform: [{translateY: slideAnim}]},
      ]}
      {...alertA11y('인터넷 연결이 끊어졌습니다', {isError: true})}>
      <View style={styles.content}>
        <Ionicons
          name="cloud-offline-outline"
          size={20}
          color={colors.neutral?.[0] || '#FFFFFF'}
          style={styles.icon}
        />
        <Text style={styles.text}>인터넷 연결 없음</Text>
        {showRetryButton && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
            accessibilityRole="button"
            accessibilityLabel="다시 연결 시도">
            <Ionicons
              name="refresh-outline"
              size={18}
              color={colors.neutral?.[0] || '#FFFFFF'}
            />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const createStyles = (colors: any, topInset: number) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      backgroundColor: colors.error || '#EF4444',
      paddingTop: topInset,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    icon: {
      marginRight: 8,
    },
    text: {
      color: colors.neutral?.[0] || '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    retryButton: {
      marginLeft: 12,
      padding: 4,
    },
  });

export default OfflineBanner;
