/**
 * 이미지 선택 컴포넌트
 * 
 * 갤러리/카메라에서 이미지를 선택하고 미리보기
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {launchImageLibrary, launchCamera, Asset} from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, spacing, borderRadius} from '../theme';

interface ImagePickerProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImagePickerComponent({
  images,
  onImagesChange,
  maxImages = 3,
}: ImagePickerProps) {
  const handleSelectImage = async (fromCamera: boolean = false) => {
    if (images.length >= maxImages) {
      Alert.alert('알림', `최대 ${maxImages}장까지 첨부할 수 있습니다.`);
      return;
    }

    try {
      const options = {
        mediaType: 'photo' as const,
        quality: 0.8 as const,
        maxWidth: 1920,
        maxHeight: 1920,
      };

      const result = fromCamera
        ? await launchCamera(options)
        : await launchImageLibrary(options);

      if (result.didCancel || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      if (asset.uri) {
        // 실제 구현에서는 여기서 Cloudinary나 Supabase Storage에 업로드
        // 현재는 로컬 URI를 임시로 저장
        onImagesChange([...images, asset.uri]);
      }
    } catch (error) {
      console.error('이미지 선택 오류:', error);
      Alert.alert('오류', '이미지를 선택하는 중 문제가 발생했습니다.');
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>사진 첨부 (최대 {maxImages}장)</Text>

      <View style={styles.contentWrapper}>
        {/* 이미지가 있으면 미리보기 표시 */}
        {images.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imagesContainer}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{uri}} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(index)}>
                  <Ionicons name="close-circle" size={22} color={colors.surface} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {/* 이미지 추가 버튼 - 항상 2개 균등 배치 */}
        {images.length < maxImages && (
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleSelectImage(false)}
              activeOpacity={0.7}>
              <Ionicons name="images-outline" size={28} color={colors.primary} />
              <Text style={styles.addButtonText}>갤러리</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleSelectImage(true)}
              activeOpacity={0.7}>
              <Ionicons name="camera-outline" size={28} color={colors.primary} />
              <Text style={styles.addButtonText}>카메라</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
  contentWrapper: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  imagesContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  imageContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundAlt,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: borderRadius.full,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  addButton: {
    flex: 1,
    height: 72,
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});


