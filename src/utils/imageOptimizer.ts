/**
 * Image Optimizer Utility
 * 이미지 압축 및 최적화
 */

import {Platform} from 'react-native';
import {Asset} from 'react-native-image-picker';

/**
 * 이미지 압축 옵션
 */
export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  format?: 'JPEG' | 'PNG';
}

/**
 * 최적화된 이미지 정보
 */
export interface OptimizedImage {
  uri: string;
  width: number;
  height: number;
  fileSize: number;
  fileName: string;
  type: string;
}

/**
 * 기본 압축 옵션
 */
const DEFAULT_OPTIONS: ImageCompressionOptions = {
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 0.8,
  format: 'JPEG',
};

/**
 * 파일 크기를 사람이 읽기 쉬운 형식으로 변환
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) {return '0 B';}

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}

/**
 * 이미지가 압축이 필요한지 확인
 */
export function needsCompression(
  image: Asset,
  options: ImageCompressionOptions = DEFAULT_OPTIONS,
): boolean {
  const {maxWidth = 1024, maxHeight = 1024} = options;
  const width = image.width || 0;
  const height = image.height || 0;
  const fileSize = image.fileSize || 0;

  // 크기가 최대 크기를 초과하거나 파일 크기가 1MB를 초과하면 압축 필요
  return (
    width > maxWidth ||
    height > maxHeight ||
    fileSize > 1024 * 1024 // 1MB
  );
}

/**
 * 새로운 이미지 크기 계산 (비율 유지)
 */
export function calculateNewDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
): {width: number; height: number} {
  let newWidth = originalWidth;
  let newHeight = originalHeight;

  // 가로가 더 긴 경우
  if (originalWidth > originalHeight) {
    if (originalWidth > maxWidth) {
      newWidth = maxWidth;
      newHeight = (originalHeight * maxWidth) / originalWidth;
    }
  } else {
    // 세로가 더 긴 경우
    if (originalHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = (originalWidth * maxHeight) / originalHeight;
    }
  }

  return {
    width: Math.round(newWidth),
    height: Math.round(newHeight),
  };
}

/**
 * 이미지 압축
 * Note: react-native-image-resizer 패키지가 필요합니다
 */
export async function compressImage(
  image: Asset,
  options: ImageCompressionOptions = DEFAULT_OPTIONS,
): Promise<OptimizedImage> {
  try {
    // react-native-image-resizer를 사용한 압축
    // TODO: npm install react-native-image-resizer 필요
    // const ImageResizer = require('react-native-image-resizer');

    const {maxWidth = 1024, maxHeight = 1024, quality = 0.8, format = 'JPEG'} = {
      ...DEFAULT_OPTIONS,
      ...options,
    };

    // 압축이 필요하지 않으면 원본 반환
    if (!needsCompression(image, options)) {
      return {
        uri: image.uri || '',
        width: image.width || 0,
        height: image.height || 0,
        fileSize: image.fileSize || 0,
        fileName: image.fileName || 'image.jpg',
        type: image.type || 'image/jpeg',
      };
    }

    // 새로운 크기 계산
    const {width: newWidth, height: newHeight} = calculateNewDimensions(
      image.width || 0,
      image.height || 0,
      maxWidth,
      maxHeight,
    );

    // 임시: react-native-image-resizer가 설치되지 않은 경우 원본 반환
    // 실제 구현 시 아래 코드 사용
    /*
    const compressedImage = await ImageResizer.createResizedImage(
      image.uri || '',
      newWidth,
      newHeight,
      format,
      Math.round(quality * 100),
      0,
      undefined,
      false,
      {mode: 'contain'},
    );

    return {
      uri: compressedImage.uri,
      width: compressedImage.width,
      height: compressedImage.height,
      fileSize: compressedImage.size,
      fileName: compressedImage.name,
      type: `image/${format.toLowerCase()}`,
    };
    */

    // 임시: 원본 반환 (실제 압축 라이브러리 설치 후 삭제)
    console.warn(
      '[Image Optimizer] react-native-image-resizer not installed. Returning original image.',
    );

    return {
      uri: image.uri || '',
      width: newWidth,
      height: newHeight,
      fileSize: image.fileSize || 0,
      fileName: image.fileName || 'image.jpg',
      type: image.type || 'image/jpeg',
    };
  } catch (error) {
    console.error('[Image Optimizer] Compression failed:', error);

    // 압축 실패 시 원본 반환
    return {
      uri: image.uri || '',
      width: image.width || 0,
      height: image.height || 0,
      fileSize: image.fileSize || 0,
      fileName: image.fileName || 'image.jpg',
      type: image.type || 'image/jpeg',
    };
  }
}

/**
 * 여러 이미지 일괄 압축
 */
export async function compressImages(
  images: Asset[],
  options: ImageCompressionOptions = DEFAULT_OPTIONS,
  onProgress?: (current: number, total: number) => void,
): Promise<OptimizedImage[]> {
  const optimizedImages: OptimizedImage[] = [];

  for (let i = 0; i < images.length; i++) {
    const optimized = await compressImage(images[i], options);
    optimizedImages.push(optimized);

    if (onProgress) {
      onProgress(i + 1, images.length);
    }
  }

  return optimizedImages;
}

/**
 * 이미지 압축 통계
 */
export interface CompressionStats {
  originalSize: number;
  compressedSize: number;
  savedSize: number;
  savedPercentage: number;
  originalSizeFormatted: string;
  compressedSizeFormatted: string;
  savedSizeFormatted: string;
}

/**
 * 압축 통계 계산
 */
export function calculateCompressionStats(
  originalSize: number,
  compressedSize: number,
): CompressionStats {
  const savedSize = originalSize - compressedSize;
  const savedPercentage =
    originalSize > 0 ? Math.round((savedSize / originalSize) * 100) : 0;

  return {
    originalSize,
    compressedSize,
    savedSize,
    savedPercentage,
    originalSizeFormatted: formatFileSize(originalSize),
    compressedSizeFormatted: formatFileSize(compressedSize),
    savedSizeFormatted: formatFileSize(savedSize),
  };
}

/**
 * 이미지 MIME 타입 검증
 */
export function isValidImageType(type?: string): boolean {
  if (!type) {return false;}

  const validTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  return validTypes.includes(type.toLowerCase());
}

/**
 * 이미지 파일 크기 제한 확인
 */
export function isWithinSizeLimit(
  fileSize: number,
  maxSizeMB: number = 10,
): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return fileSize <= maxSizeBytes;
}

/**
 * 이미지 유효성 검사
 */
export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImage(
  image: Asset,
  maxSizeMB: number = 10,
): ImageValidationResult {
  // MIME 타입 검증
  if (!isValidImageType(image.type)) {
    return {
      valid: false,
      error: '지원하지 않는 이미지 형식입니다. (JPEG, PNG, GIF, WebP만 가능)',
    };
  }

  // 파일 크기 검증
  if (image.fileSize && !isWithinSizeLimit(image.fileSize, maxSizeMB)) {
    return {
      valid: false,
      error: `이미지 크기는 ${maxSizeMB}MB 이하여야 합니다.`,
    };
  }

  // URI 존재 여부 확인
  if (!image.uri) {
    return {
      valid: false,
      error: '이미지를 불러올 수 없습니다.',
    };
  }

  return {valid: true};
}

/**
 * 여러 이미지 유효성 검사
 */
export function validateImages(
  images: Asset[],
  maxImages: number = 5,
  maxSizeMB: number = 10,
): ImageValidationResult {
  // 이미지 개수 확인
  if (images.length > maxImages) {
    return {
      valid: false,
      error: `최대 ${maxImages}개의 이미지만 업로드할 수 있습니다.`,
    };
  }

  // 각 이미지 유효성 검사
  for (const image of images) {
    const result = validateImage(image, maxSizeMB);
    if (!result.valid) {
      return result;
    }
  }

  return {valid: true};
}

/**
 * 썸네일 생성 옵션
 */
export const THUMBNAIL_OPTIONS: ImageCompressionOptions = {
  maxWidth: 300,
  maxHeight: 300,
  quality: 0.7,
  format: 'JPEG',
};

/**
 * 미리보기용 이미지 옵션
 */
export const PREVIEW_OPTIONS: ImageCompressionOptions = {
  maxWidth: 800,
  maxHeight: 800,
  quality: 0.8,
  format: 'JPEG',
};

/**
 * 업로드용 이미지 옵션
 */
export const UPLOAD_OPTIONS: ImageCompressionOptions = {
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 0.8,
  format: 'JPEG',
};
