/**
 * Enhanced Home Screen
 *
 * Improved diary writing screen with tags, prompts, and better UX
 */
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import {CompositeNavigationProp} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList, BottomTabParamList, Confession} from '../types';
import {Button} from '../components/ui/Button';
import {TagSelector} from '../components/features/TagSelector';
import {DailyPromptCard} from '../components/features/DailyPromptCard';
import {supabase} from '../lib/supabase';
import {getOrCreateDeviceId} from '../utils/deviceId';
import {calculateWordCount} from '../utils/statistics';
import {useModal, showWarningModal, showSuccessModal, showErrorModal} from '../contexts/ModalContext';
import {useTheme} from '../theme';
import {spacing, typography, borderRadius} from '../theme/tokens';
import {triggerHaptic} from '../utils/haptics';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type HomeScreenProps = {
  navigation: HomeScreenNavigationProp;
};

const {height} = Dimensions.get('window');
const MIN_CHARS = 10;
const MAX_CHARS = 1000;

export default function EnhancedHomeScreen({navigation}: HomeScreenProps) {
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const {showModal} = useModal();
  const {colors} = useTheme();

  useEffect(() => {
    getOrCreateDeviceId().then(setDeviceId);
  }, []);

  useEffect(() => {
    setWordCount(calculateWordCount(content));
  }, [content]);

  const handleUsePrompt = (promptText: string) => {
    triggerHaptic('impactMedium');
    setContent(promptText + '\n\n');
  };

  const handleSubmit = async () => {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      showWarningModal(showModal, '알림', '일기 내용을 입력해주세요.');
      return;
    }

    if (trimmedContent.length < MIN_CHARS) {
      showWarningModal(
        showModal,
        '알림',
        `최소 ${MIN_CHARS}자 이상 작성해주세요.`,
      );
      return;
    }

    if (!deviceId) {
      showErrorModal(showModal, '오류', '잠시 후 다시 시도해주세요.');
      return;
    }

    setIsLoading(true);
    triggerHaptic('impactHeavy');

    try {
      // Save diary entry
      const {data, error} = await supabase
        .from('confessions')
        .insert({
          content: trimmedContent,
          device_id: deviceId,
          tags: selectedTags.length > 0 ? selectedTags : null,
          word_count: wordCount,
        })
        .select()
        .single<Confession>();

      if (error) throw error;

      // Fetch random confession
      const {data: randomConfession, error: fetchError} = await supabase
        .from('confessions')
        .select('id')
        .neq('device_id', deviceId)
        .neq('id', data.id)
        .order('view_count', {ascending: true})
        .limit(10);

      if (fetchError) throw fetchError;

      // Reset form
      setContent('');
      setSelectedTags([]);

      if (!randomConfession || randomConfession.length === 0) {
        showSuccessModal(
          showModal,
          '첫 번째 작성자',
          '아직 다른 일기가 없습니다.\n당신이 첫 번째입니다! 🎉',
          true,
        );
        return;
      }

      // Navigate to reveal screen
      const randomIndex = Math.floor(Math.random() * randomConfession.length);
      navigation.navigate('Reveal', {
        confessionId: randomConfession[randomIndex].id,
      });
    } catch (error) {
      console.error('Save error:', error);
      showErrorModal(
        showModal,
        '오류',
        '저장 중 문제가 발생했습니다.\n잠시 후 다시 시도해주세요.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const charPercentage = (content.length / MAX_CHARS) * 100;
  const isOverLimit = content.length > MAX_CHARS;
  const canSubmit = content.trim().length >= MIN_CHARS && !isOverLimit;

  return (
    <KeyboardAvoidingView
      style={[styles.container, {backgroundColor: colors.neutral[50]}]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>📝</Text>
          <Text style={[styles.title, {color: colors.neutral[900]}]}>
            오늘의 일기
          </Text>
          <Text style={[styles.subtitle, {color: colors.neutral[600]}]}>
            당신의 하루를 기록하세요
          </Text>
        </View>

        {/* Daily Prompt */}
        <DailyPromptCard onUsePrompt={handleUsePrompt} />

        {/* Tag Selector */}
        <View style={styles.section}>
          <TagSelector
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
          />
        </View>

        {/* Text Input */}
        <View style={styles.section}>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.neutral[0],
                borderColor: isOverLimit
                  ? colors.error[500]
                  : colors.neutral[200],
              },
            ]}>
            <TextInput
              style={[styles.textInput, {color: colors.neutral[900]}]}
              placeholder="오늘 하루는 어땠나요?"
              placeholderTextColor={colors.neutral[400]}
              multiline
              maxLength={MAX_CHARS + 100}
              value={content}
              onChangeText={setContent}
              editable={!isLoading}
              textAlignVertical="top"
            />
          </View>

          {/* Character Count */}
          <View style={styles.footer}>
            <View style={styles.wordCountContainer}>
              <Text style={[styles.wordCountLabel, {color: colors.neutral[600]}]}>
                단어:
              </Text>
              <Text style={[styles.wordCount, {color: colors.primary[600]}]}>
                {wordCount}
              </Text>
            </View>
            <Text
              style={[
                styles.charCount,
                {
                  color: isOverLimit
                    ? colors.error[500]
                    : charPercentage > 80
                    ? colors.warning[500]
                    : colors.neutral[500],
                },
              ]}>
              {content.length}/{MAX_CHARS}
            </Text>
          </View>

          {/* Progress Bar */}
          <View
            style={[
              styles.progressBar,
              {backgroundColor: colors.neutral[200]},
            ]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(charPercentage, 100)}%`,
                  backgroundColor: isOverLimit
                    ? colors.error[500]
                    : charPercentage > 80
                    ? colors.warning[500]
                    : colors.primary[500],
                },
              ]}
            />
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <Button
            onPress={handleSubmit}
            disabled={!canSubmit || isLoading}
            loading={isLoading}
            size="lg"
            fullWidth>
            일기 쓰고 다른 하루 보기
          </Button>
        </View>

        {/* Disclaimer */}
        <Text style={[styles.disclaimer, {color: colors.neutral[500]}]}>
          모든 일기는 익명으로 처리됩니다
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: height * 0.06,
    paddingBottom: spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    textAlign: 'center',
    lineHeight: typography.sizes.md * typography.lineHeights.relaxed,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  inputContainer: {
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    overflow: 'hidden',
    minHeight: 200,
    maxHeight: 400,
  },
  textInput: {
    flex: 1,
    padding: spacing.lg,
    fontSize: typography.sizes.md,
    lineHeight: typography.sizes.md * typography.lineHeights.relaxed,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  wordCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  wordCountLabel: {
    fontSize: typography.sizes.sm,
  },
  wordCount: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  charCount: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  progressBar: {
    height: 3,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: typography.sizes.sm,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
});
