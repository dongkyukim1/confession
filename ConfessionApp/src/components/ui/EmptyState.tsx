/**
 * Empty State Component - 프리미엄 디자인 시스템
 *
 * 고급스러운 빈 상태 표시 컴포넌트
 * - 세련된 애니메이션
 * - 다양한 배리언트
 * - 프리미엄 스타일링
 */
import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  Animated,
} from 'react-native';
import {useTheme} from '../../contexts/ThemeContext';
import {shadows} from '../../theme/colors';
import {spacing, borderRadius} from '../../theme/spacing';
import {typography} from '../../theme/typography';
import {Button} from './Button';

type EmptyStateVariant = 'default' | 'card' | 'minimal';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  variant?: EmptyStateVariant;
  style?: ViewStyle;
  animated?: boolean;
}

export const EmptyState = ({
  icon = '📭',
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  variant = 'default',
  style,
  animated = true,
}: EmptyStateProps) => {
  const theme = useTheme();
  const colors = theme?.colors;
  const isDark = theme?.isDark || false;

  // 애니메이션 값
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const iconBounceAnim = useRef(new Animated.Value(0)).current;

  // 안전한 색상 추출
  const neutral50 = colors?.neutral?.[50] || '#FAFAFA';
  const neutral500 = colors?.neutral?.[500] || '#737373';
  const neutral900 = colors?.neutral?.[900] || '#171717';

  const themeShadows = isDark ? shadows.dark : shadows.light;

  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 15,
          stiffness: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // 아이콘 바운스 애니메이션
      Animated.loop(
        Animated.sequence([
          Animated.timing(iconBounceAnim, {
            toValue: -8,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(iconBounceAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
    }
  }, [animated, fadeAnim, scaleAnim, iconBounceAnim]);

  // 배리언트별 컨테이너 스타일
  const getVariantContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'card':
        return {
          backgroundColor: neutral0,
          borderRadius: borderRadius['2xl'],
          padding: spacing[8],
          ...themeShadows.md,
        };
      case 'minimal':
        return {
          padding: spacing[4],
        };
      default:
        return {
          padding: spacing[8],
        };
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        getVariantContainerStyle(),
        {
          opacity: fadeAnim,
          transform: [{scale: scaleAnim}],
        },
        style,
      ]}>
      {/* 아이콘 */}
      <Animated.View
        style={[
          styles.iconContainer,
          {
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : neutral50,
            transform: [{translateY: iconBounceAnim}],
          },
        ]}>
        <Text style={styles.icon}>{icon}</Text>
      </Animated.View>

      {/* 제목 */}
      <Text
        style={[
          styles.title,
          {color: neutral900},
          variant === 'minimal' && styles.titleMinimal,
        ]}>
        {title}
      </Text>

      {/* 설명 */}
      {description && (
        <Text
          style={[
            styles.description,
            {color: neutral500},
            variant === 'minimal' && styles.descriptionMinimal,
          ]}>
          {description}
        </Text>
      )}

      {/* 액션 버튼들 */}
      {(actionLabel || secondaryActionLabel) && (
        <View style={styles.actionsContainer}>
          {actionLabel && onAction && (
            <Button
              title={actionLabel}
              onPress={onAction}
              variant="gradient"
              size={variant === 'minimal' ? 'sm' : 'md'}
              style={styles.primaryButton}
            />
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              title={secondaryActionLabel}
              onPress={onSecondaryAction}
              variant="ghost"
              size={variant === 'minimal' ? 'sm' : 'md'}
              style={styles.secondaryButton}
            />
          )}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[6],
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing[2],
    letterSpacing: -0.3,
  },
  titleMinimal: {
    fontSize: typography.fontSize.lg,
  },
  description: {
    fontSize: typography.fontSize.base,
    textAlign: 'center',
    lineHeight: typography.fontSize.base * 1.6,
    marginBottom: spacing[6],
    paddingHorizontal: spacing[4],
    letterSpacing: 0.2,
  },
  descriptionMinimal: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing[4],
  },
  actionsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing[3],
    marginTop: spacing[2],
  },
  primaryButton: {
    minWidth: 160,
  },
  secondaryButton: {
    minWidth: 120,
  },
});

export default EmptyState;
