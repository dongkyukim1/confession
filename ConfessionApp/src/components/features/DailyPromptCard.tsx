/**
 * Daily Prompt Card Component
 *
 * Displays daily writing prompts for inspiration
 */
import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {Card} from '../ui/Card';
import {DAILY_PROMPTS, DailyPrompt} from '../../types/features';
import {useTheme} from '../../theme';
import {spacing, typography, borderRadius} from '../../theme/tokens';
import {triggerHaptic} from '../../utils/haptics';

interface DailyPromptCardProps {
  onUsePrompt: (prompt: string) => void;
}

export const DailyPromptCard = ({onUsePrompt}: DailyPromptCardProps) => {
  const {colors} = useTheme();
  const [currentPrompt, setCurrentPrompt] = useState<DailyPrompt | null>(null);

  useEffect(() => {
    // Get daily prompt (changes daily)
    const today = new Date().toDateString();
    const dayOfYear = Math.floor(
      (new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        86400000,
    );
    const promptIndex = dayOfYear % DAILY_PROMPTS.length;
    setCurrentPrompt(DAILY_PROMPTS[promptIndex]);
  }, []);

  const handleRefresh = () => {
    triggerHaptic('impactLight');
    const randomIndex = Math.floor(Math.random() * DAILY_PROMPTS.length);
    setCurrentPrompt(DAILY_PROMPTS[randomIndex]);
  };

  const handleUse = () => {
    if (currentPrompt) {
      triggerHaptic('impactMedium');
      onUsePrompt(currentPrompt.text);
    }
  };

  if (!currentPrompt) return null;

  return (
    <Card variant="filled" padding="md" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>💡</Text>
          <Text style={[styles.title, {color: colors.neutral[900]}]}>
            오늘의 질문
          </Text>
        </View>
        <Pressable
          onPress={handleRefresh}
          style={[
            styles.refreshButton,
            {backgroundColor: colors.neutral[200]},
          ]}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </Pressable>
      </View>

      <Text style={[styles.promptText, {color: colors.neutral[800]}]}>
        {currentPrompt.text}
      </Text>

      <Pressable
        onPress={handleUse}
        style={[
          styles.useButton,
          {
            backgroundColor: colors.primary[500],
          },
        ]}>
        <Text style={styles.useButtonText}>이 질문으로 작성하기</Text>
      </Pressable>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    fontSize: typography.sizes.xl,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshIcon: {
    fontSize: typography.sizes.md,
  },
  promptText: {
    fontSize: typography.sizes.md,
    lineHeight: typography.sizes.md * typography.lineHeights.relaxed,
    marginBottom: spacing.md,
  },
  useButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  useButtonText: {
    color: '#ffffff',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
});
