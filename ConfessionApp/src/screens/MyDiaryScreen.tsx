/**
 * 내 일기장 화면
 * 
 * 내가 작성한 고백 목록을 표시합니다.
 */
import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {Confession} from '../types';
import {supabase} from '../lib/supabase';
import {getOrCreateDeviceId} from '../utils/deviceId';
import ConfessionCard from '../components/ConfessionCard';
import EmptyState from '../components/EmptyState';
import {useModal, showDestructiveModal, showErrorModal, showInfoModal} from '../contexts/ModalContext';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, typography, spacing, shadows, borderRadius} from '../theme';

export default function MyDiaryScreen() {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [filteredConfessions, setFilteredConfessions] = useState<Confession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const {showModal} = useModal();

  useEffect(() => {
    const init = async () => {
      const id = await getOrCreateDeviceId();
      setDeviceId(id);
      if (id) {
        await fetchMyConfessions(id);
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
    <EmptyState
      emoji="📝"
      title="아직 작성한 일기가 없습니다"
      description="홈 탭에서 오늘의 하루를 기록해보세요"
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>내 일기장</Text>
            <Text style={styles.subtitle}>작성한 일기 {confessions.length}개</Text>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statBadge}>
              <Ionicons name="book" size={20} color={colors.primary} />
              <Text style={styles.statNumber}>{confessions.length}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* 태그 필터 */}
      {allTags.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tagFilter}
          contentContainerStyle={styles.tagFilterContent}>
          <TouchableOpacity
            style={[
              styles.tagFilterButton,
              !selectedTag && styles.tagFilterButtonActive,
            ]}
            onPress={() => filterByTag(null)}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.tagFilterText,
                !selectedTag && styles.tagFilterTextActive,
              ]}>
              전체
            </Text>
          </TouchableOpacity>
          {allTags.map(tag => (
            <TouchableOpacity
              key={tag}
              style={[
                styles.tagFilterButton,
                selectedTag === tag && styles.tagFilterButtonActive,
              ]}
              onPress={() => filterByTag(tag)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.tagFilterText,
                  selectedTag === tag && styles.tagFilterTextActive,
                ]}>
                #{tag}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* 목록 */}
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
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* 힌트 텍스트 */}
      {confessions.length > 0 && (
        <View style={styles.hintContainer}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={colors.textSecondary}
            style={styles.hintIcon}
          />
          <Text style={styles.hintText}>
            카드를 길게 눌러서 삭제할 수 있습니다
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    ...typography.styles.title,
    color: colors.surface,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.styles.body,
    color: colors.surface,
    opacity: 0.9,
  },
  statsContainer: {
    alignItems: 'center',
  },
  statBadge: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    ...shadows.small,
  },
  statNumber: {
    ...typography.styles.headline,
    color: colors.primary,
    marginTop: spacing.xs,
    fontWeight: typography.fontWeight.bold,
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

