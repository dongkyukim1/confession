/**
 * Statistics Card Component
 *
 * Display user writing statistics and insights
 */
import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {Card} from '../ui/Card';
import {UserStatistics} from '../../types/features';
import {useTheme} from '../../theme';
import {spacing, typography, borderRadius} from '../../theme/tokens';

interface StatisticsCardProps {
  statistics: UserStatistics;
}

export const StatisticsCard = ({statistics}: StatisticsCardProps) => {
  const {colors} = useTheme();

  const stats = [
    {
      icon: '📝',
      label: '총 일기',
      value: statistics.totalEntries.toString(),
      suffix: '편',
    },
    {
      icon: '🔥',
      label: '현재 연속',
      value: statistics.currentStreak.toString(),
      suffix: '일',
    },
    {
      icon: '🏆',
      label: '최장 연속',
      value: statistics.longestStreak.toString(),
      suffix: '일',
    },
    {
      icon: '✍️',
      label: '평균 단어',
      value: Math.round(statistics.averageWordsPerEntry).toString(),
      suffix: '단어',
    },
  ];

  return (
    <Card variant="elevated" padding="lg">
      <Text style={[styles.title, {color: colors.neutral[900]}]}>
        나의 일기 통계
      </Text>

      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View
            key={index}
            style={[
              styles.statItem,
              {
                backgroundColor: colors.neutral[50],
                borderColor: colors.neutral[200],
              },
            ]}>
            <Text style={styles.statIcon}>{stat.icon}</Text>
            <Text style={[styles.statValue, {color: colors.primary[600]}]}>
              {stat.value}
              <Text style={[styles.statSuffix, {color: colors.neutral[600]}]}>
                {stat.suffix}
              </Text>
            </Text>
            <Text style={[styles.statLabel, {color: colors.neutral[600]}]}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      {statistics.mostUsedTags.length > 0 && (
        <View style={styles.tagsSection}>
          <Text style={[styles.sectionTitle, {color: colors.neutral[800]}]}>
            자주 쓰는 태그
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsList}>
            {statistics.mostUsedTags.slice(0, 5).map((item, index) => (
              <View
                key={index}
                style={[
                  styles.tagBadge,
                  {
                    backgroundColor: colors.primary[50],
                    borderColor: colors.primary[200],
                  },
                ]}>
                <Text style={[styles.tagText, {color: colors.primary[700]}]}>
                  {item.tag}
                </Text>
                <Text style={[styles.tagCount, {color: colors.primary[600]}]}>
                  {item.count}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  statIcon: {
    fontSize: typography.sizes.xxxl,
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs / 2,
  },
  statSuffix: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
  },
  tagsSection: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
  },
  tagsList: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: spacing.xs,
  },
  tagText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  tagCount: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
});
