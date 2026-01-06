/**
 * 마이페이지 화면
 * 
 * 사용자 통계 및 설정을 표시합니다.
 */
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {supabase} from '../lib/supabase';
import {getOrCreateDeviceId} from '../utils/deviceId';
import {useModal, showInfoModal, showDestructiveModal} from '../contexts/ModalContext';
import StatCard from '../components/StatCard';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {typography, spacing, shadows, borderRadius} from '../theme';
import {useTheme} from '../contexts/ThemeContext';
import {lightColors} from '../theme/colors';

export default function ProfileScreen() {
  const [myConfessionCount, setMyConfessionCount] = useState(0);
  const [viewedCount, setViewedCount] = useState(0);
  const {showModal} = useModal();
  const {themeMode, setThemeMode, colors} = useTheme();

  useEffect(() => {
    fetchStatistics();
  }, []);

  /**
   * 통계 데이터 가져오기
   */
  const fetchStatistics = async () => {
    try {
      const deviceId = await getOrCreateDeviceId();
      if (!deviceId) return;

      // 내가 작성한 일기 수
      const {count: myCount} = await supabase
        .from('confessions')
        .select('*', {count: 'exact', head: true})
        .eq('device_id', deviceId);

      // 내가 본 일기 수
      const {count: viewedCountData} = await supabase
        .from('viewed_confessions')
        .select('*', {count: 'exact', head: true})
        .eq('device_id', deviceId);

      setMyConfessionCount(myCount || 0);
      setViewedCount(viewedCountData || 0);
    } catch (error) {
      console.error('통계 조회 오류:', error);
    }
  };

  /**
   * 개인정보처리방침
   */
  const openPrivacyPolicy = () => {
    showInfoModal(
      showModal,
      '개인정보처리방침',
      '본 앱은 사용자를 식별할 수 있는 개인정보를 수집하지 않습니다.\n\n' +
      '디바이스 ID는 로컬에 저장되며, 작성한 일기를 관리하는 용도로만 사용됩니다.\n\n' +
      '모든 일기는 익명으로 처리되며, 개인을 특정할 수 없습니다.',
    );
  };

  /**
   * 테마 변경
   */
  const changeTheme = () => {
    const themes: Array<{mode: 'light' | 'dark' | 'auto'; label: string}> = [
      {mode: 'light', label: '라이트 모드'},
      {mode: 'dark', label: '다크 모드'},
      {mode: 'auto', label: '시스템 설정'},
    ];

    const currentIndex = themes.findIndex(t => t.mode === themeMode);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];

    setThemeMode(nextTheme.mode);
    showInfoModal(
      showModal,
      '테마 변경',
      `${nextTheme.label}로 변경되었습니다.`,
    );
  };

  /**
   * 앱 정보
   */
  const showAppInfo = () => {
    showInfoModal(
      showModal,
      '너의 오늘, 나의 오늘',
      '버전: 1.0.0\n\n' +
      '당신의 하루를 기록하고,\n' +
      '다른 사람의 이야기를 들어보세요.\n\n' +
      '모든 일기는 익명으로 처리됩니다.',
    );
  };

  /**
   * 데이터 초기화
   */
  const resetData = () => {
    showDestructiveModal(
      showModal,
      '데이터 초기화',
      '모든 데이터를 초기화하시겠습니까?\n\n' +
      '이 작업은 되돌릴 수 없으며, 작성한 일기가 모두 삭제됩니다.',
      async () => {
        try {
          const deviceId = await getOrCreateDeviceId();
          if (!deviceId) return;

          // 내 일기 삭제
          await supabase
            .from('confessions')
            .delete()
            .eq('device_id', deviceId);

          // 조회 기록 삭제
          await supabase
            .from('viewed_confessions')
            .delete()
            .eq('device_id', deviceId);

          setMyConfessionCount(0);
          setViewedCount(0);

          showInfoModal(showModal, '완료', '데이터가 초기화되었습니다.');
        } catch (error) {
          console.error('초기화 오류:', error);
          showInfoModal(showModal, '오류', '초기화에 실패했습니다.');
        }
      },
      undefined,
      '초기화',
      '취소',
    );
  };

  const styles = getStyles(colors);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 헤더 */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.header}>
        <Text style={styles.headerEmoji}>👤</Text>
        <Text style={styles.title}>마이페이지</Text>
      </LinearGradient>

      {/* 통계 카드 */}
      <View style={styles.statsContainer}>
        <StatCard
          icon="✍️"
          value={myConfessionCount}
          label="작성한 일기"
          color={colors.primary}
          style={styles.statCard}
        />
        <StatCard
          icon="👀"
          value={viewedCount}
          label="본 일기"
          color={colors.secondary}
          style={styles.statCard}
        />
      </View>

      {/* 설정 메뉴 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>설정</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={changeTheme} activeOpacity={0.7}>
          <View style={styles.menuIconContainer}>
            <Ionicons 
              name={themeMode === 'dark' ? 'moon' : themeMode === 'light' ? 'sunny' : 'phone-portrait-outline'} 
              size={24} 
              color={colors.primary} 
            />
          </View>
          <Text style={styles.menuText}>테마</Text>
          <Text style={styles.menuSubtext}>
            {themeMode === 'dark' ? '다크' : themeMode === 'light' ? '라이트' : '시스템'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={openPrivacyPolicy} activeOpacity={0.7}>
          <View style={styles.menuIconContainer}>
            <Ionicons name="lock-closed-outline" size={24} color={colors.primary} />
          </View>
          <Text style={styles.menuText}>개인정보처리방침</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={showAppInfo} activeOpacity={0.7}>
          <View style={styles.menuIconContainer}>
            <Ionicons name="information-circle-outline" size={24} color={colors.info} />
          </View>
          <Text style={styles.menuText}>앱 정보</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={resetData} activeOpacity={0.7}>
          <View style={styles.menuIconContainer}>
            <Ionicons name="trash-outline" size={24} color={colors.error} />
          </View>
          <Text style={styles.menuText}>데이터 초기화</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* 앱 정보 */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>너의 오늘, 나의 오늘 v1.0.0</Text>
        <Text style={styles.footerSubtext}>
          모든 일기는 익명으로 처리됩니다
        </Text>
      </View>
    </ScrollView>
  );
}

const getStyles = (colors: typeof lightColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 56,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.styles.title,
    color: colors.surface,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
  },
  section: {
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.medium,
  },
  sectionTitle: {
    ...typography.styles.captionBold,
    color: colors.textTertiary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuText: {
    flex: 1,
    ...typography.styles.body,
    color: colors.textPrimary,
  },
  menuSubtext: {
    ...typography.styles.caption,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  footerText: {
    ...typography.styles.caption,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  footerSubtext: {
    ...typography.styles.small,
    color: colors.textDisabled,
  },
});

