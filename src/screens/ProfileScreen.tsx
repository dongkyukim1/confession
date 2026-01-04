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

export default function ProfileScreen() {
  const [myConfessionCount, setMyConfessionCount] = useState(0);
  const [viewedCount, setViewedCount] = useState(0);
  const {showModal} = useModal();

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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>마이페이지</Text>
      </View>

      {/* 통계 카드 */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>✍️</Text>
          <Text style={styles.statValue}>{myConfessionCount}</Text>
          <Text style={styles.statLabel}>작성한 일기</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>👀</Text>
          <Text style={styles.statValue}>{viewedCount}</Text>
          <Text style={styles.statLabel}>본 일기</Text>
        </View>
      </View>

      {/* 설정 메뉴 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>설정</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={openPrivacyPolicy}>
          <Text style={styles.menuIcon}>🔒</Text>
          <Text style={styles.menuText}>개인정보처리방침</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={showAppInfo}>
          <Text style={styles.menuIcon}>ℹ️</Text>
          <Text style={styles.menuText}>앱 정보</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={resetData}>
          <Text style={styles.menuIcon}>🗑️</Text>
          <Text style={styles.menuText}>데이터 초기화</Text>
          <Text style={styles.menuArrow}>›</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#6366f1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
  },
  section: {
    marginTop: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  menuArrow: {
    fontSize: 24,
    color: '#ccc',
    fontWeight: '300',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  footerText: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#ccc',
  },
});

