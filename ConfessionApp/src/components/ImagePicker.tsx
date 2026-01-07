/**
 * 이미지 선택 컴포넌트
 *
 * 일기에 사진을 첨부하는 기능
 * react-native-image-picker로 이미지 선택 후 Supabase Storage에 업로드
 */
import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import {launchImageLibrary, ImageLibraryOptions, Asset} from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {spacing, borderRadius} from '../theme';
import {lightColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';
import {supabase} from '../lib/supabase';

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
  const [uploading, setUploading] = useState(false);

  /**
   * 이미지 선택 및 Supabase Storage 업로드
   */
  const handleAddImage = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1200,
      maxHeight: 1200,
      selectionLimit: maxImages - images.length,
    };

    try {
      const result = await launchImageLibrary(options);

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert('오류', '이미지를 선택할 수 없습니다.');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        setUploading(true);
        const uploadedUrls: string[] = [];

        for (const asset of result.assets) {
          const url = await uploadImageToSupabase(asset);
          if (url) {
            uploadedUrls.push(url);
          }
        }

        if (uploadedUrls.length > 0) {
          onImagesChange([...images, ...uploadedUrls]);
        }

        setUploading(false);
      }
    } catch (error) {
      console.error('이미지 선택 오류:', error);
      Alert.alert('오류', '이미지를 선택하는 중 문제가 발생했습니다.');
      setUploading(false);
    }
  };

  /**
   * Supabase Storage에 이미지 업로드
   */
  const uploadImageToSupabase = async (asset: Asset): Promise<string | null> => {
    try {
      if (!asset.uri || !asset.fileName) {
        return null;
      }

      // 파일명 생성 (타임스탬프 + 랜덤 문자열)
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 9);
      const fileExt = asset.fileName.split('.').pop() || 'jpg';
      const fileName = `${timestamp}_${random}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // FormData로 파일 업로드 준비
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'ios' ? asset.uri.replace('file://', '') : asset.uri,
        type: asset.type || 'image/jpeg',
        name: fileName,
      } as any);

      // Supabase Storage에 업로드
      const {data, error} = await supabase.storage
        .from('confession-images')
        .upload(filePath, formData, {
          contentType: asset.type || 'image/jpeg',
          cacheControl: '3600',
        });

      if (error) {
        console.error('Supabase 업로드 오류:', error);
        Alert.alert('업로드 실패', '이미지를 업로드할 수 없습니다.');
        return null;
      }

      // Public URL 가져오기
      const {data: {publicUrl}} = supabase.storage
        .from('confession-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      return null;
    }
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
        {images.length < maxImages && !uploading && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddImage}
            activeOpacity={0.7}
            disabled={uploading}>
            <Ionicons name="camera-outline" size={28} color={colors.textTertiary} />
            <Text style={styles.addButtonText}>사진 추가</Text>
          </TouchableOpacity>
        )}

        {/* 업로드 중 표시 */}
        {uploading && (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.uploadingText}>업로드 중...</Text>
          </View>
        )}

        {/* 선택된 이미지들 */}
        {images.map((uri, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image 
              source={{uri}} 
              style={styles.image}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveImage(index)}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Ionicons name="close-circle" size={22} color={colors.error} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {images.length > 0 && (
        <Text style={styles.hint}>
          💡 사진을 터치하여 크게 볼 수 있습니다
        </Text>
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
  uploadingContainer: {
    width: 100,
    height: 100,
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  uploadingText: {
    fontSize: 11,
    color: colors.textSecondary,
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
  hint: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
