/**
 * 공유 시트 컴포넌트
 *
 * 고백 공유 옵션을 제공하는 바텀 시트
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Clipboard from '@react-native-clipboard/clipboard';
import {Confession} from '../../types';
import {ShareService} from '../../services/share.service';
import {useThemeColors} from '../../hooks/useThemeColors';
import {spacing, typography, borderRadius} from '../../theme';
import {lightColors} from '../../theme/colors';

interface ShareSheetProps {
  visible: boolean;
  confession: Confession;
  onClose: () => void;
}

export function ShareSheet({visible, confession, onClose}: ShareSheetProps) {
  const {colors, neutral} = useThemeColors();
  const styles = getStyles(colors, neutral);

  const handleShare = async () => {
    const result = await ShareService.shareConfession({
      confession,
      includeAppLink: true,
    });

    if (result.action === 'shared') {
      onClose();
    } else if (!result.success && result.error) {
      Alert.alert('공유 실패', result.error);
    }
  };

  const handleCopyText = () => {
    const text = confession.content;
    Clipboard.setString(text);
    Alert.alert('복사 완료', '텍스트가 클립보드에 복사되었습니다.');
    onClose();
  };

  const handleCopyLink = () => {
    const link = ShareService.getDeepLink(confession.id);
    Clipboard.setString(link);
    Alert.alert('복사 완료', '링크가 클립보드에 복사되었습니다.');
    onClose();
  };

  const shareOptions = [
    {
      icon: 'share-social-outline',
      label: '공유하기',
      description: '다른 앱으로 공유',
      onPress: handleShare,
      color: colors.primary,
    },
    {
      icon: 'copy-outline',
      label: '텍스트 복사',
      description: '내용을 클립보드에 복사',
      onPress: handleCopyText,
      color: neutral[600],
    },
    {
      icon: 'link-outline',
      label: '링크 복사',
      description: '공유 링크를 클립보드에 복사',
      onPress: handleCopyLink,
      color: neutral[600],
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              {/* 핸들 */}
              <View style={styles.handleContainer}>
                <View style={styles.handle} />
              </View>

              {/* 제목 */}
              <Text style={styles.title}>공유</Text>

              {/* 미리보기 */}
              <View style={styles.previewContainer}>
                {confession.mood && (
                  <Text style={styles.previewMood}>{confession.mood}</Text>
                )}
                <Text style={styles.previewText} numberOfLines={2}>
                  {confession.content}
                </Text>
              </View>

              {/* 옵션 목록 */}
              <View style={styles.optionsContainer}>
                {shareOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.optionItem}
                    onPress={option.onPress}
                    activeOpacity={0.7}>
                    <View
                      style={[
                        styles.optionIcon,
                        {backgroundColor: option.color + '15'},
                      ]}>
                      <Ionicons
                        name={option.icon as any}
                        size={22}
                        color={option.color}
                      />
                    </View>
                    <View style={styles.optionContent}>
                      <Text style={styles.optionLabel}>{option.label}</Text>
                      <Text style={styles.optionDescription}>
                        {option.description}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={neutral[400]}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* 취소 버튼 */}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                activeOpacity={0.7}>
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
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
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: neutral[0],
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      paddingBottom: spacing.xl + 20, // Safe area
    },
    handleContainer: {
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: neutral[300],
      borderRadius: 2,
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: '600',
      color: neutral[800],
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    previewContainer: {
      marginHorizontal: spacing.lg,
      padding: spacing.md,
      backgroundColor: neutral[50],
      borderRadius: borderRadius.lg,
      marginBottom: spacing.lg,
    },
    previewMood: {
      fontSize: 24,
      marginBottom: spacing.xs,
    },
    previewText: {
      fontSize: typography.fontSize.sm,
      color: neutral[600],
      lineHeight: typography.fontSize.sm * 1.5,
    },
    optionsContainer: {
      paddingHorizontal: spacing.lg,
    },
    optionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: neutral[100],
    },
    optionIcon: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.lg,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    optionContent: {
      flex: 1,
    },
    optionLabel: {
      fontSize: typography.fontSize.base,
      fontWeight: '500',
      color: neutral[800],
      marginBottom: 2,
    },
    optionDescription: {
      fontSize: typography.fontSize.sm,
      color: neutral[500],
    },
    cancelButton: {
      marginTop: spacing.lg,
      marginHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: neutral[100],
      borderRadius: borderRadius.lg,
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: typography.fontSize.base,
      fontWeight: '500',
      color: neutral[600],
    },
  });

export default ShareSheet;
