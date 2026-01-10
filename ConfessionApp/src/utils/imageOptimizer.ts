/**
 * Image Optimizer
 * 
 * 이미지 업로드 전 최적화를 처리합니다.
 * - 리사이징
 * - 압축
 * - 썸네일 생성
 */
import ImageResizer from 'react-native-image-resizer';
import {Platform} from 'react-native';

export interface OptimizedImage {
  uri: string;
  width: number;
  height: number;
  size: number;
}

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'JPEG' | 'PNG' | 'WEBP';
}

export class ImageOptimizer {
  // 기본 설정
  private static readonly DEFAULT_OPTIONS: Required<ImageOptimizationOptions> = {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 85,
    format: 'JPEG',
  };

  // 썸네일 설정
  private static readonly THUMBNAIL_OPTIONS: Required<ImageOptimizationOptions> = {
    maxWidth: 400,
    maxHeight: 400,
    quality: 80,
    format: 'JPEG',
  };

  /**
   * 이미지 최적화
   */
  static async optimize(
    imageUri: string,
    options?: ImageOptimizationOptions,
  ): Promise<OptimizedImage> {
    try {
      const config = {...this.DEFAULT_OPTIONS, ...options};

      console.log('[ImageOptimizer] Optimizing image:', imageUri);
      console.log('[ImageOptimizer] Options:', config);

      const result = await ImageResizer.createResizedImage(
        imageUri,
        config.maxWidth,
        config.maxHeight,
        config.format,
        config.quality,
        0, // rotation
        undefined, // outputPath
        false, // keepMeta
        {
          mode: 'contain',
          onlyScaleDown: true,
        },
      );

      const optimized: OptimizedImage = {
        uri: result.uri,
        width: result.width,
        height: result.height,
        size: result.size || 0,
      };

      console.log('[ImageOptimizer] Optimized:', optimized);
      return optimized;
    } catch (error) {
      console.error('[ImageOptimizer] Failed to optimize image:', error);
      throw new Error('이미지 최적화에 실패했습니다');
    }
  }

  /**
   * 썸네일 생성
   */
  static async createThumbnail(imageUri: string): Promise<OptimizedImage> {
    try {
      console.log('[ImageOptimizer] Creating thumbnail:', imageUri);

      const result = await ImageResizer.createResizedImage(
        imageUri,
        this.THUMBNAIL_OPTIONS.maxWidth,
        this.THUMBNAIL_OPTIONS.maxHeight,
        this.THUMBNAIL_OPTIONS.format,
        this.THUMBNAIL_OPTIONS.quality,
        0,
        undefined,
        false,
        {
          mode: 'cover',
          onlyScaleDown: false,
        },
      );

      const thumbnail: OptimizedImage = {
        uri: result.uri,
        width: result.width,
        height: result.height,
        size: result.size || 0,
      };

      console.log('[ImageOptimizer] Thumbnail created:', thumbnail);
      return thumbnail;
    } catch (error) {
      console.error('[ImageOptimizer] Failed to create thumbnail:', error);
      throw new Error('썸네일 생성에 실패했습니다');
    }
  }

  /**
   * 배치 최적화
   */
  static async optimizeBatch(
    imageUris: string[],
    options?: ImageOptimizationOptions,
  ): Promise<OptimizedImage[]> {
    try {
      console.log('[ImageOptimizer] Batch optimizing:', imageUris.length, 'images');

      const promises = imageUris.map(uri => this.optimize(uri, options));
      const results = await Promise.all(promises);

      console.log('[ImageOptimizer] Batch optimization complete');
      return results;
    } catch (error) {
      console.error('[ImageOptimizer] Batch optimization failed:', error);
      throw new Error('이미지 일괄 최적화에 실패했습니다');
    }
  }

  /**
   * 이미지 크기 검증
   */
  static validateSize(sizeInBytes: number, maxSizeInMB: number = 10): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return sizeInBytes <= maxSizeInBytes;
  }

  /**
   * 이미지 포맷 검증
   */
  static validateFormat(uri: string): boolean {
    const validFormats = ['.jpg', '.jpeg', '.png', '.webp'];
    const lowerUri = uri.toLowerCase();
    return validFormats.some(format => lowerUri.endsWith(format));
  }

  /**
   * 파일 크기를 사람이 읽을 수 있는 형식으로 변환
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * 압축률 계산
   */
  static calculateCompressionRatio(
    originalSize: number,
    compressedSize: number,
  ): number {
    if (originalSize === 0) return 0;
    return Math.round(((originalSize - compressedSize) / originalSize) * 100);
  }
}
