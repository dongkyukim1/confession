/**
 * 이미지 선택 컴포넌트
 *
 * 일기에 사진을 첨부하는 UI (Placeholder 버전)
 * 실제 이미지 선택은 react-native-image-picker 등을 사용해야 함
 */
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image, ScrollView} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {spacing, borderRadius} from '../theme';
import {lightColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';

type ImagePickerProps = {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
};

export default function ImagePickerComponent({
  images,
  onImagesChange,
  maxImages = 3,
}: ImagePickerProps) {
  const {colors} = useTheme();
  const handleAddImage = () => {
    // TODO: 실제 이미지 선택 로직 구현
    // react-native-image-picker 또는 expo-image-picker 사용
    console.log('이미지 선택 기능은 추후 구현 예정');
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>사진 첨부</Text>
        <Text style={styles.counter}>
          {images.length}/{maxImages}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* 이미지 추가 버튼 */}
        {images.length < maxImages && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddImage}
            activeOpacity={0.7}>
            <Ionicons name="camera-outline" size={28} color={colors.textTertiary} />
            <Text style={styles.addButtonText}>사진 추가</Text>
          </TouchableOpacity>
        )}

        {/* 선택된 이미지들 */}
        {images.map((uri, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{uri}} style={styles.image} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveImage(index)}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Ionicons name="close-circle" size={22} color={colors.error} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
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
  scrollContent: {
    gap: spacing.sm,
  },
  addButton: {
    width: 100,
    height: 100,
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 4,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundAlt,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
  },
});
