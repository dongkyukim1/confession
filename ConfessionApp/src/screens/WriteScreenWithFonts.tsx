/**
 * 일기 작성 화면 (폰트 지원 버전)
 *
 * 전체 화면으로 일기를 작성하는 전용 화면 - 선택한 폰트 적용
 */
import React, {useState, useEffect, useCallback} from 'react';
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
import FontSelector from '../components/FontSelector';
import {validateConfessionContent} from '../validation/schemas';

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
  const [fontSelectorVisible, setFontSelectorVisible] = useState(false);
  const {showModal} = useModal();
  const {colors} = useTheme();
  const {getFontFamily, fontOption} = useFont();

  useEffect(() => {
    getOrCreateDeviceId().then(setDeviceId);
  }, []);

  const [validationError, setValidationError] = useState<string | null>(null);

  // Zod 스키마 검증
  const validateForm = useCallback(() => {
    const result = validateConfessionContent(confession.trim());
    if (!result.isValid) {
      setValidationError(result.error || '입력을 확인해주세요.');
      return false;
    }
    setValidationError(null);
    return true;
  }, [confession]);

  const handleSubmit = async () => {
    // Zod 스키마 검증 사용
    if (!validateForm()) {
      showWarningModal(showModal, '알림', validationError || '입력 내용을 확인해주세요.');
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
      <View style={styles.header} accessibilityRole="header">
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
          accessibilityRole="button"
          accessibilityLabel="닫기"
          accessibilityHint="작성을 취소하고 이전 화면으로 돌아갑니다">
          <View style={styles.backButtonInner}>
            <Ionicons name="close" size={28} color={colors.textPrimary} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle} accessibilityRole="header">일기 쓰기</Text>
        <TouchableOpacity
          style={styles.headerRight}
          onPress={() => {
            console.log('🎨 폰트 버튼 클릭!');
            setFontSelectorVisible(true);
          }}
          activeOpacity={0.7}
          hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
          accessibilityRole="button"
          accessibilityLabel={`폰트 선택, 현재 ${fontOption.displayName}`}
          accessibilityHint="탭하여 다른 폰트를 선택합니다">
          <Text style={styles.fontLabel}>{fontOption.displayName}</Text>
        </TouchableOpacity>
      </View>

      {/* 컨텐츠 영역 */}
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
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
            <Text style={styles.sectionLabel} accessibilityRole="text">오늘의 이야기</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.textInput, {fontFamily: getFontFamily()}]}
                placeholder="오늘 하루는 어땠나요?&#13;&#10;무슨 일이 있었는지 자유롭게 적어보세요..."
                placeholderTextColor={colors.textTertiary}
                multiline
                maxLength={MAX_CHARS + 50}
                value={confession}
                onChangeText={text => {
                  setConfession(text);
                  setValidationError(null);
                }}
                editable={!isLoading}
                textAlignVertical="top"
                accessibilityLabel="일기 내용 입력"
                accessibilityHint={`최소 10자, 최대 ${MAX_CHARS}자 입력 가능합니다. 현재 ${confession.length}자`}
                accessibilityState={{disabled: isLoading}}
              />
            </View>

            {/* 유효성 검사 오류 메시지 */}
            {validationError && (
              <Text
                style={styles.errorText}
                accessibilityRole="alert"
                accessibilityLiveRegion="polite">
                {validationError}
              </Text>
            )}

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
      </KeyboardAvoidingView>

      {/* 하단 제출 버튼 - SafeAreaView 직접 자식으로 */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!confession.trim() || isLoading || isOverLimit) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!confession.trim() || isLoading || isOverLimit}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={isLoading ? '등록 중' : '고백하기'}
          accessibilityHint="일기를 등록하고 다른 사람의 일기를 확인합니다"
          accessibilityState={{
            disabled: !confession.trim() || isLoading || isOverLimit,
            busy: isLoading,
          }}>
          <LinearGradient
            colors={
              confession.trim() && !isOverLimit
                ? ['#667EEA', '#764BA2']
                : ['#E5E7EB', '#D1D5DB']
            }
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={{
              height: 58,
              borderRadius: 30,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {isLoading ? (
              <>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={{
                  fontSize: 19,
                  fontWeight: '800',
                  color: '#FFFFFF',
                  marginLeft: 8,
                }}>
                  등록 중...
                </Text>
              </>
            ) : (
              <>
                <Text style={{
                  fontSize: 19,
                  fontWeight: '800',
                  color: '#FFFFFF',
                  letterSpacing: 0.5,
                }}>
                  고백하기
                </Text>
                <View style={{width: 8}} />
                <Ionicons
                  name="paper-plane"
                  size={20}
                  color="#FFFFFF"
                />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.disclaimer}>
          🔒 익명으로 안전하게 처리됩니다
        </Text>
      </View>
      
      {/* 폰트 선택 모달 */}
      <FontSelector
        visible={fontSelectorVisible}
        onClose={() => setFontSelectorVisible(false)}
      />
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonInner: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: typeof colors.neutral === 'object' ? colors.neutral[100] : colors.backgroundAlt,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerRight: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: typeof colors.neutral === 'object' ? colors.neutral[100] : colors.backgroundAlt,
    borderRadius: borderRadius.md,
  },
  fontLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: 200, // 버튼 공간 확보
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  inputContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: typeof colors.neutral === 'object' ? colors.neutral[200] : colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  textInput: {
    minHeight: 320,
    maxHeight: 500,
    padding: spacing.xl,
    fontSize: 17,
    color: colors.textPrimary,
    lineHeight: 28,
    textAlignVertical: 'top',
    letterSpacing: -0.3,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: typeof colors.neutral === 'object' ? colors.neutral[100] : colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  charCount: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    minWidth: 70,
    textAlign: 'right',
  },
  charCountError: {
    color: colors.error,
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    marginTop: spacing.sm,
    marginLeft: spacing.md,
    fontWeight: '500',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: typeof colors.neutral === 'object' ? colors.neutral[100] : colors.border,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButton: {
    borderRadius: 30, // 완전히 둥글게!
    overflow: 'hidden',
    height: 58,
    shadowColor: '#667EEA',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
    transform: [{scale: 1}],
  },
  submitButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0.1,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 58,
    paddingHorizontal: 24,
    gap: 8, // 직접 숫자로 지정
    borderRadius: 30,
  },
  submitIcon: {
    marginLeft: 0,
    marginTop: 0,
  },
  submitButtonText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
    lineHeight: 22, // 텍스트 수직 정렬을 위한 lineHeight
  },
  disclaimer: {
    fontSize: 13,
    color: typeof colors.neutral === 'object' ? colors.neutral[500] : colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.lg,
    opacity: 0.6,
    fontWeight: '500',
  },
});
