/**
 * 본 일기장 화면
 * 
 * 내가 조회한 고백 목록을 표시합니다.
 */
import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {ViewedConfession} from '../types';
import {supabase} from '../lib/supabase';
import {getOrCreateDeviceId} from '../utils/deviceId';
import ConfessionCard from '../components/ConfessionCard';
import {useModal, showErrorModal} from '../contexts/ModalContext';

export default function ViewedDiaryScreen() {
  const [viewedConfessions, setViewedConfessions] = useState<ViewedConfession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const {showModal} = useModal();

  useEffect(() => {
    const init = async () => {
      const id = await getOrCreateDeviceId();
      setDeviceId(id);
      if (id) {
        await fetchViewedConfessions(id);
      }
      setIsLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * 조회한 고백 목록 가져오기
   */
  const fetchViewedConfessions = useCallback(async (id: string) => {
    try {
      // viewed_confessions 테이블과 confessions 테이블 조인
      const {data, error} = await supabase
        .from('viewed_confessions')
        .select(`
          id,
          device_id,
          confession_id,
          viewed_at,
          confession:confessions(*)
        `)
        .eq('device_id', id)
        .order('viewed_at', {ascending: false});

      if (error) throw error;

      setViewedConfessions(data || []);
    } catch (error) {
      console.error('조회 목록 가져오기 오류:', error);
      showErrorModal(showModal, '오류', '조회 목록을 불러오는데 실패했습니다.');
    }
  }, [showModal]);

  /**
   * Pull to refresh
   */
  const onRefresh = useCallback(async () => {
    if (!deviceId) return;
    setIsRefreshing(true);
    await fetchViewedConfessions(deviceId);
    setIsRefreshing(false);
  }, [deviceId, fetchViewedConfessions]);

  /**
   * 빈 화면 렌더링
   */
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>👀</Text>
      <Text style={styles.emptyTitle}>아직 본 일기가 없습니다</Text>
      <Text style={styles.emptyText}>
        홈 탭에서 일기를 작성하고{'\n'}다른 사람의 하루를 확인해보세요
      </Text>
    </View>
  );

  /**
   * 고백 카드 렌더링
   */
  const renderItem = ({item}: {item: ViewedConfession}) => {
    // confession이 배열로 올 수 있으므로 처리
    const confession = Array.isArray(item.confession) 
      ? item.confession[0] 
      : item.confession;

    if (!confession) return null;

    return (
      <ConfessionCard
        content={confession.content}
        timestamp={item.viewed_at}
        viewCount={confession.view_count}
        showViewCount={false}
      />
    );
  };

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
      <View style={styles.header}>
        <Text style={styles.title}>본 일기장</Text>
        <Text style={styles.subtitle}>
          조회한 일기 {viewedConfessions.length}개
        </Text>
      </View>

      {/* 목록 */}
      <FlatList
        data={viewedConfessions}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#6366f1"
            colors={['#6366f1']}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
  listContent: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
});

