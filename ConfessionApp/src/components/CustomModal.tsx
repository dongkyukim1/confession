/**
 * 커스텀 모달 컴포넌트
 * 
 * 서비스급 모던 미니멀 디자인의 모달
 * - 블러 배경
 * - 부드러운 애니메이션
 * - 스와이프로 닫기
 * - 햅틱 피드백
 */
import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import SuccessAnimation from './SuccessAnimation';
import {lightHaptic, successHaptic, errorHaptic} from '../utils/haptics';
import {typography, spacing, shadows, borderRadius} from '../theme';
import {lightColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';

const {height, width} = Dimensions.get('window');

export type ModalType = 'info' | 'success' | 'warning' | 'error';

export interface ModalButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface CustomModalProps {
  visible: boolean;
  type: ModalType;
  title: string;
  message: string;
  buttons?: ModalButton[];
  dismissable?: boolean;
  onDismiss?: () => void;
  showSuccessAnimation?: boolean;
}

export default function CustomModal({
  visible,
  type,
  title,
  message,
  buttons = [{text: '확인', style: 'default'}],
  dismissable = true,
  onDismiss,
  showSuccessAnimation = false,
}: CustomModalProps) {
  const [showAnimation, setShowAnimation] = useState(false);
  const {colors} = useTheme();
  
  // 애니메이션 값
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const panY = useRef(new Animated.Value(0)).current;

  // PanResponder for swipe to dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => dismissable,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return dismissable && Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          // 스와이프 다운 임계값 초과 시 닫기
          handleDismiss();
        } else {
          // 원위치로 복귀
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start();
        }
      },
    }),
  ).current;

  useEffect(() => {
    if (visible) {
      // 모달 열기 애니메이션
      setShowAnimation(showSuccessAnimation && type === 'success');
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // 타입별 햅틱 피드백
      if (type === 'success') {
        successHaptic();
      } else if (type === 'error') {
        errorHaptic();
      }
    } else {
      // 초기화
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      scaleAnim.setValue(0.9);
      panY.setValue(0);
    }
  }, [visible, type, showSuccessAnimation, fadeAnim, slideAnim, scaleAnim, panY]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onDismiss) {
        onDismiss();
      }
    });
  };

  const handleButtonPress = (button: ModalButton) => {
    lightHaptic();
    if (button.onPress) {
      button.onPress();
    }
    handleDismiss();
  };

  const getIconForType = () => {
    switch (type) {
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const styles = getStyles(colors);

  const opacity = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const backgroundOpacity = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  // 스와이프에 따른 투명도
  const swipeOpacity = panY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0.5],
    extrapolate: 'clamp',
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={dismissable ? handleDismiss : undefined}>
      <View style={styles.modalOverlay}>
        {/* 배경 오버레이 */}
        <TouchableWithoutFeedback onPress={dismissable ? handleDismiss : undefined}>
          <Animated.View
            style={[
              styles.backdrop,
              {opacity: backgroundOpacity},
            ]}
          />
        </TouchableWithoutFeedback>

        {/* 모달 컨텐츠 */}
        <Animated.View
          style={[
            styles.modalContent,
            {
              opacity: Animated.multiply(opacity, swipeOpacity),
              transform: [
                {translateY: Animated.add(slideAnim, panY)},
                {scale: scaleAnim},
              ],
            },
          ]}
          {...panResponder.panHandlers}>
          {/* 스와이프 인디케이터 */}
          {dismissable && (
            <View style={styles.swipeIndicator}>
              <View style={styles.swipeBar} />
            </View>
          )}

          <View style={styles.contentWrapper}>
            {/* 성공 애니메이션 또는 아이콘 */}
            {showAnimation && type === 'success' ? (
              <SuccessAnimation onComplete={() => setShowAnimation(false)} />
            ) : (
              <Text style={styles.icon}>{getIconForType()}</Text>
            )}

            {/* 제목 */}
            <Text style={styles.title}>{title}</Text>

            {/* 메시지 */}
            <ScrollView
              style={styles.messageScrollView}
              showsVerticalScrollIndicator={false}>
              <Text style={styles.message}>{message}</Text>
            </ScrollView>

            {/* 버튼 */}
            <View style={styles.buttonContainer}>
              {buttons.map((button, index) => {
                const isCancel = button.style === 'cancel';
                const isDestructive = button.style === 'destructive';

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      isCancel && styles.buttonCancel,
                      isDestructive && styles.buttonDestructive,
                    ]}
                    onPress={() => handleButtonPress(button)}
                    activeOpacity={0.7}>
                    <Text
                      style={[
                        styles.buttonText,
                        isCancel && styles.buttonTextCancel,
                        isDestructive && styles.buttonTextDestructive,
                      ]}>
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const getStyles = (colors: typeof lightColors) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
  },
  modalContent: {
    width: width * 0.85,
    maxHeight: height * 0.7,
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    ...shadows.large,
    overflow: 'hidden',
  },
  swipeIndicator: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  swipeBar: {
    width: 40,
    height: 4,
    backgroundColor: colors.borderDark,
    borderRadius: borderRadius.sm,
  },
  contentWrapper: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  icon: {
    fontSize: 56,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.styles.headline,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  messageScrollView: {
    maxHeight: height * 0.3,
    marginBottom: spacing.xl,
  },
  message: {
    ...typography.styles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    gap: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.primary,
  },
  buttonText: {
    ...typography.styles.bodyBold,
    color: colors.surface,
  },
  buttonCancel: {
    backgroundColor: colors.backgroundAlt,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  buttonTextCancel: {
    ...typography.styles.bodyBold,
    color: colors.textSecondary,
  },
  buttonDestructive: {
    backgroundColor: colors.error,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    shadowColor: colors.error,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonTextDestructive: {
    ...typography.styles.bodyBold,
    color: colors.surface,
  },
});

