/**
 * 임시저장 복구 모달
 *
 * 이전에 작성하던 내용을 복구할지 묻는 모달
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {DraftData, DraftService} from '../../services/draft.service';
import {useThemeColors} from '../../hooks/useThemeColors';
import {spacing, typography, borderRadius} from '../../theme';
import {lightColors} from '../../theme/colors';

interface DraftRecoveryModalProps {
  visible: boolean;
  draft: DraftData;
  onRecover: () => void;
  onDiscard: () => void;
  onClose: () => void;
}

export function DraftRecoveryModal({
  visible,
  draft,
  onRecover,
  onDiscard,
  onClose,
}: DraftRecoveryModalProps) {
  const {colors, neutral} = useThemeColors();
  const styles = getStyles(colors, neutral);

  const previewContent =
    draft.content.length > 100
      ? draft.content.slice(0, 100) + '...'
      : draft.content;

  const savedTimeText = DraftService.formatSavedTime(draft.savedAt);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              {/* 헤더 */}
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <Ionicons name="document-text" size={24} color={colors.primary} />
                </View>
                <Text style={styles.title}>작성 중인 글이 있습니다</Text>
                <Text style={styles.subtitle}>{savedTimeText}에 저장됨</Text>
              </View>

              {/* 미리보기 */}
              <View style={styles.previewContainer}>
                <Text style={styles.previewText}>{previewContent}</Text>
                {draft.mood && (
                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>기분: {draft.mood}</Text>
                  </View>
                )}
                {draft.tags && draft.tags.length > 0 && (
                  <View style={styles.tagsRow}>
                    {draft.tags.slice(0, 3).map(tag => (
                      <View key={tag} style={styles.tagChip}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                    {draft.tags.length > 3 && (
                      <Text style={styles.moreTagsText}>+{draft.tags.length - 3}</Text>
                    )}
                  </View>
                )}
              </View>

              {/* 버튼 */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.discardButton]}
                  onPress={onDiscard}
                  activeOpacity={0.7}>
                  <Ionicons name="trash-outline" size={18} color={neutral[600]} />
                  <Text style={styles.discardButtonText}>삭제</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.recoverButton]}
                  onPress={onRecover}
                  activeOpacity={0.7}>
                  <Ionicons name="refresh" size={18} color="#FFFFFF" />
                  <Text style={styles.recoverButtonText}>복구</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const getStyles = (
  colors: typeof lightColors,
  neutral: Record<number, string>,
) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    container: {
      width: '100%',
      maxWidth: 340,
      backgroundColor: neutral[0],
      borderRadius: borderRadius.xl,
      padding: spacing.xl,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 10},
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 10,
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primaryScale?.[50] || colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: '600',
      color: neutral[800],
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontSize: typography.fontSize.sm,
      color: neutral[500],
      textAlign: 'center',
    },
    previewContainer: {
      backgroundColor: neutral[50],
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.lg,
    },
    previewText: {
      fontSize: typography.fontSize.sm,
      color: neutral[700],
      lineHeight: typography.fontSize.sm * 1.5,
    },
    metaRow: {
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: neutral[200],
    },
    metaText: {
      fontSize: typography.fontSize.xs,
      color: neutral[500],
    },
    tagsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: spacing.sm,
      gap: spacing.xs,
    },
    tagChip: {
      backgroundColor: neutral[200],
      paddingVertical: 2,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.full,
    },
    tagText: {
      fontSize: typography.fontSize.xs,
      color: neutral[600],
    },
    moreTagsText: {
      fontSize: typography.fontSize.xs,
      color: neutral[500],
      alignSelf: 'center',
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    button: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
      borderRadius: borderRadius.lg,
      gap: spacing.xs,
    },
    discardButton: {
      backgroundColor: neutral[100],
    },
    discardButtonText: {
      fontSize: typography.fontSize.base,
      fontWeight: '500',
      color: neutral[600],
    },
    recoverButton: {
      backgroundColor: colors.primary,
    },
    recoverButtonText: {
      fontSize: typography.fontSize.base,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });

export default DraftRecoveryModal;
