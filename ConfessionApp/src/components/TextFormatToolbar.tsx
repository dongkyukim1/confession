/**
 * 텍스트 서식 툴바
 * 
 * 텍스트 굵게, 기울임, 색상 변경 기능
 */
import React, {useState} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Text,
  Dimensions,
} from 'react-native';
import {colors, spacing, borderRadius, shadows} from '../theme';

export interface TextStyle {
  bold?: boolean;
  italic?: boolean;
  color?: string;
}

interface TextFormatToolbarProps {
  currentStyle: TextStyle;
  onStyleChange: (style: TextStyle) => void;
  charCount?: number;
  maxChars?: number;
}

const TEXT_COLORS = [
  {color: colors.textPrimary, label: '기본'},
  {color: colors.editorColors.red, label: '빨강'},
  {color: colors.editorColors.orange, label: '주황'},
  {color: colors.editorColors.yellow, label: '노랑'},
  {color: colors.editorColors.green, label: '초록'},
  {color: colors.editorColors.blue, label: '파랑'},
  {color: colors.editorColors.purple, label: '보라'},
  {color: colors.editorColors.pink, label: '핑크'},
];

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const HORIZONTAL_PADDING = spacing.lg * 2;
const GAP = spacing.sm;
const BUTTON_COUNT = 3;
const BUTTON_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING - GAP * (BUTTON_COUNT - 1)) / BUTTON_COUNT;

export default function TextFormatToolbar({
  currentStyle,
  onStyleChange,
  charCount = 0,
  maxChars = 500,
}: TextFormatToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const toggleBold = () => {
    onStyleChange({...currentStyle, bold: !currentStyle.bold});
  };

  const toggleItalic = () => {
    onStyleChange({...currentStyle, italic: !currentStyle.italic});
  };

  const selectColor = (color: string) => {
    onStyleChange({...currentStyle, color});
    setShowColorPicker(false);
  };

  return (
    <>
      <View style={styles.toolbarRow}>
        <View style={styles.toolbar}>
          {/* 굵게 */}
          <TouchableOpacity
            style={[styles.button, currentStyle.bold && styles.buttonActive]}
            onPress={toggleBold}
            activeOpacity={0.7}>
            <Text style={[styles.buttonIcon, currentStyle.bold && styles.buttonIconActive]}>Aa</Text>
            <Text style={[styles.buttonLabel, currentStyle.bold && styles.buttonLabelActive]}>
              굵게
            </Text>
          </TouchableOpacity>

          {/* 기울임 */}
          <TouchableOpacity
            style={[styles.button, currentStyle.italic && styles.buttonActive]}
            onPress={toggleItalic}
            activeOpacity={0.7}>
            <Text style={[styles.buttonIcon, styles.italicIcon, currentStyle.italic && styles.buttonIconActive]}>Aa</Text>
            <Text style={[styles.buttonLabel, currentStyle.italic && styles.buttonLabelActive]}>
              기울임
            </Text>
          </TouchableOpacity>

          {/* 색상 */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowColorPicker(true)}
            activeOpacity={0.7}>
            <View
              style={[
                styles.colorPreview,
                {backgroundColor: currentStyle.color || colors.textPrimary},
              ]}
            />
            <Text style={styles.buttonLabel}>색상</Text>
          </TouchableOpacity>
        </View>

        {/* 글자 수 카운터 */}
        <View style={styles.charCountContainer}>
          <Text style={styles.charCount}>{charCount}/{maxChars}</Text>
        </View>
      </View>

      {/* 색상 선택 모달 */}
      <Modal
        visible={showColorPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowColorPicker(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowColorPicker(false)}>
          <View style={styles.colorPickerContainer}>
            <Text style={styles.colorPickerTitle}>텍스트 색상 선택</Text>
            <View style={styles.colorGrid}>
              {TEXT_COLORS.map(item => (
                <TouchableOpacity
                  key={item.color}
                  style={[
                    styles.colorOption,
                    currentStyle.color === item.color && styles.colorOptionSelected,
                  ]}
                  onPress={() => selectColor(item.color)}
                  activeOpacity={0.7}>
                  <View
                    style={[styles.colorCircle, {backgroundColor: item.color}]}
                  />
                  <Text style={styles.colorLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  toolbar: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.backgroundAlt,
  },
  buttonActive: {
    backgroundColor: colors.primary + '15',
  },
  buttonIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  italicIcon: {
    fontStyle: 'italic',
  },
  buttonIconActive: {
    color: colors.primary,
  },
  buttonLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  buttonLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  colorPreview: {
    width: 18,
    height: 18,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  charCountContainer: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 70,
    alignItems: 'center',
  },
  charCount: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  colorPickerContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 320,
    ...shadows.large,
  },
  colorPickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  colorOption: {
    width: '22%',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.backgroundAlt,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  colorLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});


