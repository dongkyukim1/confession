/**
 * 아이콘 쇼케이스 화면
 * 
 * 프로젝트의 모든 아이콘을 테스트하고 확인할 수 있는 화면
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import {typography, spacing} from '../theme';
import {useTheme} from '../contexts/ThemeContext';
import {ICONS} from '../constants/assets';

/**
 * 아이콘 쇼케이스 화면
 */
export const IconShowcase = () => {
  const {colors} = useTheme();
  const styles = getStyles(colors);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>😊 아이콘 쇼케이스</Text>
        <Text style={styles.subtitle}>
          프로젝트의 모든 감정 아이콘을 확인하세요
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mood 아이콘</Text>
          <View style={styles.iconGrid}>
            {Object.entries(ICONS.mood).map(([key, source]) => (
              <View key={key} style={styles.iconCard}>
                <Image
                  source={source}
                  style={styles.icon}
                  resizeMode="contain"
                />
                <Text style={styles.iconLabel}>{key}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📦 사용 가능한 아이콘</Text>
          <Text style={styles.infoText}>• ICONS.mood.happy (smile.png)</Text>
          <Text style={styles.infoText}>• ICONS.mood.sad (sad-face.png)</Text>
          <Text style={styles.infoText}>• ICONS.mood.angry (angry-face.png)</Text>
          <Text style={styles.infoText}>• ICONS.mood.anxious (anxious-face.png)</Text>
          <Text style={styles.infoText}>• ICONS.mood.crying (crying-face.png)</Text>
          <Text style={styles.infoText}>• ICONS.mood.tearsOfJoy</Text>
          <Text style={styles.infoText}>• ICONS.mood.eyeGlasses</Text>
          <Text style={styles.infoText}>• ICONS.mood.winking</Text>
          <Text style={styles.infoText}>• ICONS.mood.expressionless</Text>
        </View>

        <View style={styles.codeCard}>
          <Text style={styles.codeTitle}>사용 예시:</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.code}>import {'{'} ICONS {'}'} from './constants/assets';</Text>
            <Text style={styles.code}>{''}</Text>
            <Text style={styles.code}>{'<Image'}</Text>
            <Text style={styles.code}>  source={'{'}ICONS.mood.happy{'}'}</Text>
            <Text style={styles.code}>  style={'{{'}width: 48, height: 48{'}}'}</Text>
            <Text style={styles.code}>/{'>'}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  iconCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    width: '30%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    width: 48,
    height: 48,
    marginBottom: spacing.sm,
  },
  iconLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  infoText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontFamily: 'monospace',
  },
  codeCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  codeTitle: {
    ...typography.body,
    color: '#A78BFA',
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  codeBlock: {
    marginTop: spacing.xs,
  },
  code: {
    ...typography.caption,
    color: '#E0E7FF',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
});
