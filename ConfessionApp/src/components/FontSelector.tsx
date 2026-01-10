/**
 * FontSelector - 폰트 선택 컴포넌트
 *
 * 사용자가 폰트를 미리보고 선택할 수 있는 UI
 */
import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useFont, FONT_OPTIONS, FontFamily, FontOption} from '../contexts/FontContext';
import {useTheme} from '../contexts/ThemeContext';
import {spacing, borderRadius} from '../theme';
import {lightColors} from '../theme/colors';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface FontSelectorProps {
  visible: boolean;
  onClose: () => void;
}

export default function FontSelector({visible, onClose}: FontSelectorProps) {
  const {selectedFont, setSelectedFont} = useFont();
  const {colors} = useTheme();
  const [tempSelected, setTempSelected] = useState<FontFamily>(selectedFont);

  const styles = getStyles(colors);

  // 디버깅 로그
  React.useEffect(() => {
    console.log('📝 FontSelector 열림, 현재 폰트:', selectedFont);
    console.log('📝 사용 가능한 폰트:', Object.keys(FONT_OPTIONS));
  }, [visible]);

  // Group fonts by category
  const fontsByCategory = Object.values(FONT_OPTIONS).reduce(
    (acc, font) => {
      if (!acc[font.category]) {
        acc[font.category] = [];
      }
      acc[font.category].push(font);
      return acc;
    },
    {} as Record<string, FontOption[]>,
  );

  const categoryLabels: Record<string, string> = {
    system: '시스템',
    handwriting: '손글씨',
    serif: '세리프',
    'sans-serif': '산세리프',
  };

  const categoryIcons: Record<string, string> = {
    system: 'phone-portrait-outline',
    handwriting: 'brush-outline',
    serif: 'book-outline',
    'sans-serif': 'text-outline',
  };

  const handleConfirm = async () => {
    console.log('✅ 폰트 선택:', tempSelected);
    await setSelectedFont(tempSelected);
    console.log('✅ 폰트 저장 완료');
    onClose();
  };

  const handleCancel = () => {
    setTempSelected(selectedFont);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>취소</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>폰트 선택</Text>
            <TouchableOpacity onPress={handleConfirm} style={styles.headerButton}>
              <Text style={[styles.headerButtonText, styles.confirmText]}>
                완료
              </Text>
            </TouchableOpacity>
          </View>

          {/* Font List */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {Object.entries(fontsByCategory).map(([category, fonts]) => (
              <View key={category} style={styles.categorySection}>
                <View style={styles.categoryHeader}>
                  <Ionicons
                    name={categoryIcons[category]}
                    size={20}
                    color={colors.primary}
                    style={{marginRight: spacing.sm}}
                  />
                  <Text style={styles.categoryTitle}>
                    {categoryLabels[category]}
                  </Text>
                </View>

                {fonts.map(font => {
                  const isSelected = tempSelected === font.id;
                  return (
                    <TouchableOpacity
                      key={font.id}
                      style={[
                        styles.fontOption,
                        isSelected && styles.fontOptionSelected,
                      ]}
                      onPress={() => setTempSelected(font.id)}
                      activeOpacity={0.7}>
                      <View style={styles.fontOptionHeader}>
                        <View style={styles.fontInfo}>
                          <Text style={styles.fontName}>{font.displayName}</Text>
                          <Text style={styles.fontDescription}>
                            {font.description}
                          </Text>
                        </View>
                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={24}
                            color={colors.primary}
                          />
                        )}
                      </View>
                      <View style={styles.fontPreview}>
                        <Text
                          style={[
                            styles.previewText,
                            {fontFamily: font.fontFamily},
                          ]}>
                          {font.previewText}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      height: '90%',
      paddingBottom: spacing.xl,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerButton: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      minWidth: 60,
    },
    headerButtonText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    confirmText: {
      color: colors.primary,
      fontWeight: '600',
      textAlign: 'right',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.xl,
    },
    categorySection: {
      marginBottom: spacing.xl,
    },
    categoryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    categoryTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    fontOption: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      borderWidth: 2,
      borderColor: colors.border,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    fontOptionSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
    },
    fontOptionHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    fontInfo: {
      flex: 1,
      marginRight: spacing.md,
    },
    fontName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 2,
    },
    fontDescription: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    fontPreview: {
      backgroundColor: colors.backgroundAlt,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginTop: spacing.sm,
    },
    previewText: {
      fontSize: 18,
      color: colors.textPrimary,
      lineHeight: 28,
    },
  });
