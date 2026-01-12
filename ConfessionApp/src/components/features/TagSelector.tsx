/**
 * Tag Selector Component
 *
 * Multi-select tag/category picker
 */
import React, {memo} from 'react';
import {View, Text, StyleSheet, ScrollView, ViewStyle} from 'react-native';
import {Tag} from '../ui/Tag';
import {PREDEFINED_TAGS} from '../../types/features';
import {useTheme} from '../../contexts/ThemeContext';
import {spacing, typography} from '../../theme';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  label?: string;
  maxTags?: number;
  style?: ViewStyle;
}

export const TagSelector = memo(({
  selectedTags,
  onTagsChange,
  label = '기분/카테고리',
  maxTags = 3,
  style,
}: TagSelectorProps) => {
  const theme = useTheme();
  // colors가 객체인지 확인하고 안전하게 처리
  const colors = (theme && typeof theme.colors === 'object' && theme.colors) || {
    neutral: {
      500: '#737373',
      700: '#404040',
    },
  };

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(id => id !== tagId));
    } else {
      if (selectedTags.length < maxTags) {
        onTagsChange([...selectedTags, tagId]);
      }
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={[styles.label, {color: typeof colors.neutral === 'object' ? colors.neutral[700] : '#404040'}]}>
          {label}
        </Text>
        <Text style={[styles.count, {color: typeof colors.neutral === 'object' ? colors.neutral[500] : '#737373'}]}>
          {selectedTags.length}/{maxTags}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagsContainer}>
        {PREDEFINED_TAGS.map(tag => (
          <Tag
            key={tag.id}
            icon={tag.icon}
            selected={selectedTags.includes(tag.id)}
            onPress={() => toggleTag(tag.id)}
            size="md"
            style={styles.tag}>
            {tag.name}
          </Tag>
        ))}
      </ScrollView>
    </View>
  );
});

TagSelector.displayName = 'TagSelector';

const styles = StyleSheet.create({
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
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  count: {
    fontSize: typography.fontSize.xs,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  tag: {
    marginRight: spacing.xs,
  },
});
