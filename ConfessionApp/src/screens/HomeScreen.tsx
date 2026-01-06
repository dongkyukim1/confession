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
  ScrollView,
} from 'react-native';
import {CompositeNavigationProp} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList, BottomTabParamList, Confession} from '../types';
import {supabase} from '../lib/supabase';
import {getOrCreateDeviceId} from '../utils/deviceId';
import {useModal, showWarningModal, showSuccessModal, showErrorModal} from '../contexts/ModalContext';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {typography, spacing, shadows, borderRadius} from '../theme';
import {lightColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';
import MoodSelector from '../components/MoodSelector';
import TagInput from '../components/TagInput';
import ImagePickerComponent from '../components/ImagePicker';
import TextFormatToolbar, {TextStyle} from '../components/TextFormatToolbar';

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
  const [selectedMood, setSelectedMood] = useState<string | undefined>();
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [textStyle, setTextStyle] = useState<TextStyle>({});
  const {showModal} = useModal();
  const {colors} = useTheme();

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
      // 일기 저장 (리치 컨텐츠 포함)
      const {data, error} = await supabase
        .from('confessions')
        .insert({
          content: confession.trim(),
          device_id: deviceId,
          mood: selectedMood || null,
          tags: tags.length > 0 ? tags : null,
          images: images.length > 0 ? images : null,
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
      setSelectedMood(undefined);
      setTags([]);
      setImages([]);
      setTextStyle({});
      navigation.navigate('Reveal', {confessionId: selectedConfession.id});
    } catch (error) {
      console.error('일기 저장 오류:', error);
      showErrorModal(showModal, '오류', '저장 중 문제가 발생했습니다.\n잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = getStyles(colors);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* 그라데이션 헤더 */}
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.gradientHeader}>
          <Text style={styles.headerEmoji}>✍️</Text>
          <Text style={styles.headerTitle}>오늘의 일기</Text>
          <Text style={styles.headerSubtitle}>
            당신의 하루를 기록하세요{'\n'}
            다른 사람의 이야기를 들어보세요
          </Text>
        </LinearGradient>

        {/* 입력 영역 */}
        <View style={styles.content}>
          {/* 기분 선택 */}
          <MoodSelector
            selectedMood={selectedMood}
            onMoodSelect={setSelectedMood}
          />

          {/* 텍스트 서식 툴바 + 글자 수 */}
          <TextFormatToolbar
            currentStyle={textStyle}
            onStyleChange={setTextStyle}
            charCount={confession.length}
            maxChars={500}
          />

          {/* 사진 첨부 */}
          <ImagePickerComponent
            images={images}
            onImagesChange={setImages}
            maxImages={3}
          />

          {/* 태그 입력 */}
          <TagInput tags={tags} onTagsChange={setTags} />

          {/* 일기 입력 */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.textInput,
                textStyle.bold && {fontWeight: 'bold'},
                textStyle.italic && {fontStyle: 'italic'},
                textStyle.color && {color: textStyle.color},
              ]}
              placeholder="오늘 하루는 어땠나요?&#13;&#10;무슨 일이 있었는지 자유롭게 적어보세요..."
              placeholderTextColor={colors.textTertiary}
              multiline
              maxLength={500}
              value={confession}
              onChangeText={setConfession}
              editable={!isLoading}
              textAlignVertical="top"
            />
          </View>

          {/* 제출 버튼 */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!confession.trim() || isLoading) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!confession.trim() || isLoading}
            activeOpacity={0.8}>
            {!isLoading && (
              <LinearGradient
                colors={
                  confession.trim()
                    ? [colors.gradientStart, colors.gradientEnd]
                    : [colors.borderDark, colors.borderDark]
                }
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.submitGradient}>
                <Ionicons
                  name="paper-plane"
                  size={20}
                  color={colors.surface}
                  style={styles.submitIcon}
                />
                <Text style={styles.submitButtonText}>
                  일기 쓰고 다른 하루 보기
                </Text>
              </LinearGradient>
            )}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={colors.surface} />
              </View>
            )}
          </TouchableOpacity>

          {/* 안내 문구 */}
          <Text style={styles.disclaimer}>
            🔒 모든 일기는 익명으로 안전하게 처리됩니다
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors: typeof lightColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  gradientHeader: {
    paddingTop: height * 0.06,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.surface,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.surface,
    opacity: 0.95,
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  textInput: {
    minHeight: 120,
    maxHeight: 200,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    lineHeight: 24,
    textAlignVertical: 'top',
  },
  submitButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  submitButtonDisabled: {
    opacity: 1,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingContainer: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitIcon: {
    marginRight: spacing.sm,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
  },
  disclaimer: {
    fontSize: 13,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});

