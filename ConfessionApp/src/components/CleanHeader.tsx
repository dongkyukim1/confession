/**
 * 깔끔한 헤더 컴포넌트
 * 
 * 미니멀하고 현대적인 디자인의 화면 헤더
 */
import React from 'react';
import {View, Text, StyleSheet, Image, ImageSourcePropType} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {typography, spacing, shadows, borderRadius} from '../theme';
import {lightColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';

interface CleanHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  logo?: ImageSourcePropType;
  count?: number;
  showBorder?: boolean;
}

export default function CleanHeader({
  title,
  subtitle,
  icon,
  logo,
  count,
  showBorder = false,
}: CleanHeaderProps) {
  const theme = useTheme();
  // colors가 객체인지 확인하고 안전하게 처리
  const colors = (theme && typeof theme.colors === 'object' && theme.colors) || lightColors;
  const styles = getStyles(colors);

  return (
    <View style={[styles.container, showBorder && styles.containerBorder]}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          {logo ? (
            <View style={styles.logoContainer}>
              <Image source={logo} style={styles.logo} resizeMode="contain" />
            </View>
          ) : icon ? (
            <View style={styles.iconContainer}>
              <Ionicons name={icon} size={24} color={typeof colors.primary === 'string' ? colors.primary : '#FD5068'} />
            </View>
          ) : null}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>

        {count !== undefined && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: typeof colors.neutral === 'object' ? colors.neutral[0] : '#FFFFFF',
      paddingTop: 50,
      paddingBottom: spacing.md,
      paddingHorizontal: spacing.xl, // ScreenLayout과 통일
    },
    containerBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    iconContainer: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    logoContainer: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    logo: {
      width: 40,
      height: 40,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontSize: typography.fontSize['2xl'], // 2026 디자인 시스템
      fontWeight: typography.fontWeight.medium, // Bold 최소화
      color: typeof colors.neutral === 'object' ? colors.neutral[900] : '#171717',
      marginBottom: spacing.xs / 2,
    },
    subtitle: {
      fontSize: typography.fontSize.sm, // 2026 디자인 시스템
      color: typeof colors.neutral === 'object' ? colors.neutral[500] : '#737373',
      fontWeight: typography.fontWeight.regular, // Bold 최소화
    },
    countBadge: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      minWidth: 48,
      alignItems: 'center',
    },
    countText: {
      fontSize: 16,
      fontWeight: '600', // 틴더 스타일: 더 가벼운 굵기
      color: typeof colors.primary === 'string' ? colors.primary : '#FD5068',
    },
  });

