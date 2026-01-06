/**
 * 빈 상태 컴포넌트
 * 
 * 데이터가 없을 때 표시하는 아름다운 빈 상태 화면
 */
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {typography, spacing} from '../theme';
import {lightColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';

interface EmptyStateProps {
  emoji: string;
  title: string;
  description: string;
}

export default function EmptyState({
  emoji,
  title,
  description,
}: EmptyStateProps) {
  const {colors} = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const getStyles = (colors: typeof lightColors) => StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: spacing.xl,
  },
  emoji: {
    fontSize: 80,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.styles.headline,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    ...typography.styles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});




