/**
 * 업적 달성 애니메이션 모달
 * 
 * 게이미피케이션 업적 해제 시 표시되는 축하 모달
 */
import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';
import {AchievementType} from '../types/database';
import {spacing, borderRadius, typography, shadows} from '../theme';
import {lightColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';
import {triggerHaptic} from '../utils/haptics';

interface AchievementModalProps {
  visible: boolean;
  achievementType: AchievementType;
  onClose: () => void;
  autoCloseDelay?: number; // 밀리초 (기본: 5000ms)
}

const {width} = Dimensions.get('window');

/**
 * 업적별 설정
 */
const ACHIEVEMENT_CONFIG: Record<
  AchievementType,
  {
    animation: any;
    title: string;
    description: string;
    hapticPattern?: 'success' | 'light' | 'medium';
  }
> = {
  first_post: {
    animation: require('../assets/animations/badge.json'),
    title: '첫 일기 달성!',
    description: '일기 쓰기의 첫 발걸음을 내딛었어요',
    hapticPattern: 'success',
  },
  first_like: {
    animation: require('../assets/animations/feedback-star.json'),
    title: '첫 좋아요!',
    description: '누군가 당신의 이야기에 공감했어요',
    hapticPattern: 'success',
  },
  like_received: {
    animation: require('../assets/animations/winning-heart.json'),
    title: '좋아요!',
    description: '공감을 받았어요 ❤️',
    hapticPattern: 'light',
  },
  '7_day_streak': {
    animation: require('../assets/animations/royal-crown.json'),
    title: '7일 연속 기록!',
    description: '매일 일기를 쓰는 습관, 대단해요!',
    hapticPattern: 'success',
  },
};

export default function AchievementModal({
  visible,
  achievementType,
  onClose,
  autoCloseDelay = 5000,
}: AchievementModalProps) {
  const {colors} = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const lottieRef = useRef<LottieView>(null);

  const config = ACHIEVEMENT_CONFIG[achievementType];

  useEffect(() => {
    if (visible) {
      // 진동 피드백
      if (config.hapticPattern) {
        triggerHaptic(config.hapticPattern);
      }

      // 애니메이션 시작
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Lottie 애니메이션 재생
      if (lottieRef.current) {
        lottieRef.current.play();
      }

      // 자동 닫기
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, achievementType]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const styles = getStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}>
      <Animated.View style={[styles.overlay, {opacity: fadeAnim}]}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={handleClose}
        />
        
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{scale: scaleAnim}],
              opacity: fadeAnim,
            },
          ]}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.gradient}>
            {/* 애니메이션 */}
            <View style={styles.animationContainer}>
              <LottieView
                ref={lottieRef}
                source={config.animation}
                autoPlay={false}
                loop={false}
                style={styles.animation}
              />
            </View>

            {/* 타이틀 */}
            <Text style={styles.title}>{config.title}</Text>

            {/* 설명 */}
            <Text style={styles.description}>{config.description}</Text>

            {/* 확인 버튼 */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleClose}
              activeOpacity={0.8}>
              <Text style={styles.buttonText}>확인</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    overlayTouchable: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    container: {
      width: width * 0.85,
      maxWidth: 400,
      borderRadius: borderRadius['2xl'],
      overflow: 'hidden',
      ...shadows.large,
    },
    gradient: {
      padding: spacing['2xl'],
      alignItems: 'center',
    },
    animationContainer: {
      width: 200,
      height: 200,
      marginBottom: spacing.lg,
    },
    animation: {
      width: '100%',
      height: '100%',
    },
    title: {
      fontSize: 28,
      fontWeight: typography.fontWeight.bold,
      color: colors.surface,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    description: {
      fontSize: 16,
      fontWeight: typography.fontWeight.medium,
      color: colors.surface,
      opacity: 0.9,
      marginBottom: spacing.xl,
      textAlign: 'center',
      lineHeight: 24,
    },
    button: {
      backgroundColor: colors.surface,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: borderRadius.lg,
      minWidth: 120,
      ...shadows.small,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: typography.fontWeight.semibold,
      color: colors.primary,
      textAlign: 'center',
    },
  });

