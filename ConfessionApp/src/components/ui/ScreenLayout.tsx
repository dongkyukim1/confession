/**
 * 공통 화면 레이아웃 컴포넌트
 * 
 * 2026 디자인 시스템: 모든 화면에 통일된 레이아웃 적용
 * - 일관된 여백, 패딩, 헤더 스타일
 * - 서비스 수준의 로딩, 에러 처리
 */
import React from 'react';
import {View, StyleSheet, ViewStyle, SafeAreaView} from 'react-native';
import {useTheme} from '../../contexts/ThemeContext';
import {spacing} from '../../theme';
import {lightColors} from '../../theme/colors';
import CleanHeader from '../CleanHeader';
import {AnimatedLoading} from '../AnimatedLoading';

interface ScreenLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: string;
  showHeader?: boolean;
  showBorder?: boolean;
  isLoading?: boolean;
  loadingMessage?: string;
  contentStyle?: ViewStyle;
  safeAreaEdges?: ('top' | 'bottom' | 'left' | 'right')[];
  backgroundComponent?: React.ReactNode;
}

export const ScreenLayout = ({
  children,
  title,
  subtitle = '',
  icon,
  showHeader = true,
  showBorder = false,
  isLoading = false,
  loadingMessage = '로딩 중...',
  contentStyle,
  safeAreaEdges = ['top'],
  backgroundComponent,
}: ScreenLayoutProps) => {
  const theme = useTheme();
  const colors = (theme && typeof theme.colors === 'object' && theme.colors) || lightColors;
  
  const styles = getStyles(colors);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={safeAreaEdges}>
        {backgroundComponent}
        {showHeader && title && (
          <CleanHeader
            title={title}
            subtitle={subtitle}
            icon={icon}
            showBorder={showBorder}
          />
        )}
        <AnimatedLoading
          fullScreen
          message={loadingMessage}
          size={150}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={safeAreaEdges}>
      {backgroundComponent}
      {showHeader && title && (
        <CleanHeader
          title={title}
          subtitle={subtitle}
          icon={icon}
          showBorder={showBorder}
        />
      )}
      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const getStyles = (_colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.xl, // 통일된 패딩
    },
  });
