/**
 * ProfileScreen - 프로덕션 레벨 (2026 디자인 시스템)
 * 
 * 주요 개선사항:
 * - 통계 대시보드 with 차트
 * - 업적 그리드
 * - 히트맵 (주간 활동)
 * - 프로필 설정
 */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Animated,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../contexts/ThemeContext';
import {lightColors} from '../theme/colors';
import {getDeviceId} from '../utils/deviceId';
import {useStatistics} from '../hooks/useStatistics';
import {ProfileHeaderSkeleton} from '../components/Skeleton';
import {BackgroundRenderer} from '../components/BackgroundRenderer';
import {useBackground} from '../contexts/BackgroundContext';

const {width} = Dimensions.get('window');

function ProfileScreen() {
  const navigation = useNavigation();
  const {colors} = useTheme();
  const {currentPreset} = useBackground();
  const [deviceId, setDeviceId] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  const {data: stats, isLoading, refetch} = useStatistics(deviceId);

  useEffect(() => {
    getDeviceId().then(setDeviceId);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const neutral50 = typeof colors.neutral === 'object' ? colors.neutral[50] : '#FAFAFA';
  const neutral100 = typeof colors.neutral === 'object' ? colors.neutral[100] : '#F5F5F5';
  const neutral200 = typeof colors.neutral === 'object' ? colors.neutral[200] : '#E5E5E5';
  const neutral300 = typeof colors.neutral === 'object' ? colors.neutral[300] : '#D4D4D4';
  const neutral400 = typeof colors.neutral === 'object' ? colors.neutral[400] : '#9CA3AF';
  const neutral500 = typeof colors.neutral === 'object' ? colors.neutral[500] : '#737373';
  const neutral700 = typeof colors.neutral === 'object' ? colors.neutral[700] : '#404040';

  const styles = getStyles(colors, neutral50, neutral100, neutral200, neutral300, neutral400, neutral500, neutral700);

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundRenderer />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }>
        
        {/* 프로필 헤더 */}
        {isLoading ? (
          <ProfileHeaderSkeleton />
        ) : (
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, {backgroundColor: colors.primaryScale[100]}]}>
                <Ionicons name="person" size={40} color={colors.primary} />
              </View>
            </View>
            <Text style={styles.profileName}>익명 사용자</Text>
            <Text style={styles.profileBio}>
              {stats ? `${stats.totalConfessions}개의 고백 작성` : '아직 고백이 없어요'}
            </Text>
          </View>
        )}

        {/* 주요 통계 */}
        {!isLoading && stats && stats.totalConfessions > 0 ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>나의 통계</Text>
              <View style={styles.statsGrid}>
                <StatBox
                  icon="create-outline"
                  label="작성한 고백"
                  value={stats?.totalConfessions ?? 0}
                  color={colors.primary}
                  styles={styles}
                />
                <StatBox
                  icon="eye-outline"
                  label="읽은 고백"
                  value={stats?.totalViewed ?? 0}
                  color={colors.info}
                  styles={styles}
                />
                <StatBox
                  icon="flame-outline"
                  label="연속 기록"
                  value={`${stats?.currentStreak ?? 0}일`}
                  color={colors.warning}
                  styles={styles}
                />
                <StatBox
                  icon="trophy-outline"
                  label="최장 연속"
                  value={`${stats?.longestStreak ?? 0}일`}
                  color={colors.success}
                  styles={styles}
                />
              </View>
            </View>

            {/* 주간 활동 히트맵 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>주간 활동</Text>
              <View style={styles.heatmapContainer}>
                {(stats?.weeklyActivity ?? []).map((day, index) => (
                  <View key={index} style={styles.heatmapColumn}>
                    <View
                      style={[
                        styles.heatmapCell,
                        {
                          backgroundColor: getHeatmapColor(day?.count ?? 0, colors),
                        },
                      ]}
                    />
                    <Text style={styles.heatmapLabel}>
                      {new Date(day.date).toLocaleDateString('ko-KR', {weekday: 'short'})}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* 기분 분포 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>기분 분포</Text>
              <View style={styles.moodDistribution}>
                {Object.entries(stats?.moodDistribution ?? {}).map(([mood, count]) => (
                  <MoodBar
                    key={mood}
                    mood={mood}
                    count={count as number}
                    total={stats?.totalConfessions ?? 0}
                    colors={colors}
                    styles={styles}
                  />
                ))}
              </View>
            </View>

            {/* 태그 클라우드 */}
            {stats?.tagCloud && stats.tagCloud.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>자주 사용한 태그</Text>
                <View style={styles.tagCloud}>
                  {stats.tagCloud.map((item, index) => (
                    <View
                      key={index}
                      style={[
                        styles.tagItem,
                        {
                          backgroundColor: colors.primaryScale[100],
                          paddingHorizontal: 12 + (item?.count ?? 0) * 2,
                          paddingVertical: 6 + (item?.count ?? 0),
                        },
                      ]}>
                      <Text
                        style={[
                          styles.tagText,
                          {
                            fontSize: 12 + (item?.count ?? 0),
                          },
                        ]}>
                        #{item?.tag}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* 활동 인사이트 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>활동 인사이트</Text>
              <View style={styles.insightCard}>
                <View style={styles.insightRow}>
                  <Ionicons name="calendar-outline" size={20} color={neutral500} />
                  <Text style={styles.insightText}>
                    주로 <Text style={styles.insightBold}>{stats?.favoriteWeekday ?? '데이터 없음'}</Text>에 고백해요
                  </Text>
                </View>
                <View style={styles.insightRow}>
                  <Ionicons name="time-outline" size={20} color={neutral500} />
                  <Text style={styles.insightText}>
                    <Text style={styles.insightBold}>{stats?.favoriteTime ?? '데이터 없음'}</Text> 시간대를 선호해요
                  </Text>
                </View>
              </View>
            </View>

            {/* 설정 섹션 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>설정</Text>
              <View style={styles.settingsCard}>
                <TouchableOpacity
                  style={styles.settingRow}
                  onPress={() => navigation.navigate('BackgroundSettings' as never)}
                  activeOpacity={0.7}>
                  <View style={styles.settingLeft}>
                    <View style={[styles.settingIconContainer, {backgroundColor: colors.primaryScale[100]}]}>
                      <Ionicons name="color-palette-outline" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.settingTextContainer}>
                      <Text style={styles.settingLabel}>배경 커스터마이징</Text>
                      <Text style={styles.settingValue}>{currentPreset.displayName}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={neutral400} />
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : !isLoading ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="bar-chart-outline" size={80} color={neutral300} />
            </View>
            <Text style={styles.emptyTitle}>아직 기록이 없어요</Text>
            <Text style={styles.emptySubtitle}>
              첫 고백을 작성하고{'\n'}나만의 감정 기록을 시작해보세요
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('Write' as never)}
              activeOpacity={0.8}>
              <Ionicons name="create-outline" size={20} color="#FFFFFF" style={{marginRight: 8}} />
              <Text style={styles.emptyButtonText}>첫 고백 작성하기</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * 통계 박스 컴포넌트
 */
const StatBox = React.memo(({
  icon,
  label,
  value,
  color,
  styles,
}: {
  icon: string;
  label: string;
  value: string | number;
  color: string;
  styles: any;
}) => {
  return (
    <View style={styles.statBox}>
      <View style={[styles.statIconContainer, {backgroundColor: color + '15'}]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
});

/**
 * 기분 바 컴포넌트
 */
const MoodBar = React.memo(({
  mood,
  count,
  total,
  colors,
  styles,
}: {
  mood: string;
  count: number;
  total: number;
  colors: typeof lightColors;
  styles: any;
}) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  const widthAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: percentage,
      duration: 800,
      delay: 200,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const moodColor = colors.moodColors[mood as keyof typeof colors.moodColors] || colors.primary;

  return (
    <View style={styles.moodBarContainer}>
      <View style={styles.moodBarHeader}>
        <Text style={styles.moodBarLabel}>{getMoodEmoji(mood)} {getMoodName(mood)}</Text>
        <Text style={styles.moodBarCount}>{count}회</Text>
      </View>
      <View style={styles.moodBarTrack}>
        <Animated.View
          style={[
            styles.moodBarFill,
            {
              width: widthAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: moodColor,
            },
          ]}
        />
      </View>
    </View>
  );
});

/**
 * 히트맵 색상 계산
 */
function getHeatmapColor(count: number, colors: typeof lightColors): string {
  if (count === 0) return colors.neutral[100];
  if (count === 1) return colors.primaryScale[200];
  if (count === 2) return colors.primaryScale[400];
  if (count >= 3) return colors.primaryScale[600];
  return colors.primaryScale[800];
}

/**
 * 기분 이모지
 */
function getMoodEmoji(mood: string): string {
  const moodEmojis: Record<string, string> = {
    happy: '😊',
    sad: '😢',
    angry: '😡',
    tired: '😴',
    love: '😍',
    surprised: '😲',
    calm: '😌',
    excited: '🤩',
  };
  return moodEmojis[mood] || '😊';
}

/**
 * 기분 이름
 */
function getMoodName(mood: string): string {
  const moodNames: Record<string, string> = {
    happy: '행복',
    sad: '슬픔',
    angry: '화남',
    tired: '피곤',
    love: '사랑',
    surprised: '놀람',
    calm: '평온',
    excited: '흥분',
  };
  return moodNames[mood] || mood;
}

/**
 * 스타일
 */
const getStyles = (
  colors: typeof lightColors,
  neutral50: string,
  neutral100: string,
  neutral200: string,
  neutral300: string,
  neutral400: string,
  neutral500: string,
  neutral700: string,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16,
      paddingBottom: 40,
    },
    profileHeader: {
      alignItems: 'center',
      paddingVertical: 40,
      paddingHorizontal: 24,
      marginTop: 8,
    },
    avatarContainer: {
      marginBottom: 16,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileName: {
      fontSize: 24,
      fontWeight: '700',
      color: neutral700,
      marginBottom: 4,
    },
    profileBio: {
      fontSize: 14,
      color: neutral500,
    },
    section: {
      paddingHorizontal: 24,
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: neutral700,
      marginBottom: 16,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    statBox: {
      flex: 1,
      minWidth: (width - 72) / 2,
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    statIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    statValue: {
      fontSize: 24,
      fontWeight: '700',
      color: neutral700,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 13,
      color: neutral500,
      textAlign: 'center',
    },
    heatmapContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    heatmapColumn: {
      alignItems: 'center',
      flex: 1,
    },
    heatmapCell: {
      width: 32,
      height: 32,
      borderRadius: 8,
      marginBottom: 8,
    },
    heatmapLabel: {
      fontSize: 11,
      color: neutral500,
    },
    moodDistribution: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    moodBarContainer: {
      marginBottom: 16,
    },
    moodBarHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    moodBarLabel: {
      fontSize: 14,
      color: neutral700,
    },
    moodBarCount: {
      fontSize: 14,
      color: neutral500,
      fontWeight: '600',
    },
    moodBarTrack: {
      height: 8,
      backgroundColor: neutral100,
      borderRadius: 4,
      overflow: 'hidden',
    },
    moodBarFill: {
      height: '100%',
      borderRadius: 4,
    },
    tagCloud: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    tagItem: {
      borderRadius: 12,
    },
    tagText: {
      color: neutral700,
      fontWeight: '500',
    },
    insightCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    insightRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    insightText: {
      fontSize: 15,
      color: neutral500,
      marginLeft: 12,
    },
    insightBold: {
      fontWeight: '600',
      color: neutral700,
    },
    settingsCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
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
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    settingTextContainer: {
      flex: 1,
    },
    settingLabel: {
      fontSize: 15,
      fontWeight: '500',
      color: neutral700,
      marginBottom: 2,
    },
    settingValue: {
      fontSize: 13,
      color: neutral500,
    },
    bottomSpacing: {
      height: 20,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
      paddingVertical: 60,
      minHeight: 400,
    },
    emptyIconContainer: {
      marginBottom: 24,
      opacity: 0.3,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: neutral700,
      marginBottom: 12,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 16,
      color: neutral400,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 32,
    },
    emptyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.accent,
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 12,
      shadowColor: colors.accent,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    emptyButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });

export default ProfileScreen;
