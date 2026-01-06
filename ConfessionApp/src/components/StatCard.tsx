/**
 * 통계 카드 컴포넌트
 * 
 * 숫자와 레이블을 보여주는 통계 카드
 */
import React from 'react';
import {View, Text, StyleSheet, ViewStyle} from 'react-native';
import {typography, spacing, shadows, borderRadius} from '../theme';
import {lightColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';

interface StatCardProps {
  icon: string;
  value: number | string;
  label: string;
  color?: string;
  style?: ViewStyle;
}

export default function StatCard({
  icon,
  value,
  label,
  color,
  style,
}: StatCardProps) {
  const {colors} = useTheme();
  const displayColor = color || colors.primary;
  const styles = getStyles(colors);

  return (
    <View style={[styles.card, style]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.value, {color: displayColor}]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const getStyles = (colors: typeof lightColors) => StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  icon: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  value: {
    ...typography.styles.largeTitle,
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.styles.caption,
    color: colors.textSecondary,
  },
});




