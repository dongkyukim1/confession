/**
 * Share Service
 *
 * 고백 공유 기능 (텍스트, 이미지 공유)
 */
import {Share, Platform} from 'react-native';
import {Confession} from '../types';

export interface ShareOptions {
  confession: Confession;
  includeAppLink?: boolean;
}

export interface ShareResult {
  success: boolean;
  action?: 'shared' | 'dismissed';
  error?: string;
}

export class ShareService {
  private static readonly APP_NAME = '고백일기';
  private static readonly APP_LINK = 'https://confession-app.example.com'; // 앱 링크 (추후 설정)

  /**
   * 고백 내용 공유
   */
  static async shareConfession(options: ShareOptions): Promise<ShareResult> {
    const {confession, includeAppLink = true} = options;

    try {
      // 공유할 텍스트 구성
      const shareText = this.buildShareText(confession, includeAppLink);

      const result = await Share.share(
        {
          message: shareText,
          title: '고백일기에서 공유',
        },
        {
          dialogTitle: '공유하기',
          subject: '고백일기에서 공유',
        },
      );

      if (result.action === Share.sharedAction) {
        console.log('[ShareService] Shared successfully');
        return {success: true, action: 'shared'};
      } else if (result.action === Share.dismissedAction) {
        console.log('[ShareService] Share dismissed');
        return {success: true, action: 'dismissed'};
      }

      return {success: true};
    } catch (error) {
      console.error('[ShareService] Share failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '공유에 실패했습니다.',
      };
    }
  }

  /**
   * 공유 텍스트 생성
   */
  private static buildShareText(
    confession: Confession,
    includeAppLink: boolean,
  ): string {
    const parts: string[] = [];

    // 무드 이모지
    if (confession.mood) {
      parts.push(`${confession.mood}`);
    }

    // 본문 (길면 자르기)
    const maxContentLength = 200;
    let content = confession.content;
    if (content.length > maxContentLength) {
      content = content.slice(0, maxContentLength) + '...';
    }
    parts.push(content);

    // 태그
    if (confession.tags && confession.tags.length > 0) {
      const tagsText = confession.tags.map(tag => `#${tag}`).join(' ');
      parts.push(tagsText);
    }

    // 앱 링크
    if (includeAppLink) {
      parts.push('');
      parts.push(`📱 ${this.APP_NAME}에서 더 많은 이야기를 확인하세요`);
      // parts.push(this.APP_LINK); // 앱 출시 후 활성화
    }

    return parts.join('\n');
  }

  /**
   * 딥링크 URL 생성
   */
  static getDeepLink(confessionId: string): string {
    return `confession://view/${confessionId}`;
  }

  /**
   * 웹 URL 생성
   */
  static getWebLink(confessionId: string): string {
    return `${this.APP_LINK}/confession/${confessionId}`;
  }

  /**
   * 플랫폼별 공유 가능 여부 확인
   */
  static canShare(): boolean {
    return Platform.OS === 'ios' || Platform.OS === 'android';
  }
}
