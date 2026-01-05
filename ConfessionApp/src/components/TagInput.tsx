/**
 * 태그 입력 컴포넌트
 * 
 * 태그 추가/삭제 기능
 */
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, spacing, borderRadius} from '../theme';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

const INPUT_HEIGHT = 48;

export default function TagInput({tags, onTagsChange}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAddTag = () => {
    const trimmed = inputValue.trim().replace(/^#/, ''); // # 제거
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      onTagsChange([...tags, trimmed]);
      setInputValue('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    onTagsChange(tags.filter(t => t !== tag));
  };

  const isDisabled = !inputValue.trim() || tags.length >= 5;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>태그 (최대 5개)</Text>

      {/* 입력 필드 */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="태그 입력 (예: 일상, 회사, 취미)"
          placeholderTextColor={colors.textTertiary}
          value={inputValue}
          onChangeText={setInputValue}
          onSubmitEditing={handleAddTag}
          returnKeyType="done"
          maxLength={15}
        />
        <TouchableOpacity
          style={[styles.addButton, isDisabled && styles.addButtonDisabled]}
          onPress={handleAddTag}
          activeOpacity={0.7}
          disabled={isDisabled}>
          <Ionicons name="add" size={22} color={colors.surface} />
        </TouchableOpacity>
      </View>

      {/* 태그 목록 */}
      {tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {tags.map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
              <TouchableOpacity
                onPress={() => handleRemoveTag(tag)}
                style={styles.removeButton}
                activeOpacity={0.7}>
                <Ionicons
                  name="close"
                  size={14}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    height: INPUT_HEIGHT,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    width: INPUT_HEIGHT,
    height: INPUT_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: colors.borderDark,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    borderRadius: borderRadius.full,
    paddingVertical: 6,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    gap: 4,
  },
  tagText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  removeButton: {
    padding: 2,
  },
});
