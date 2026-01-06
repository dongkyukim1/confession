/**
 * 텍스트 서식 툴바 컴포넌트
 *
 * 일기 작성 시 텍스트 서식 지정 및 글자 수 표시
 */
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {spacing, borderRadius} from '../theme';
import {lightColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';

export interface TextStyle {
  bold?: boolean;
  italic?: boolean;
  color?: string;
}

type TextFormatToolbarProps = {
  currentStyle: TextStyle;
  onStyleChange: (style: TextStyle) => void;
  charCount: number;
  maxChars: number;
};

export default function TextFormatToolbar({
  currentStyle,
  onStyleChange,
  charCount,
  maxChars,
}: TextFormatToolbarProps) {
  const {colors} = useTheme();
  const styles = getStyles(colors);

  const toggleBold = () => {
    onStyleChange({...currentStyle, bold: !currentStyle.bold});
  };

  const toggleItalic = () => {
    onStyleChange({...currentStyle, italic: !currentStyle.italic});
  };

  const setColor = (color: string) => {
    onStyleChange({
      ...currentStyle,
      color: currentStyle.color === color ? undefined : color,
    });
  };

  const isOverLimit = charCount > maxChars;

  return (
    <View style={styles.container}>
      <View style={styles.toolbarRow}>
        {/* 볼드 */}
        <TouchableOpacity
          style={[styles.button, currentStyle.bold && styles.activeButton]}
          onPress={toggleBold}
          activeOpacity={0.7}>
          <Ionicons
            name="text"
            size={18}
            color={currentStyle.bold ? colors.primary : colors.textSecondary}
            style={{fontWeight: 'bold'}}
          />
        </TouchableOpacity>

        {/* 이탤릭 */}
        <TouchableOpacity
          style={[styles.button, currentStyle.italic && styles.activeButton]}
          onPress={toggleItalic}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.italicIcon,
              {
                color: currentStyle.italic
                  ? colors.primary
                  : colors.textSecondary,
              },
            ]}>
            I
          </Text>
        </TouchableOpacity>

        {/* 색상 선택 */}
        <View style={styles.colorRow}>
          {Object.entries(colors.editorColors || {}).map(([key, color]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.colorButton,
                {backgroundColor: color},
                currentStyle.color === color && styles.activeColorButton,
              ]}
              onPress={() => setColor(color)}
              activeOpacity={0.7}
            />
          ))}
        </View>

        {/* 글자 수 */}
        <Text style={[styles.charCount, isOverLimit && styles.overLimit]}>
          {charCount}/{maxChars}
        </Text>
      </View>
    </View>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      marginBottom: spacing.md,
    },
    toolbarRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    button: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.backgroundAlt,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    activeButton: {
      backgroundColor: colors.primary + '20',
      borderColor: colors.primary,
    },
    italicIcon: {
      fontSize: 18,
      fontStyle: 'italic',
      fontWeight: '600',
    },
    colorRow: {
      flexDirection: 'row',
      gap: spacing.xs,
      marginLeft: spacing.sm,
    },
    colorButton: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
    },
    activeColorButton: {
      borderWidth: 3,
      borderColor: colors.textPrimary,
    },
    charCount: {
      marginLeft: 'auto',
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    overLimit: {
      color: colors.error,
      fontWeight: '600',
    },
  });
