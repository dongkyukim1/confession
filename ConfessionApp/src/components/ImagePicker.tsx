/**
 * 이미지 선택 컴포넌트
 *
 * 일기에 사진을 첨부하는 기능
 * react-native-image-picker로 이미지 선택 후 Supabase Storage에 업로드
 *
 * 검증 규칙:
 * - 최대 파일 크기: 5MB
 * - 허용 타입: JPEG, PNG, WebP, HEIC
 * - 최대 크기: 2048x2048
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
  Modal,
  Dimensions,
} from 'react-native';
import {launchImageLibrary, ImageLibraryOptions, Asset} from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {spacing, borderRadius} from '../theme';
import {lightColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';
import {supabase} from '../lib/supabase';

// 이미지 검증 상수
const IMAGE_CONSTRAINTS = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
  maxDimensions: {width: 2048, height: 2048},
};

// 이미지 검증 결과 타입
interface ValidationResult {
  valid: boolean;
  error?: string;
}

// 파일 크기 포맷팅
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingCount, setUploadingCount] = useState({current: 0, total: 0});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  /**
   * 이미지 검증
   */
  const validateImage = (asset: Asset): ValidationResult => {
    // 파일 크기 검증
    if (asset.fileSize && asset.fileSize > IMAGE_CONSTRAINTS.maxSize) {
      return {
        valid: false,
        error: `파일 크기가 너무 큽니다 (${formatFileSize(asset.fileSize)}). 최대 ${formatFileSize(IMAGE_CONSTRAINTS.maxSize)}까지 가능합니다.`,
      };
    }

    // 파일 타입 검증
    if (asset.type && !IMAGE_CONSTRAINTS.allowedTypes.includes(asset.type)) {
      return {
        valid: false,
        error: `지원하지 않는 이미지 형식입니다. JPEG, PNG, WebP, HEIC 형식만 가능합니다.`,
      };
    }

    // 이미지 크기 검증
    if (asset.width && asset.height) {
      if (
        asset.width > IMAGE_CONSTRAINTS.maxDimensions.width ||
        asset.height > IMAGE_CONSTRAINTS.maxDimensions.height
      ) {
        return {
          valid: false,
          error: `이미지 크기가 너무 큽니다. 최대 ${IMAGE_CONSTRAINTS.maxDimensions.width}x${IMAGE_CONSTRAINTS.maxDimensions.height}px까지 가능합니다.`,
        };
      }
    }

    return {valid: true};
  };

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
      includeBase64: true, // base64 인코딩 포함
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
        // 검증 먼저 수행
        const validAssets: Asset[] = [];
        const errors: string[] = [];

        for (const asset of result.assets) {
          const validation = validateImage(asset);
          if (validation.valid) {
            validAssets.push(asset);
          } else if (validation.error) {
            errors.push(validation.error);
          }
        }

        // 검증 실패한 이미지가 있으면 알림
        if (errors.length > 0) {
          Alert.alert(
            '일부 이미지를 업로드할 수 없습니다',
            errors.join('\n\n'),
          );
        }

        // 검증 통과한 이미지만 업로드
        if (validAssets.length > 0) {
          setUploading(true);
          setUploadingCount({current: 0, total: validAssets.length});
          setUploadProgress(0);

          const uploadedUrls: string[] = [];

          for (let i = 0; i < validAssets.length; i++) {
            setUploadingCount({current: i + 1, total: validAssets.length});
            setUploadProgress(((i + 1) / validAssets.length) * 100);

            const url = await uploadImageToSupabase(validAssets[i]);
            if (url) {
              uploadedUrls.push(url);
            }
          }

          if (uploadedUrls.length > 0) {
            onImagesChange([...images, ...uploadedUrls]);
          }

          setUploading(false);
          setUploadProgress(0);
          setUploadingCount({current: 0, total: 0});
        }
      }
    } catch (error) {
      console.error('이미지 선택 오류:', error);
      Alert.alert('오류', '이미지를 선택하는 중 문제가 발생했습니다.');
      setUploading(false);
    }
  };

  /**
   * Supabase Storage에 이미지 업로드
   * React Native에서는 base64로 인코딩하여 업로드
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

      // base64 문자열로 변환
      // react-native-image-picker는 base64를 직접 제공하지 않으므로
      // FileReader로 읽어서 변환
      let base64Data: string;
      
      if (asset.base64) {
        // base64가 있으면 사용
        base64Data = asset.base64;
      } else {
        // base64가 없으면 URI에서 읽기
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        
        base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              // data:image/jpeg;base64,... 형식에서 base64 부분만 추출
              const base64 = reader.result.split(',')[1];
              resolve(base64);
            } else {
              reject(new Error('Failed to read file as base64'));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      // base64를 ArrayBuffer로 변환
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Supabase Storage에 업로드
      const {error} = await supabase.storage
        .from('confession-images')
        .upload(filePath, bytes.buffer, {
          contentType: asset.type || 'image/jpeg',
          cacheControl: '3600',
          upsert: false,
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
      Alert.alert('오류', '이미지를 업로드하는 중 문제가 발생했습니다.');
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
            <Text style={styles.uploadingText}>
              {uploadingCount.total > 1
                ? `${uploadingCount.current}/${uploadingCount.total} 업로드 중`
                : '업로드 중...'}
            </Text>
            {uploadingCount.total > 1 && (
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {width: `${uploadProgress}%`, backgroundColor: colors.primary},
                  ]}
                />
              </View>
            )}
          </View>
        )}

        {/* 선택된 이미지들 */}
        {images.map((uri, index) => (
          <View key={index} style={styles.imageContainer}>
            <TouchableOpacity
              onPress={() => setSelectedImage(uri)}
              activeOpacity={0.8}>
              <Image 
                source={{uri}} 
                style={styles.image}
                resizeMode="cover"
              />
            </TouchableOpacity>
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

      {/* 이미지 확대 Modal */}
      <Modal
        visible={selectedImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}>
        <View style={styles.modalContainer}>
          {/* 배경 터치로 닫기 */}
          <TouchableOpacity
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setSelectedImage(null)}
          />
          
          {/* 확대된 이미지 */}
          {selectedImage && (
            <View style={styles.modalContent}>
              <Image
                source={{uri: selectedImage}}
                style={styles.fullImage}
                resizeMode="contain"
              />
              
              {/* 닫기 버튼 */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedImage(null)}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Ionicons name="close" size={30} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
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
    textAlign: 'center',
  },
  progressBarContainer: {
    width: 80,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: borderRadius.full,
    padding: 8,
  },
});
