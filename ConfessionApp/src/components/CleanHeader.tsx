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
  const {colors} = useTheme();
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
              <Ionicons name={icon} size={28} color={colors.primary} />
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

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface + '66', // 40% 불투명도 (배경 확실히 보이도록!)
      paddingTop: 60,
      paddingBottom: spacing.lg,
      paddingHorizontal: spacing.lg,
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
      fontSize: 24,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: spacing.xs / 2,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    countBadge: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      minWidth: 48,
      alignItems: 'center',
    },
    countText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.primary,
    },
  });

