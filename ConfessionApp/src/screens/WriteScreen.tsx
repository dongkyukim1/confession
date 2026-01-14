/**
 * 일기 작성 화면
 *
 * 2026 디자인 시스템: 풀스크린 중심, 큰 여백, TextInput 중심
 * - 상단 헤더 제거 또는 최소화
 * - TextInput은 화면 중앙에 큰 여백과 함께
 * - MoodSelector, TagInput은 하단에 작게 배치
 * - 제출 버튼은 하단 고정, 뉴트럴 스타일
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
  ScrollView,
  SafeAreaView,
  BackHandler,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList, Confession} from '../types';
import {supabase} from '../lib/supabase';
import {getOrCreateDeviceId} from '../utils/deviceId';
import {useModal, showWarningModal, showSuccessModal, showErrorModal} from '../contexts/ModalContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {spacing, typography, borderRadius} from '../theme';
import {lightColors} from '../theme/colors';
import {useThemeColors} from '../hooks/useThemeColors';
import MoodSelector from '../components/MoodSelector';
import TagInput from '../components/TagInput';
import ImagePickerComponent from '../components/ImagePicker';
import {useAchievementChecker} from '../hooks/useAchievementChecker';
import AchievementModal from '../components/AchievementModal';
import {checkStreakAchievement} from '../utils/achievementManager';
import {Button} from '../components/ui/Button';
import FontSelector from '../components/FontSelector';
import {useFont} from '../contexts/FontContext';
import {useDraft} from '../hooks/useDraft';
import {DraftRecoveryModal} from '../components/features/DraftRecoveryModal';

type ConfessionRow = Pick<Confession, 'id'>;

type WriteScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Write'>;

type WriteScreenProps = {
  navigation: WriteScreenNavigationProp;
};

const MAX_CHARS = 500;

export default function WriteScreen({navigation}: WriteScreenProps) {
  const [confession, setConfession] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | undefined>();
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [fontSelectorVisible, setFontSelectorVisible] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const {showModal} = useModal();
  const {colors, neutral, error: errorColors} = useThemeColors();

  // 폰트 시스템
  const {getFontFamily, fontOption} = useFont();

  // 임시저장 시스템
  const {draft, hasDraft, clearDraft, startAutoSave, stopAutoSave} = useDraft();

  // 업적 시스템
  const {
    unlockAchievement,
    currentAchievement,
    hideAchievement,
    isModalVisible,
  } = useAchievementChecker();

  useEffect(() => {
    getOrCreateDeviceId().then(setDeviceId);
  }, []);

  // 임시저장 확인 및 자동저장 시작
  useEffect(() => {
    if (hasDraft && confession.length === 0) {
      setShowDraftModal(true);
    }

    // 자동저장 시작
    startAutoSave(() => ({
      content: confession,
      mood: selectedMood,
      tags: tags.length > 0 ? tags : undefined,
      images: images.length > 0 ? images : undefined,
    }));

    return () => {
      stopAutoSave();
    };
  }, [hasDraft]); // eslint-disable-line react-hooks/exhaustive-deps

  // 임시저장 복구
  const handleRecoverDraft = () => {
    if (draft) {
      setConfession(draft.content);
      if (draft.mood) setSelectedMood(draft.mood);
      if (draft.tags) setTags(draft.tags);
      if (draft.images) setImages(draft.images);
    }
    setShowDraftModal(false);
  };

  // 임시저장 삭제
  const handleDiscardDraft = async () => {
    await clearDraft();
    setShowDraftModal(false);
  };

  // Android 하드웨어 뒤로가기 버튼 처리
  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true; // 이벤트를 소비했음을 알림
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [navigation]);

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

      // 성공 시 임시저장 삭제
      await clearDraft();

      // 첫 글 작성 업적 체크
      if (deviceId) {
        await unlockAchievement(deviceId, 'first_post');

        // 7일 연속 작성 업적 체크
        await checkStreakAchievement(deviceId);
      }

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

  const isOverLimit = confession.length > MAX_CHARS;

  const styles = getStyles(colors);


  return (
    <SafeAreaView style={styles.container}>
      {/* 2026 디자인 시스템: 헤더 최소화 (뒤로가기 버튼만 작게) */}
      <View style={styles.minimalHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}>
          <Ionicons name="close" size={24} color={neutral[500]} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>일기 작성</Text>
        
        {/* 폰트 변경 버튼 - 텍스트로 표시 */}
        <TouchableOpacity
          style={styles.fontButton}
          onPress={() => {
            console.log('🎨 폰트 버튼 클릭!');
            setFontSelectorVisible(true);
          }}
          activeOpacity={0.7}
          hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}>
          <Text style={styles.fontButtonText}>{fontOption.displayName}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          
          {/* 2026 디자인 시스템: 여백을 적극적으로 사용 */}
          <View style={styles.topSpacing} />

          {/* 일기 입력 - 화면 중앙에 큰 여백과 함께 */}
          <View style={styles.inputSection}>
            <TextInput
              style={[styles.textInput, {fontFamily: getFontFamily()}]}
              placeholder="오늘 하루는 어땠나요?"
              placeholderTextColor={neutral[400]}
              multiline
              maxLength={MAX_CHARS + 50}
              value={confession}
              onChangeText={setConfession}
              editable={!isLoading}
              textAlignVertical="top"
            />
            
            {/* 글자 수 카운터 - 작고 뉴트럴 컬러 */}
            <Text
              style={[
                styles.charCount,
                isOverLimit && {color: errorColors[500]},
              ]}>
              {confession.length}/{MAX_CHARS}
            </Text>
          </View>

          {/* 여백 */}
          <View style={styles.middleSpacing} />

          {/* 보조 요소 - 하단에 작게 배치 */}
          <View style={styles.auxiliarySection}>
            {/* 기분 선택 */}
            <View style={styles.auxiliaryItem}>
              <MoodSelector
                selectedMood={selectedMood}
                onMoodSelect={setSelectedMood}
              />
            </View>

            {/* 태그 입력 */}
            <View style={styles.auxiliaryItem}>
              <TagInput tags={tags} onTagsChange={setTags} />
            </View>

            {/* 사진 첨부 */}
            <View style={styles.auxiliaryItem}>
              <ImagePickerComponent
                images={images}
                onImagesChange={setImages}
                maxImages={3}
              />
            </View>
          </View>

          {/* 여백 */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* 하단 제출 버튼 - 뉴트럴 스타일 */}
        <View style={styles.bottomContainer}>
          <Button
            title="완료"
            variant="primary"
            size="lg"
            onPress={handleSubmit}
            disabled={!confession.trim() || isLoading || isOverLimit}
            loading={isLoading}
            fullWidth
          />
        </View>
      </KeyboardAvoidingView>
      
      {/* 업적 모달 */}
      {currentAchievement && (
        <AchievementModal
          visible={isModalVisible}
          achievementType={currentAchievement.achievement_type}
          onClose={hideAchievement}
        />
      )}
      
      {/* 폰트 선택 모달 */}
      <FontSelector
        visible={fontSelectorVisible}
        onClose={() => setFontSelectorVisible(false)}
      />

      {/* 임시저장 복구 모달 */}
      {draft && (
        <DraftRecoveryModal
          visible={showDraftModal}
          draft={draft}
          onRecover={handleRecoverDraft}
          onDiscard={handleDiscardDraft}
          onClose={() => setShowDraftModal(false)}
        />
      )}
    </SafeAreaView>
  );
}

const getStyles = (colors: typeof lightColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // 2026 디자인 시스템: 헤더 최소화
  minimalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: typeof colors.neutral === 'object' ? colors.neutral[700] : colors.textPrimary,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: typeof colors.neutral === 'object' ? colors.neutral[100] : '#F5F5F5',
    borderRadius: borderRadius.md,
  },
  fontButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: typeof colors.neutral === 'object' ? colors.neutral[700] : colors.textPrimary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,  // 넉넉한 여백
    paddingBottom: spacing.xl,
  },
  // 2026 디자인 시스템: 여백을 적극적으로 사용
  topSpacing: {
    height: spacing['2xl'],
  },
  middleSpacing: {
    height: spacing.xl,
  },
  bottomSpacing: {
    height: spacing['2xl'],
  },
  // 일기 입력 - 화면 중앙에 큰 여백과 함께
  inputSection: {
    marginBottom: spacing.lg,
  },
  textInput: {
    minHeight: 300,  // 큰 높이
    padding: spacing.lg,
    fontSize: typography.fontSize.base,
    color: typeof colors.neutral === 'object' ? colors.neutral[700] : colors.textPrimary,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,  // 행간 증가
    letterSpacing: typography.letterSpacing.normal,  // 자간 증가
    textAlignVertical: 'top',
    backgroundColor: typeof colors.neutral === 'object' ? colors.neutral[50] : colors.backgroundAlt,  // 2026 디자인 시스템: 얕은 배경 추가
    borderRadius: borderRadius.xl,  // 둥근 모서리
  },
  // 글자 수 카운터 - 작고 뉴트럴 컬러
  charCount: {
    fontSize: typography.fontSize.xs,
    color: typeof colors.neutral === 'object' ? colors.neutral[500] : colors.textSecondary,
    fontWeight: typography.fontWeight.regular,  // Bold 최소화
    marginTop: spacing.sm,
    textAlign: 'right',
    letterSpacing: typography.letterSpacing.normal,
  },
  // 보조 요소 - 하단에 작게 배치
  auxiliarySection: {
    gap: spacing.md,
  },
  auxiliaryItem: {
    marginBottom: spacing.sm,
  },
  // 하단 제출 버튼
  bottomContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: typeof colors.neutral === 'object' ? colors.neutral[200] : colors.border,
  },
});

