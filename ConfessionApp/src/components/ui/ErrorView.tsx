/**
 * ErrorView - 에러 상태 표시 컴포넌트
 * 네트워크 오류, 로딩 실패 등 다양한 에러 상황 표시
 */
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ViewStyle} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../../contexts/ThemeContext';
import {buttonA11y} from '../../utils/a11y';

// =====================================================
// 타입 정의
// =====================================================

type ErrorType = 'network' | 'server' | 'notFound' | 'permission' | 'unknown';

interface ErrorViewProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  style?: ViewStyle;
  compact?: boolean;
}

// =====================================================
// 에러 타입별 기본 설정
// =====================================================

const ERROR_CONFIG: Record<
  ErrorType,
  {icon: string; title: string; message: string}
> = {
  network: {
    icon: 'cloud-offline-outline',
    title: '연결 오류',
    message: '인터넷 연결을 확인해주세요.',
  },
  server: {
    icon: 'server-outline',
    title: '서버 오류',
    message: '잠시 후 다시 시도해주세요.',
  },
  notFound: {
    icon: 'search-outline',
    title: '찾을 수 없음',
    message: '요청하신 내용을 찾을 수 없습니다.',
  },
  permission: {
    icon: 'lock-closed-outline',
    title: '권한 없음',
    message: '이 기능에 접근할 권한이 없습니다.',
  },
  unknown: {
    icon: 'alert-circle-outline',
    title: '오류 발생',
    message: '알 수 없는 오류가 발생했습니다.',
  },
};

// =====================================================
// 컴포넌트
// =====================================================

export function ErrorView({
  type = 'unknown',
  title,
  message,
  onRetry,
  retryLabel = '다시 시도',
  style,
  compact = false,
}: ErrorViewProps) {
  const {colors} = useTheme();
  const config = ERROR_CONFIG[type];

  const displayTitle = title || config.title;
  const displayMessage = message || config.message;

  const styles = createStyles(colors, compact);

  return (
    <View
      style={[styles.container, style]}
      accessibilityRole="alert"
      accessibilityLabel={`${displayTitle}. ${displayMessage}`}>
      {/* 아이콘 */}
      <View style={styles.iconContainer}>
        <Ionicons
          name={config.icon}
          size={compact ? 40 : 64}
          color={colors.textSecondary}
        />
      </View>

      {/* 텍스트 */}
      <Text style={styles.title}>{displayTitle}</Text>
      <Text style={styles.message}>{displayMessage}</Text>

      {/* 재시도 버튼 */}
      {onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          {...buttonA11y(retryLabel, {hint: '탭하면 다시 시도합니다'})}>
          <Ionicons
            name="refresh-outline"
            size={18}
            color={colors.primary}
            style={styles.retryIcon}
          />
          <Text style={styles.retryText}>{retryLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// =====================================================
// 특화된 에러 뷰
// =====================================================

interface SpecificErrorViewProps {
  onRetry?: () => void;
  message?: string;
  style?: ViewStyle;
}

export function NetworkErrorView({onRetry, message, style}: SpecificErrorViewProps) {
  return (
    <ErrorView
      type="network"
      message={message}
      onRetry={onRetry}
      style={style}
    />
  );
}

export function ServerErrorView({onRetry, message, style}: SpecificErrorViewProps) {
  return (
    <ErrorView
      type="server"
      message={message}
      onRetry={onRetry}
      style={style}
    />
  );
}

export function NotFoundView({message, style}: SpecificErrorViewProps) {
  return <ErrorView type="notFound" message={message} style={style} />;
}

export function EmptyView({
  title = '아직 내용이 없어요',
  message = '첫 번째로 내용을 추가해보세요!',
  icon = 'document-outline',
  style,
}: {
  title?: string;
  message?: string;
  icon?: string;
  style?: ViewStyle;
}) {
  const {colors} = useTheme();
  const styles = createStyles(colors, false);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={64} color={colors.textTertiary} />
      </View>
      <Text style={[styles.title, {color: colors.textSecondary}]}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

// =====================================================
// 스타일
// =====================================================

const createStyles = (colors: any, compact: boolean) =>
  StyleSheet.create({
    container: {
      flex: compact ? 0 : 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: compact ? 20 : 40,
    },
    iconContainer: {
      marginBottom: compact ? 12 : 20,
      padding: compact ? 12 : 20,
      backgroundColor: colors.neutral?.[100] || '#F3F4F6',
      borderRadius: compact ? 20 : 32,
    },
    title: {
      fontSize: compact ? 16 : 20,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 8,
      textAlign: 'center',
    },
    message: {
      fontSize: compact ? 13 : 15,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: compact ? 18 : 22,
      paddingHorizontal: 20,
    },
    retryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: compact ? 16 : 24,
      paddingVertical: 12,
      paddingHorizontal: 24,
      backgroundColor: colors.primaryScale?.[50] || '#EEF2FF',
      borderRadius: 12,
    },
    retryIcon: {
      marginRight: 8,
    },
    retryText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.primary,
    },
  });

export default ErrorView;
