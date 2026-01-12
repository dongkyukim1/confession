/**
 * Toast Notification Component - 프리미엄 디자인 시스템
 *
 * 고급스러운 알림 컴포넌트
 * - 글래스모피즘 효과
 * - 프리미엄 애니메이션
 * - 다크모드 최적화
 */
import React, {useEffect, useRef, createContext, useContext, useState, ReactNode} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
} from 'react-native';
import {useTheme} from '../../contexts/ThemeContext';
import {shadows} from '../../theme/colors';
import {spacing, borderRadius} from '../../theme/spacing';
import {typography} from '../../theme/typography';
import {triggerHaptic} from '../../utils/haptics';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onHide?: () => void;
  visible: boolean;
  action?: {
    label: string;
    onPress: () => void;
  };
}


export const Toast = ({
  message,
  type = 'info',
  duration = 3000,
  onHide,
  visible,
  action,
}: ToastProps) => {
  const theme = useTheme();
  const colors = theme?.colors;
  const isDark = theme?.isDark || false;

  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  const themeShadows = isDark ? shadows.dark : shadows.light;

  // 안전한 색상 추출
  const successColor = typeof colors?.success === 'object' ? colors.success[500] : '#22C55E';
  const errorColor = typeof colors?.error === 'object' ? colors.error[500] : '#EF4444';
  const warningColor = typeof colors?.warning === 'object' ? colors.warning[500] : '#F59E0B';
  const infoColor = typeof colors?.info === 'object' ? colors.info[500] : '#3B82F6';

  useEffect(() => {
    if (visible) {
      triggerHaptic('notificationSuccess');

      // Show animation
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 15,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          damping: 12,
          stiffness: 250,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide?.();
    });
  };

  const getTypeStyles = (): {
    backgroundColor: string;
    accentColor: string;
    icon: string;
  } => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: isDark ? 'rgba(34, 197, 94, 0.95)' : successColor,
          accentColor: '#86EFAC',
          icon: '✓',
        };
      case 'error':
        return {
          backgroundColor: isDark ? 'rgba(239, 68, 68, 0.95)' : errorColor,
          accentColor: '#FCA5A5',
          icon: '✕',
        };
      case 'warning':
        return {
          backgroundColor: isDark ? 'rgba(245, 158, 11, 0.95)' : warningColor,
          accentColor: '#FDE047',
          icon: '⚠',
        };
      case 'info':
      default:
        return {
          backgroundColor: isDark ? 'rgba(59, 130, 246, 0.95)' : infoColor,
          accentColor: '#93C5FD',
          icon: 'ℹ',
        };
    }
  };

  const typeStyles = getTypeStyles();

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        themeShadows.xl,
        {
          backgroundColor: typeStyles.backgroundColor,
          transform: [{translateY}, {scale}],
          opacity,
        },
      ]}>
      {/* 아이콘 영역 */}
      <View style={[styles.iconContainer, {backgroundColor: 'rgba(255,255,255,0.2)'}]}>
        <Text style={styles.icon}>{typeStyles.icon}</Text>
      </View>

      {/* 메시지 영역 */}
      <View style={styles.content}>
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </View>

      {/* 액션 버튼 */}
      {action && (
        <Pressable
          onPress={() => {
            action.onPress();
            hideToast();
          }}
          style={({pressed}) => [
            styles.actionButton,
            pressed && {opacity: 0.7},
          ]}>
          <Text style={styles.actionText}>{action.label}</Text>
        </Pressable>
      )}

      {/* 닫기 버튼 */}
      <Pressable
        onPress={hideToast}
        style={({pressed}) => [
          styles.closeButton,
          pressed && {opacity: 0.7},
        ]}
        hitSlop={8}>
        <Text style={styles.closeIcon}>×</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: spacing[4],
    right: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.xl,
    zIndex: 9999,
    overflow: 'hidden',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  icon: {
    fontSize: 16,
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  message: {
    fontSize: typography.fontSize.sm,
    color: '#ffffff',
    fontWeight: '500',
    letterSpacing: 0.2,
    lineHeight: 20,
  },
  actionButton: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: borderRadius.md,
    marginLeft: spacing[2],
  },
  actionText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: '#ffffff',
  },
  closeButton: {
    marginLeft: spacing[2],
    padding: spacing[1],
  },
  closeIcon: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
});

// Toast Manager Context
interface ToastConfig {
  message: string;
  type?: ToastType;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastContextType {
  showToast: (config: ToastConfig) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({children}: ToastProviderProps) => {
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const [visible, setVisible] = useState(false);

  const showToast = (config: ToastConfig) => {
    setToast(config);
    setVisible(true);
  };

  const hideToast = () => {
    setVisible(false);
    setTimeout(() => setToast(null), 300);
  };

  return (
    <ToastContext.Provider value={{showToast, hideToast}}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          visible={visible}
          onHide={hideToast}
          action={toast.action}
        />
      )}
    </ToastContext.Provider>
  );
};

export default Toast;
