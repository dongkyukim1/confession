/**
 * 태그 입력 컴포넌트
 *
 * 일기에 태그를 추가하는 UI
 */
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {spacing, borderRadius} from '../theme';
import {lightColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';

const MAX_TAGS = 5;
const MAX_TAG_LENGTH = 15;

// 추천 태그
const SUGGESTED_TAGS = ['일상', '감사', '반성', '다짐', '추억', '고민', '성장'];

type TagInputProps = {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
};

export default function TagInput({tags, onTagsChange}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const {colors} = useTheme();

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().replace(/^#/, '');
    if (
      trimmedTag &&
      trimmedTag.length <= MAX_TAG_LENGTH &&
      tags.length < MAX_TAGS &&
      !tags.includes(trimmedTag)
    ) {
      onTagsChange([...tags, trimmedTag]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmitEditing = () => {
    addTag(inputValue);
  };

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>태그</Text>
        <Text style={styles.counter}>
          {tags.length}/{MAX_TAGS}
        </Text>
      </View>

      {/* 입력된 태그들 */}
      {tags.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tagsContainer}
          contentContainerStyle={styles.tagsContent}>
          {tags.map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
              <TouchableOpacity
                onPress={() => removeTag(tag)}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* 태그 입력 */}
      {tags.length < MAX_TAGS && (
        <View style={styles.inputContainer}>
          <Ionicons name="pricetag-outline" size={18} color={colors.textTertiary} />
          <TextInput
            style={styles.input}
            placeholder="태그 입력 후 Enter"
            placeholderTextColor={colors.textTertiary}
            value={inputValue}
            onChangeText={setInputValue}
            onSubmitEditing={handleSubmitEditing}
            maxLength={MAX_TAG_LENGTH}
            returnKeyType="done"
          />
        </View>
      )}

      {/* 추천 태그 */}
      {tags.length < MAX_TAGS && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.suggestedContainer}
          contentContainerStyle={styles.suggestedContent}>
          {SUGGESTED_TAGS.filter(tag => !tags.includes(tag)).map(tag => (
            <TouchableOpacity
              key={tag}
              style={styles.suggestedTag}
              onPress={() => addTag(tag)}
              activeOpacity={0.7}>
              <Text style={styles.suggestedTagText}>+{tag}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const getStyles = (colors: typeof lightColors) => StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  counter: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  tagsContainer: {
    marginBottom: spacing.sm,
  },
  tagsContent: {
    gap: spacing.xs,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    paddingVertical: 6,
    paddingLeft: spacing.sm,
    paddingRight: 6,
    borderRadius: borderRadius.full,
    marginRight: spacing.xs,
    gap: 4,
  },
  tagText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  suggestedContainer: {
    marginTop: spacing.sm,
  },
  suggestedContent: {
    gap: spacing.xs,
  },
  suggestedTag: {
    backgroundColor: colors.backgroundAlt,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    marginRight: spacing.xs,
  },
  suggestedTagText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
