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
} from 'react-native';
import {Confession} from '../types';
import {supabase} from '../lib/supabase';
import {getOrCreateDeviceId} from '../utils/deviceId';
import ConfessionCard from '../components/ConfessionCard';
import {useModal, showDestructiveModal, showErrorModal, showInfoModal} from '../contexts/ModalContext';

export default function MyDiaryScreen() {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
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
    } catch (error) {
      console.error('고백 목록 조회 오류:', error);
      showErrorModal(showModal, '오류', '고백 목록을 불러오는데 실패했습니다.');
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
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📝</Text>
      <Text style={styles.emptyTitle}>아직 작성한 일기가 없습니다</Text>
      <Text style={styles.emptyText}>
        홈 탭에서 오늘의 하루를 기록해보세요
      </Text>
    </View>
  );

  /**
   * 고백 카드 렌더링
   */
  const renderItem = ({item}: {item: Confession}) => (
    <TouchableOpacity
      onLongPress={() => deleteConfession(item.id)}
      activeOpacity={0.9}>
      <ConfessionCard
        content={item.content}
        timestamp={item.created_at}
        viewCount={item.view_count}
        showViewCount={true}
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
      <View style={styles.header}>
        <Text style={styles.title}>내 일기장</Text>
        <Text style={styles.subtitle}>
          작성한 일기 {confessions.length}개
        </Text>
      </View>

      {/* 목록 */}
      <FlatList
        data={confessions}
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

      {/* 힌트 텍스트 */}
      {confessions.length > 0 && (
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>
            💡 카드를 길게 눌러서 삭제할 수 있습니다
          </Text>
        </View>
      )}
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
  hintContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  hintText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

