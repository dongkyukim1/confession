/**
 * 홈 화면 - 대시보드
 *
 * 앱의 메인 화면으로 통계, 최근 일기, 빠른 액션 제공
 */
import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {CompositeNavigationProp} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList, BottomTabParamList} from '../types';
import {supabase} from '../lib/supabase';
import {getOrCreateDeviceId} from '../utils/deviceId';
import {useTheme} from '../contexts/ThemeContext';
import {spacing, borderRadius, shadows} from '../theme';
import {lightColors} from '../theme/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FloatingActionButton from '../components/FloatingActionButton';
import CleanHeader from '../components/CleanHeader';
import {LOGO} from '../constants/assets';
import {AnimatedEmptyState} from '../components/AnimatedEmptyState';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type HomeScreenProps = {
  navigation: HomeScreenNavigationProp;
};

export default function HomeScreen({navigation}: HomeScreenProps) {
  const {colors} = useTheme();
  const [stats, setStats] = useState({
    totalConfessions: 0,
    todayConfessions: 0,
    viewedConfessions: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeData = async () => {
    const id = await getOrCreateDeviceId();
    setDeviceId(id);
    if (id) {
      await fetchStats(id);
    }
  };

  const fetchStats = async (id: string) => {
    try {
      // 전체 일기 수
      const {count: total} = await supabase
        .from('confessions')
        .select('*', {count: 'exact', head: true})
        .eq('device_id', id);

      // 오늘 작성한 일기 수
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const {count: todayCount} = await supabase
        .from('confessions')
        .select('*', {count: 'exact', head: true})
        .eq('device_id', id)
        .gte('created_at', today.toISOString());

      // 본 일기 수
      const {count: viewedCount} = await supabase
        .from('viewed_confessions')
        .select('*', {count: 'exact', head: true})
        .eq('device_id', id);

      setStats({
        totalConfessions: total || 0,
        todayConfessions: todayCount || 0,
        viewedConfessions: viewedCount || 0,
      });
    } catch (error) {
      console.error('통계 조회 오류:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    if (deviceId) {
      await fetchStats(deviceId);
    }
    setIsRefreshing(false);
  }, [deviceId]);

  const navigateToWrite = () => {
    navigation.navigate('Write');
  };

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <CleanHeader
        title="나의 오늘, 너의 오늘"
        subtitle="당신의 하루를 기록하고 공유하세요"
        logo={LOGO.main}
      />
      
      {/* 개발자 도구 버튼 (오른쪽 상단) */}
      <View style={styles.devTools}>
        <TouchableOpacity
          style={styles.devButton}
          onPress={() => navigation.navigate('IconShowcase' as any)}
          activeOpacity={0.7}>
          <Ionicons name="happy-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.devButton}
          onPress={() => navigation.navigate('AnimationShowcase' as any)}
          activeOpacity={0.7}>
          <Ionicons name="color-wand-outline" size={20} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }>

        <View style={styles.content}>
          {/* 통계 카드 */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {stats.totalConfessions}
              </Text>
              <Text style={styles.statLabel}>전체 일기</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {stats.todayConfessions}
              </Text>
              <Text style={styles.statLabel}>오늘 작성</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {stats.viewedConfessions}
              </Text>
              <Text style={styles.statLabel}>본 일기</Text>
            </View>
          </View>

          {/* 빠른 액션 */}
          <View style={styles.section}>
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={navigateToWrite}
                activeOpacity={0.7}>
                <Ionicons
                  name="create-outline"
                  size={32}
                  color={colors.textPrimary}
                />
                <Text style={styles.actionText}>일기 쓰기</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('MyDiary')}
                activeOpacity={0.7}>
                <Ionicons
                  name="book-outline"
                  size={32}
                  color={colors.textPrimary}
                />
                <Text style={styles.actionText}>내 일기장</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('ViewedDiary')}
                activeOpacity={0.7}>
                <Ionicons
                  name="eye-outline"
                  size={32}
                  color={colors.textPrimary}
                />
                <Text style={styles.actionText}>본 일기</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 오늘의 일기 안내 */}
          {stats.todayConfessions === 0 && (
            <AnimatedEmptyState
              title="오늘의 일기를 작성해보세요"
              size={200}
            />
          )}

          {stats.todayConfessions > 0 && (
            <View style={styles.todayMessageContainer}>
              <Ionicons name="checkmark-circle" size={40} color={colors.success} />
              <Text style={styles.todayMessageTitle}>
                오늘의 일기를 작성했어요
              </Text>
              <Text style={styles.todayMessageDescription}>
                내 일기장에서 확인하거나 다른 사람의 하루를 들여다보세요
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 플로팅 액션 버튼 */}
      <FloatingActionButton onPress={navigateToWrite} icon="create-outline" />
    </View>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent', // 투명하게
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: 100,
    },
    statsContainer: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    statValue: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: spacing.md,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    actionsContainer: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    actionCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: spacing.xl,
    },
    actionText: {
      fontSize: 13,
      color: colors.textPrimary,
      fontWeight: '600',
      marginTop: spacing.sm,
    },
    todayMessageContainer: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      marginTop: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    todayMessageTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
      marginTop: spacing.md,
      marginBottom: spacing.xs,
      textAlign: 'center',
    },
    todayMessageDescription: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
    },
    devTools: {
      position: 'absolute',
      top: 60,
      right: spacing.lg,
      flexDirection: 'row',
      gap: spacing.xs,
      zIndex: 10,
    },
    devButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface + 'F0', // 94% 불투명도
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.medium,
      borderWidth: 1,
      borderColor: colors.border,
    },
  });

