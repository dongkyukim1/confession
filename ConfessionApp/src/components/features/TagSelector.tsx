/**
 * Tag Selector Component
 *
 * Multi-select tag/category picker
 */
import React from 'react';
import {View, Text, StyleSheet, ScrollView, ViewStyle} from 'react-native';
import {Tag} from '../ui/Tag';
import {PREDEFINED_TAGS} from '../../types/features';
import {useTheme} from '../../theme';
import {spacing, typography} from '../../theme/tokens';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  label?: string;
  maxTags?: number;
  style?: ViewStyle;
}

export const TagSelector = ({
  selectedTags,
  onTagsChange,
  label = '기분/카테고리',
  maxTags = 3,
  style,
}: TagSelectorProps) => {
  const {colors} = useTheme();

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
        <Text style={[styles.label, {color: colors.neutral[700]}]}>
          {label}
        </Text>
        <Text style={[styles.count, {color: colors.neutral[500]}]}>
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
};

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
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  count: {
    fontSize: typography.sizes.xs,
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
