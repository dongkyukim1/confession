/**
 * 마이페이지 화면
 * 
 * 2026 디자인 시스템: 통계는 작고 뉴트럴, 플랫 리스트 스타일
 * - 통계는 작고 뉴트럴 컬러로 표시
 * - 설정 항목은 플랫한 리스트 스타일
 * - 테마 선택 등은 눈에 띄지 않게
 */
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {supabase} from '../lib/supabase';
import {getOrCreateDeviceId} from '../utils/deviceId';
import {useModal, showInfoModal, showDestructiveModal} from '../contexts/ModalContext';
import StatCard from '../components/StatCard';
import {ScreenLayout} from '../components/ui/ScreenLayout';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {typography, spacing, shadows, borderRadius} from '../theme';
import {useTheme} from '../contexts/ThemeContext';
import {lightColors} from '../theme/colors';
import {LOGO} from '../constants/assets';

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
   * 테마 순환 변경
   */
  const cycleTheme = () => {
    const themeOrder: Array<typeof themeMode> = [
      'light',
      'dark',
      'ocean',
      'sunset',
      'forest',
      'purple',
      'auto',
    ];

    const currentIndex = themeOrder.indexOf(themeMode);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    const nextTheme = themeOrder[nextIndex];

    setThemeMode(nextTheme);
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

  // 2026 디자인 시스템: 뉴트럴 컬러 안전하게 접근
  const neutral400 = typeof colors.neutral === 'object' ? colors.neutral[400] : '#9A9A9A';
  const neutral500 = typeof colors.neutral === 'object' ? colors.neutral[500] : '#737373';
  const neutral700 = typeof colors.neutral === 'object' ? colors.neutral[700] : '#404040';

  return (
    <ScreenLayout
      title="설정"
      icon="person-outline"
      showHeader={true}
      showBorder={false}
      contentStyle={styles.scrollContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>

      {/* 통계 - 작고 뉴트럴 컬러 */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, {color: neutral500}]}>
            {myConfessionCount}
          </Text>
          <Text style={[styles.statLabel, {color: neutral400}]}>모음</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, {color: neutral500}]}>
            {viewedCount}
          </Text>
          <Text style={[styles.statLabel, {color: neutral400}]}>읽은 이야기</Text>
        </View>
      </View>

      {/* 설정 메뉴 - 플랫 리스트 스타일 */}
      <View style={styles.section}>
        {/* 테마 선택 - 눈에 띄지 않게 */}
        <TouchableOpacity style={styles.menuItem} onPress={cycleTheme} activeOpacity={0.7}>
          <Ionicons 
            name={
              themeMode === 'dark' ? 'moon-outline' : 
              themeMode === 'light' ? 'sunny-outline' :
              themeMode === 'ocean' ? 'water-outline' :
              themeMode === 'sunset' ? 'partly-sunny-outline' :
              themeMode === 'forest' ? 'leaf-outline' :
              themeMode === 'purple' ? 'sparkles-outline' :
              'phone-portrait-outline'
            } 
            size={20} 
            color={neutral500} 
          />
          <Text style={[styles.menuText, {color: neutral700}]}>테마</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={openPrivacyPolicy} activeOpacity={0.7}>
          <Ionicons name="lock-closed-outline" size={20} color={neutral500} />
          <Text style={[styles.menuText, {color: neutral700}]}>개인정보처리방침</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={showAppInfo} activeOpacity={0.7}>
          <Ionicons name="information-circle-outline" size={20} color={neutral500} />
          <Text style={[styles.menuText, {color: neutral700}]}>앱 정보</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={resetData} activeOpacity={0.7}>
          <Ionicons name="trash-outline" size={20} color={neutral500} />
          <Text style={[styles.menuText, {color: neutral700}]}>데이터 초기화</Text>
        </TouchableOpacity>
      </View>

      {/* 앱 정보 - 최소화 */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, {color: neutral400}]}>v1.0.0</Text>
      </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const getStyles = (colors: typeof lightColors) => StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 0, // ScreenLayout에서 이미 패딩 적용
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
  // 2026 디자인 시스템: 통계 스타일 추가
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.xl,
    marginTop: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.base,  // 작게
    fontWeight: typography.fontWeight.regular,  // Bold 최소화
    marginBottom: spacing.xs,
    letterSpacing: typography.letterSpacing.normal,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.regular,
    letterSpacing: typography.letterSpacing.normal,
  },
  // 2026 디자인 시스템: sectionTitle 제거
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: typeof colors.neutral === 'object' ? colors.neutral[200] : colors.borderLight,  // 뉴트럴 200
    backgroundColor: 'transparent',  // 배경 제거 (플랫 스타일)
  },
  // 2026 디자인 시스템: menuIconContainer 제거 (아이콘 직접 배치)
  menuText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,  // Bold 최소화
    letterSpacing: typography.letterSpacing.normal,
  },
  // 2026 디자인 시스템: menuSubtext 제거
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  // 2026 디자인 시스템: logo 제거
  footerText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.regular,
    letterSpacing: typography.letterSpacing.normal,
  },
  // 2026 디자인 시스템: footerSubtext 제거
});

