/**
 * 내 일기장 화면
 * 
 * 2026 디자인 시스템: 플랫 카드, 무한 스크롤 최소화
 * - 플랫 카드 스타일
 * - 한 번에 제한된 수만 표시
 * - 날짜/시간은 작고 뉴트럴 컬러
 */
import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {Confession} from '../types';
import {supabase} from '../lib/supabase';
import {getOrCreateDeviceId} from '../utils/deviceId';
import ConfessionCard from '../components/ConfessionCard';
import {ScreenLayout} from '../components/ui/ScreenLayout';
import {AnimatedLoading} from '../components/AnimatedLoading';
import {AnimatedEmptyState} from '../components/AnimatedEmptyState';
import {useModal, showDestructiveModal, showErrorModal, showInfoModal} from '../contexts/ModalContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {typography, spacing, shadows, borderRadius} from '../theme';
import {lightColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';
import {useAchievementChecker} from '../hooks/useAchievementChecker';
import AchievementModal from '../components/AchievementModal';
import {BackgroundRenderer} from '../components/BackgroundRenderer';

export default function MyDiaryScreen() {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [filteredConfessions, setFilteredConfessions] = useState<Confession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const {showModal} = useModal();
  const {colors} = useTheme();
  
  // 업적 시스템
  const {
    checkForNewAchievements,
    currentAchievement,
    hideAchievement,
    isModalVisible,
  } = useAchievementChecker();

  useEffect(() => {
    const init = async () => {
      const id = await getOrCreateDeviceId();
      setDeviceId(id);
      if (id) {
        await fetchMyConfessions(id);
        // 미확인 업적 체크
        await checkForNewAchievements(id);
      }
      setIsLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * 내 고백 목록 가져오기
   */
  const fetchMyConfessions = async (id: string) => {
    try {
      const {data, error} = await supabase
        .from('confessions')
        .select('*')
        .eq('device_id', id)
        .order('created_at', {ascending: false});

      if (error) throw error;

      setConfessions(data || []);
      setFilteredConfessions(data || []);
      
      // 모든 태그 추출
      const tags = new Set<string>();
      data?.forEach(confession => {
        confession.tags?.forEach(tag => tags.add(tag));
      });
      setAllTags(Array.from(tags));
    } catch (error) {
      console.error('고백 목록 조회 오류:', error);
      showErrorModal(showModal, '오류', '고백 목록을 불러오는데 실패했습니다.');
    }
  };

  /**
   * 태그 필터링
   */
  const filterByTag = (tag: string | null) => {
    setSelectedTag(tag);
    if (!tag) {
      setFilteredConfessions(confessions);
    } else {
      const filtered = confessions.filter(
        confession => confession.tags?.includes(tag),
      );
      setFilteredConfessions(filtered);
    }
  };

  /**
   * Pull to refresh
   */
  const onRefresh = useCallback(async () => {
    if (!deviceId) return;
    setIsRefreshing(true);
    await fetchMyConfessions(deviceId);
    setIsRefreshing(false);
  }, [deviceId]);

  /**
   * 고백 삭제
   */
  const deleteConfession = (id: string) => {
    showDestructiveModal(
      showModal,
      '일기 삭제',
      '정말로 이 일기를 삭제하시겠습니까?',
      async () => {
        try {
          const {error} = await supabase
            .from('confessions')
            .delete()
            .eq('id', id);

          if (error) throw error;

          setConfessions(prev => prev.filter(c => c.id !== id));
          showInfoModal(showModal, '완료', '일기가 삭제되었습니다.');
        } catch (error) {
          console.error('삭제 오류:', error);
          showErrorModal(showModal, '오류', '삭제에 실패했습니다.');
        }
      },
    );
  };

  /**
   * 빈 화면 렌더링
   */
  const renderEmpty = () => (
    <AnimatedEmptyState
      title="아직 작성한 일기가 없습니다"
      description="홈 탭에서 오늘의 하루를 기록해보세요"
      size={180}
    />
  );

  /**
   * 고백 카드 렌더링
   */
  const renderItem = ({item, index}: {item: Confession; index: number}) => (
    <TouchableOpacity
      onLongPress={() => deleteConfession(item.id)}
      activeOpacity={0.9}>
      <ConfessionCard
        content={item.content}
        timestamp={item.created_at}
        viewCount={item.view_count}
        showViewCount={true}
        mood={item.mood}
        images={item.images}
        tags={item.tags}
        index={index}
      />
    </TouchableOpacity>
  );

  const styles = getStyles(colors);

  // 2026 디자인 시스템: 뉴트럴 컬러 안전하게 접근
  const neutral500 = typeof colors.neutral === 'object' ? colors.neutral[500] : '#737373';

  return (
    <ScreenLayout
      title="모음"
      icon="book-outline"
      backgroundComponent={<BackgroundRenderer />}
      showHeader={true}
      showBorder={false}
      isLoading={isLoading}
      loadingMessage="일기를 불러오는 중..."
      contentStyle={styles.listContainer}>
      {/* 목록 - 무한 스크롤 최소화 */}
      <FlatList
        data={filteredConfessions}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={neutral500}
            colors={[neutral500]}
          />
        }
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}  // 2026 디자인 시스템: 초기 렌더링 수 제한
        maxToRenderPerBatch={5}  // 2026 디자인 시스템: 배치당 렌더링 수 제한
        windowSize={5}  // 2026 디자인 시스템: 윈도우 크기 제한
      />

      {/* 업적 모달 */}
      {currentAchievement && (
        <AchievementModal
          visible={isModalVisible}
          achievementType={currentAchievement.achievement_type}
          onClose={hideAchievement}
        />
      )}
    </ScreenLayout>
  );
}

const getStyles = (colors: typeof lightColors) => StyleSheet.create({
  listContainer: {
    paddingHorizontal: 0, // ScreenLayout에서 이미 패딩 적용
  },
  tagFilter: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  tagFilterContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  tagFilterButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagFilterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagFilterText: {
    ...typography.styles.caption,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.semibold,
  },
  tagFilterTextActive: {
    color: colors.surface,
  },
  listContent: {
    paddingTop: spacing.lg,
    paddingBottom: 120,
  },
  hintContainer: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintIcon: {
    marginRight: spacing.sm,
  },
  hintText: {
    ...typography.styles.caption,
    color: colors.textSecondary,
  },
});

