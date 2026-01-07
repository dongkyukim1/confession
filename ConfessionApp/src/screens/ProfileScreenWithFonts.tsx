/**
 * 마이페이지 화면 (폰트 설정 지원)
 *
 * 사용자 통계, 테마, 폰트 설정을 표시합니다.
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
import CleanHeader from '../components/CleanHeader';
import FontSelector from '../components/FontSelector';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {typography, spacing, shadows, borderRadius} from '../theme';
import {useTheme} from '../contexts/ThemeContext';
import {useFont} from '../contexts/FontContext';
import {lightColors} from '../theme/colors';
import {LOGO} from '../constants/assets';

export default function ProfileScreen() {
  const [myConfessionCount, setMyConfessionCount] = useState(0);
  const [viewedCount, setViewedCount] = useState(0);
  const [fontSelectorVisible, setFontSelectorVisible] = useState(false);
  const {showModal} = useModal();
  const {themeMode, setThemeMode, colors} = useTheme();
  const {fontOption} = useFont();

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
      'Confession Diary',
      '버전: 1.0.0\n\n' +
      '익명 일기 앱입니다.\n' +
      '자신의 하루를 기록하고,\n' +
      '다른 사람의 하루를 엿볼 수 있습니다.\n\n' +
      '모든 일기는 안전하게 보호됩니다.',
    );
  };

  /**
   * 테마 라벨 가져오기
   */
  const getThemeLabel = () => {
    const labels = {
      light: '밝은 테마',
      dark: '어두운 테마',
      ocean: '오션 테마',
      sunset: '석양 테마',
      forest: '숲 테마',
      purple: '퍼플 테마',
      auto: '자동',
    };
    return labels[themeMode] || '밝은 테마';
  };

  const styles = getStyles(colors);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <CleanHeader title="마이페이지" />

      {/* 프로필 카드 */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <Image source={LOGO} style={styles.logoImage} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>익명의 일기 작가</Text>
            <Text style={styles.profileSubtitle}>
              나만의 이야기를 기록하세요
            </Text>
          </View>
        </View>
      </View>

      {/* 통계 카드 */}
      <View style={styles.statsContainer}>
        <StatCard
          icon="create-outline"
          label="작성한 일기"
          value={myConfessionCount}
          color={colors.primary}
        />
        <StatCard
          icon="eye-outline"
          label="읽은 일기"
          value={viewedCount}
          color={colors.secondary}
        />
      </View>

      {/* 설정 섹션 */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>설정</Text>

        {/* 테마 설정 */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={cycleTheme}
          activeOpacity={0.7}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIconContainer, {backgroundColor: colors.primary + '20'}]}>
              <Ionicons name="color-palette-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>테마</Text>
              <Text style={styles.settingValue}>{getThemeLabel()}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>

        {/* 폰트 설정 */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setFontSelectorVisible(true)}
          activeOpacity={0.7}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIconContainer, {backgroundColor: colors.secondary + '20'}]}>
              <Ionicons name="text-outline" size={22} color={colors.secondary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>폰트</Text>
              <Text style={styles.settingValue}>{fontOption.displayName}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>

        {/* 개인정보처리방침 */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={openPrivacyPolicy}
          activeOpacity={0.7}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIconContainer, {backgroundColor: colors.warning + '20'}]}>
              <Ionicons name="shield-checkmark-outline" size={22} color={colors.warning} />
            </View>
            <Text style={styles.settingLabel}>개인정보처리방침</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>

        {/* 앱 정보 */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={showAppInfo}
          activeOpacity={0.7}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIconContainer, {backgroundColor: colors.success + '20'}]}>
              <Ionicons name="information-circle-outline" size={22} color={colors.success} />
            </View>
            <Text style={styles.settingLabel}>앱 정보</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* 푸터 */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💌 나만의 하루를 소중하게 기록하세요
        </Text>
        <Text style={styles.versionText}>v1.0.0</Text>
      </View>

      {/* 폰트 선택 모달 */}
      <FontSelector
        visible={fontSelectorVisible}
        onClose={() => setFontSelectorVisible(false)}
      />
    </ScrollView>
  );
}

const getStyles = (colors: typeof lightColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 100,
  },
  profileCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.medium,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  profileSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  settingsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  settingValue: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  versionText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
});
