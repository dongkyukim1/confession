/**
 * 통계 카드 컴포넌트
 * 
 * 숫자와 레이블을 보여주는 통계 카드
 */
import React from 'react';
import {View, Text, StyleSheet, ViewStyle} from 'react-native';
import {colors, typography, spacing, shadows, borderRadius} from '../theme';

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
  color = colors.primary,
  style,
}: StatCardProps) {
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.value, {color}]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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


