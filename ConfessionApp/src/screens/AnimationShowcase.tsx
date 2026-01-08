/**
 * 애니메이션 쇼케이스 화면
 * 
 * 프로젝트의 모든 Lottie 애니메이션을 테스트하고 확인할 수 있는 화면
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import LottieView from 'lottie-react-native';
import {typography, spacing} from '../theme';
import {useTheme} from '../contexts/ThemeContext';
import {ANIMATIONS} from '../constants/assets';

/**
 * 애니메이션 쇼케이스 화면
 */
export const AnimationShowcase = () => {
  const {colors} = useTheme();
  const [showFullScreen, setShowFullScreen] = useState(false);
  const styles = getStyles(colors);

  if (showFullScreen) {
    return (
      <View style={styles.fullScreenContainer}>
        <LottieView
          source={ANIMATIONS.loading}
          autoPlay
          loop
          style={styles.fullScreenAnimation}
        />
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setShowFullScreen(false)}>
          <Text style={styles.closeButtonText}>닫기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎬 애니메이션 쇼케이스</Text>
        <Text style={styles.subtitle}>
          프로젝트의 모든 Lottie 애니메이션을 확인하세요
        </Text>
      </View>

      <View style={styles.content}>
        {/* Diary 애니메이션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📔 Diary 애니메이션</Text>
          <View style={styles.animationCard}>
            <LottieView
              source={ANIMATIONS.diary}
              autoPlay
              loop
              style={styles.largeAnimation}
            />
            <Text style={styles.animationLabel}>diary.json</Text>
            <Text style={styles.animationDescription}>일기 작성 완료 시 사용</Text>
          </View>
        </View>

        {/* Empty Document 애니메이션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📄 Empty Document</Text>
          <View style={styles.animationCard}>
            <LottieView
              source={ANIMATIONS.emptyDocument}
              autoPlay
              loop
              style={styles.largeAnimation}
            />
            <Text style={styles.animationLabel}>empty-document.json</Text>
            <Text style={styles.animationDescription}>빈 상태 화면에 사용</Text>
          </View>
        </View>

        {/* Loading 애니메이션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏳ Loading</Text>
          <View style={styles.animationCard}>
            <LottieView
              source={ANIMATIONS.loading}
              autoPlay
              loop
              style={styles.mediumAnimation}
            />
            <Text style={styles.animationLabel}>loading.json</Text>
            <Text style={styles.animationDescription}>로딩 인디케이터</Text>
          </View>
        </View>

        {/* 다양한 크기 비교 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📏 크기 비교 (Loading)</Text>
          <View style={styles.sizeRow}>
            <View style={styles.sizeItem}>
              <LottieView
                source={ANIMATIONS.loading}
                autoPlay
                loop
                style={styles.smallAnimation}
              />
              <Text style={styles.sizeLabel}>100px</Text>
            </View>
            <View style={styles.sizeItem}>
              <LottieView
                source={ANIMATIONS.loading}
                autoPlay
                loop
                style={styles.mediumAnimation}
              />
              <Text style={styles.sizeLabel}>150px</Text>
            </View>
            <View style={styles.sizeItem}>
              <LottieView
                source={ANIMATIONS.loading}
                autoPlay
                loop
                style={styles.largeAnimation}
              />
              <Text style={styles.sizeLabel}>200px</Text>
            </View>
          </View>
        </View>

        {/* 전체 화면 테스트 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🖥️ 전체 화면 테스트</Text>
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => setShowFullScreen(true)}>
            <Text style={styles.testButtonText}>전체 화면 로딩 보기</Text>
          </TouchableOpacity>
        </View>

        {/* 사용 예시 */}
        <View style={styles.codeCard}>
          <Text style={styles.codeTitle}>💻 사용 예시:</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.code}>import LottieView from 'lottie-react-native';</Text>
            <Text style={styles.code}>import {'{'} ANIMATIONS {'}'} from './constants/assets';</Text>
            <Text style={styles.code}>{''}</Text>
            <Text style={styles.code}>{'<LottieView'}</Text>
            <Text style={styles.code}>  source={'{'}ANIMATIONS.loading{'}'}</Text>
            <Text style={styles.code}>  autoPlay</Text>
            <Text style={styles.code}>  loop</Text>
            <Text style={styles.code}>  style={'{{'}width: 200, height: 200{'}}'}</Text>
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
  animationCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  largeAnimation: {
    width: 200,
    height: 200,
  },
  mediumAnimation: {
    width: 150,
    height: 150,
  },
  smallAnimation: {
    width: 100,
    height: 100,
  },
  animationLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  animationDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  sizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sizeItem: {
    alignItems: 'center',
  },
  sizeLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  testButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    alignItems: 'center',
  },
  testButtonText: {
    ...typography.button,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenAnimation: {
    width: 250,
    height: 250,
  },
  closeButton: {
    position: 'absolute',
    bottom: spacing.xl * 2,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl * 2,
    borderRadius: 12,
  },
  closeButtonText: {
    ...typography.button,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  codeCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: 12,
    padding: spacing.lg,
    marginTop: spacing.lg,
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



