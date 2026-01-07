/**
 * 일기 작성 화면 (폰트 지원 버전)
 *
 * 전체 화면으로 일기를 작성하는 전용 화면 - 선택한 폰트 적용
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
  SafeAreaView,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList, Confession} from '../types';
import {supabase} from '../lib/supabase';
import {getOrCreateDeviceId} from '../utils/deviceId';
import {useModal, showWarningModal, showSuccessModal, showErrorModal} from '../contexts/ModalContext';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {spacing, borderRadius} from '../theme';
import {lightColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';
import {useFont} from '../contexts/FontContext';
import MoodSelector from '../components/MoodSelector';
import TagInput from '../components/TagInput';
import ImagePickerComponent from '../components/ImagePicker';

type ConfessionRow = Pick<Confession, 'id'>;

type WriteScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Write'>;

type WriteScreenProps = {
  navigation: WriteScreenNavigationProp;
};

const {height, width} = Dimensions.get('window');
const MAX_CHARS = 500;

export default function WriteScreen({navigation}: WriteScreenProps) {
  const [confession, setConfession] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | undefined>();
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const {showModal} = useModal();
  const {colors} = useTheme();
  const {getFontFamily, fontOption} = useFont();

  useEffect(() => {
    getOrCreateDeviceId().then(setDeviceId);
  }, []);

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

      if (error) throw error;

      // 다른 사람의 랜덤 고해성사 가져오기
      const {data: randomConfession, error: fetchError} = await supabase
        .from('confessions')
        .select('id')
        .neq('device_id', deviceId)
        .neq('id', data.id)
        .order('view_count', {ascending: true})
        .limit(10)
        .returns<ConfessionRow[]>();

      if (fetchError) throw fetchError;

      if (!randomConfession || randomConfession.length === 0) {
        showSuccessModal(
          showModal,
          '첫 번째 작성자',
          '아직 다른 일기가 없습니다.\n당신이 첫 번째입니다! 🎉',
          true,
          [{text: '확인', onPress: () => navigation.goBack()}],
        );
        return;
      }

      // 랜덤으로 하나 선택 후 Reveal 화면으로 이동
      const randomIndex = Math.floor(Math.random() * randomConfession.length);
      const selectedConfession = randomConfession[randomIndex];
      navigation.replace('Reveal', {confessionId: selectedConfession.id});
    } catch (error) {
      console.error('일기 저장 오류:', error);
      showErrorModal(showModal, '오류', '저장 중 문제가 발생했습니다.\n잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const charProgress = (confession.length / MAX_CHARS) * 100;
  const isOverLimit = confession.length > MAX_CHARS;

  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}>
          <View style={styles.backButtonInner}>
            <Ionicons name="close" size={28} color={colors.textPrimary} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>일기 쓰기</Text>
        <View style={styles.headerRight}>
          <Text style={styles.fontLabel}>{fontOption.displayName}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* 기분 선택 */}
          <View style={styles.section}>
            <MoodSelector
              selectedMood={selectedMood}
              onMoodSelect={setSelectedMood}
            />
          </View>

          {/* 일기 입력 */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>오늘의 이야기</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.textInput, {fontFamily: getFontFamily()}]}
                placeholder="오늘 하루는 어땠나요?&#13;&#10;무슨 일이 있었는지 자유롭게 적어보세요..."
                placeholderTextColor={colors.textTertiary}
                multiline
                maxLength={MAX_CHARS + 50}
                value={confession}
                onChangeText={setConfession}
                editable={!isLoading}
                textAlignVertical="top"
              />
            </View>

            {/* 글자 수 프로그레스 바 */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(charProgress, 100)}%`,
                      backgroundColor: isOverLimit
                        ? colors.error
                        : charProgress > 80
                        ? colors.warning
                        : colors.primary,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.charCount,
                  isOverLimit && styles.charCountError,
                ]}>
                {confession.length}/{MAX_CHARS}
              </Text>
            </View>
          </View>

          {/* 사진 첨부 */}
          <View style={styles.section}>
            <ImagePickerComponent
              images={images}
              onImagesChange={setImages}
              maxImages={3}
            />
          </View>

          {/* 태그 입력 */}
          <View style={styles.section}>
            <TagInput tags={tags} onTagsChange={setTags} />
          </View>
        </ScrollView>

        {/* 하단 제출 버튼 */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!confession.trim() || isLoading || isOverLimit) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!confession.trim() || isLoading || isOverLimit}
            activeOpacity={0.8}>
            {isLoading ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <LinearGradient
                colors={
                  confession.trim() && !isOverLimit
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
          </TouchableOpacity>
          <Text style={styles.disclaimer}>
            🔒 모든 일기는 익명으로 안전하게 처리됩니다
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors: typeof lightColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonInner: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: colors.backgroundAlt,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerRight: {
    minWidth: 48,
    alignItems: 'flex-end',
  },
  fontLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  textInput: {
    minHeight: 200,
    maxHeight: 300,
    padding: spacing.lg,
    fontSize: 17,
    color: colors.textPrimary,
    lineHeight: 28,
    textAlignVertical: 'top',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  charCount: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
    minWidth: 60,
    textAlign: 'right',
  },
  charCountError: {
    color: colors.error,
  },
  bottomContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
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
  submitIcon: {
    marginRight: spacing.sm,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
  },
  disclaimer: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
