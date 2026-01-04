/**
 * 홈 화면 - 고해성사 작성
 *
 * 사용자가 자신의 고백을 작성하는 메인 화면
 * 작성 완료 후 다른 사람의 고백을 볼 수 있음
 */
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {CompositeNavigationProp} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList, BottomTabParamList, Confession} from '../types';
import {supabase} from '../lib/supabase';
import {getOrCreateDeviceId} from '../utils/deviceId';
import {useModal, showWarningModal, showSuccessModal, showErrorModal} from '../contexts/ModalContext';

type ConfessionRow = Pick<Confession, 'id'>;

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type HomeScreenProps = {
  navigation: HomeScreenNavigationProp;
};

const {height} = Dimensions.get('window');

export default function HomeScreen({navigation}: HomeScreenProps) {
  const [confession, setConfession] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const {showModal} = useModal();

  useEffect(() => {
    // 디바이스 ID 초기화
    getOrCreateDeviceId().then(setDeviceId);
  }, []);

  /**
   * 고해성사 제출 처리
   */
  const handleSubmit = async () => {
    if (!confession.trim()) {
      showWarningModal(showModal, '알림', '일기 내용을 입력해주세요.');
      return;
    }

    if (confession.trim().length < 10) {
      showWarningModal(showModal, '알림', '최소 10자 이상 작성해주세요.');
      return;
    }

    if (!deviceId) {
      showErrorModal(showModal, '오류', '잠시 후 다시 시도해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // 고해성사 저장
      const {data, error} = await supabase
        .from('confessions')
        .insert({
          content: confession.trim(),
          device_id: deviceId,
        })
        .select()
        .single<Confession>();

      if (error) {
        throw error;
      }

      // 다른 사람의 랜덤 고해성사 가져오기
      const {data: randomConfession, error: fetchError} = await supabase
        .from('confessions')
        .select('id')
        .neq('device_id', deviceId) // 내 것 제외
        .neq('id', data.id) // 방금 작성한 것 제외
        .order('view_count', {ascending: true}) // 적게 본 것 우선
        .limit(10)
        .returns<ConfessionRow[]>();

      if (fetchError) {
        throw fetchError;
      }

      if (!randomConfession || randomConfession.length === 0) {
        showSuccessModal(
          showModal,
          '첫 번째 작성자',
          '아직 다른 일기가 없습니다.\n당신이 첫 번째입니다! 🎉',
          true,
          [{text: '확인', onPress: () => setConfession('')}],
        );
        return;
      }

      // 랜덤으로 하나 선택
      const randomIndex = Math.floor(Math.random() * randomConfession.length);
      const selectedConfession = randomConfession[randomIndex];

      // 입력 초기화 후 Reveal 화면으로 이동
      setConfession('');
      navigation.navigate('Reveal', {confessionId: selectedConfession.id});
    } catch (error) {
      console.error('일기 저장 오류:', error);
      showErrorModal(showModal, '오류', '저장 중 문제가 발생했습니다.\n잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* 헤더 영역 */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>📝</Text>
        <Text style={styles.title}>오늘의 일기</Text>
        <Text style={styles.subtitle}>
          당신의 하루를 기록하세요{'\n'}
          그러면 다른 사람의 하루를 볼 수 있습니다
        </Text>
      </View>

      {/* 입력 영역 */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="오늘 하루는 어땠나요?"
          placeholderTextColor="#aaa"
          multiline
          maxLength={500}
          value={confession}
          onChangeText={setConfession}
          editable={!isLoading}
        />
        <Text style={styles.charCount}>{confession.length}/500</Text>
      </View>

      {/* 제출 버튼 */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          (!confession.trim() || isLoading) && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={!confession.trim() || isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>일기 쓰고 다른 하루 보기</Text>
        )}
      </TouchableOpacity>

      {/* 안내 문구 */}
      <Text style={styles.disclaimer}>
        모든 일기는 익명으로 처리됩니다
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 24,
    paddingTop: height * 0.08,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    flex: 1,
    marginBottom: 20,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    lineHeight: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  charCount: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    fontSize: 12,
    color: '#999',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#6366f1',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#d0d0d0',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginBottom: 32,
  },
});

