/**
 * Toast Notification Component
 *
 * Non-intrusive notifications
 */
import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  ViewStyle,
} from 'react-native';
import {useTheme} from '../../contexts/ThemeContext';
import {spacing, borderRadius, typography, shadows} from '../../theme';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onHide?: () => void;
  visible: boolean;
}

const {width} = Dimensions.get('window');

export const Toast = ({
  message,
  type = 'info',
  duration = 3000,
  onHide,
  visible,
}: ToastProps) => {
  const {colors} = useTheme();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide?.();
    });
  };

  const getTypeStyles = (): {
    backgroundColor: string;
    icon: string;
  } => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: colors.success[500],
          icon: '✓',
        };
      case 'error':
        return {
          backgroundColor: colors.error[500],
          icon: '✕',
        };
      case 'warning':
        return {
          backgroundColor: colors.warning[500],
          icon: '⚠',
        };
      case 'info':
      default:
        return {
          backgroundColor: colors.info[500],
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
        {
          backgroundColor: typeStyles.backgroundColor,
          transform: [{translateY}],
          opacity,
        },
      ]}>
      <Text style={styles.icon}>{typeStyles.icon}</Text>
      <Text style={styles.message} numberOfLines={2}>
        {message}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.lg,
    zIndex: 9999,
  },
  icon: {
    fontSize: typography.fontSize.xl,
    color: '#ffffff',
    marginRight: spacing.md,
  },
  message: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: '#ffffff',
    fontWeight: typography.fontWeight.medium,
  },
});

// Toast Manager Context
import {createContext, useContext, useState, ReactNode} from 'react';

interface ToastConfig {
  message: string;
  type?: ToastType;
  duration?: number;
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
        />
      )}
    </ToastContext.Provider>
  );
};
