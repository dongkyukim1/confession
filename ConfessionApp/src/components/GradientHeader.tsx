/**
 * 그라데이션 헤더 컴포넌트
 * 
 * 화면 상단에 배치되는 세련된 그라데이션 헤더
 */
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {typography, spacing} from '../theme';
import {lightColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';

interface GradientHeaderProps {
  title: string;
  subtitle?: string;
  emoji?: string;
}

export default function GradientHeader({
  title,
  subtitle,
  emoji,
}: GradientHeaderProps) {
  const {colors} = useTheme();
  const styles = getStyles(colors);

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.gradient}>
      <View style={styles.content}>
        {emoji && <Text style={styles.emoji}>{emoji}</Text>}
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </LinearGradient>
  );
}

const getStyles = (colors: typeof lightColors) => StyleSheet.create({
  gradient: {
    width: '100%',
    paddingTop: 60,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  content: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.styles.largeTitle,
    color: colors.surface,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.styles.body,
    color: colors.surface,
    opacity: 0.9,
    textAlign: 'center',
  },
});




