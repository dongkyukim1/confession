/**
 * 신고하기 모달 컴포넌트
 * 
 * 부적절한 콘텐츠를 신고할 수 있는 모달 UI
 */
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';
import {ReportReason} from '../../types/database';
import {useTheme} from '../../theme';
import {spacing, borderRadius, typography, shadows} from '../../theme/tokens';
import {triggerHaptic} from '../../utils/haptics';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReason, description?: string) => void;
  isSubmitting?: boolean;
}

interface ReportOption {
  id: ReportReason;
  label: string;
  icon: string;
  description: string;
}

const REPORT_OPTIONS: ReportOption[] = [
  {
    id: 'offensive',
    label: '욕설/비방',
    icon: '😡',
    description: '욕설이나 타인을 비방하는 내용',
  },
  {
    id: 'sexual',
    label: '음란물',
    icon: '🔞',
    description: '성적이거나 선정적인 내용',
  },
  {
    id: 'spam',
    label: '스팸',
    icon: '📢',
    description: '광고나 도배성 내용',
  },
  {
    id: 'violence',
    label: '폭력',
    icon: '⚠️',
    description: '폭력적이거나 위험한 내용',
  },
  {
    id: 'other',
    label: '기타',
    icon: '📝',
    description: '그 외 부적절한 내용',
  },
];

export const ReportModal = ({
  visible,
  onClose,
  onSubmit,
  isSubmitting = false,
}: ReportModalProps) => {
  const {colors} = useTheme();
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(
    null,
  );
  const [description, setDescription] = useState('');

  const handleClose = () => {
    if (isSubmitting) return;
    setSelectedReason(null);
    setDescription('');
    onClose();
  };

  const handleSubmit = () => {
    if (!selectedReason || isSubmitting) return;
    triggerHaptic('notificationSuccess');
    onSubmit(selectedReason, description.trim() || undefined);
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}>
      <Pressable
        style={styles.overlay}
        onPress={handleClose}
        disabled={isSubmitting}>
        <Pressable
          style={[styles.modal, {backgroundColor: colors.neutral[0]}]}
          onPress={e => e.stopPropagation()}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={[styles.title, {color: colors.neutral[900]}]}>
              신고하기
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              disabled={isSubmitting}>
              <Ionicons
                name="close"
                size={24}
                color={colors.neutral[600]}
              />
            </TouchableOpacity>
          </View>

          {/* 내용 */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}>
            {/* 안내 메시지 */}
            <View
              style={[
                styles.infoBox,
                {backgroundColor: colors.warning[50]},
              ]}>
              <Text style={[styles.infoText, {color: colors.warning[800]}]}>
                신고된 게시물은 검토 후 적절한 조치가 취해집니다.
              </Text>
            </View>

            {/* 신고 사유 선택 */}
            <Text style={[styles.label, {color: colors.neutral[700]}]}>
              신고 사유를 선택해주세요
            </Text>
            <View style={styles.options}>
              {REPORT_OPTIONS.map(option => {
                const isSelected = selectedReason === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.option,
                      {
                        backgroundColor: isSelected
                          ? colors.danger[50]
                          : colors.neutral[50],
                        borderColor: isSelected
                          ? colors.danger[500]
                          : colors.neutral[200],
                      },
                    ]}
                    onPress={() => {
                      triggerHaptic('impactLight');
                      setSelectedReason(option.id);
                    }}
                    disabled={isSubmitting}
                    activeOpacity={0.7}>
                    <View style={styles.optionHeader}>
                      <Text style={styles.optionIcon}>{option.icon}</Text>
                      <Text
                        style={[
                          styles.optionLabel,
                          {
                            color: isSelected
                              ? colors.danger[900]
                              : colors.neutral[900],
                          },
                        ]}>
                        {option.label}
                      </Text>
                      {isSelected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={colors.danger[500]}
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.optionDescription,
                        {
                          color: isSelected
                            ? colors.danger[700]
                            : colors.neutral[600],
                        },
                      ]}>
                      {option.description}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 상세 설명 (선택) */}
            {selectedReason && (
              <View style={styles.descriptionSection}>
                <Text style={[styles.label, {color: colors.neutral[700]}]}>
                  추가 설명 (선택사항)
                </Text>
                <TextInput
                  style={[
                    styles.textArea,
                    {
                      backgroundColor: colors.neutral[50],
                      borderColor: colors.neutral[200],
                      color: colors.neutral[900],
                    },
                  ]}
                  placeholder="더 자세한 내용을 입력해주세요..."
                  placeholderTextColor={colors.neutral[400]}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                  editable={!isSubmitting}
                />
                <Text style={[styles.charCount, {color: colors.neutral[500]}]}>
                  {description.length}/500
                </Text>
              </View>
            )}
          </ScrollView>

          {/* 버튼 */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
                {
                  backgroundColor: colors.neutral[100],
                  borderColor: colors.neutral[300],
                },
              ]}
              onPress={handleClose}
              disabled={isSubmitting}
              activeOpacity={0.7}>
              <Text style={[styles.buttonText, {color: colors.neutral[700]}]}>
                취소
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                {
                  backgroundColor:
                    selectedReason && !isSubmitting
                      ? colors.danger[500]
                      : colors.neutral[300],
                },
              ]}
              onPress={handleSubmit}
              disabled={!selectedReason || isSubmitting}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.buttonText,
                  {
                    color:
                      selectedReason && !isSubmitting
                        ? colors.neutral[0]
                        : colors.neutral[500],
                  },
                ]}>
                {isSubmitting ? '신고 중...' : '신고하기'}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modal: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
    borderRadius: borderRadius.xl,
    ...shadows.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  content: {
    padding: spacing.lg,
  },
  infoBox: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
  },
  label: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
  },
  options: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  option: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  optionIcon: {
    fontSize: typography.sizes.xl,
  },
  optionLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    flex: 1,
  },
  optionDescription: {
    fontSize: typography.sizes.sm,
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
    marginLeft: spacing.xl + spacing.sm,
  },
  descriptionSection: {
    marginBottom: spacing.md,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  charCount: {
    fontSize: typography.sizes.xs,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  submitButton: {
    ...shadows.md,
  },
  buttonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});

