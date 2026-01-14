/**
 * Draft Service
 *
 * 임시저장 기능 관리
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const DRAFT_KEY = 'confession_draft';
const AUTO_SAVE_INTERVAL = 30000; // 30초

export interface DraftData {
  content: string;
  mood?: string;
  tags?: string[];
  images?: string[];
  savedAt: string;
}

export class DraftService {
  /**
   * 임시저장 데이터 저장
   */
  static async saveDraft(data: Omit<DraftData, 'savedAt'>): Promise<void> {
    try {
      // 내용이 비어있으면 저장하지 않음
      if (!data.content || data.content.trim().length === 0) {
        return;
      }

      const draftData: DraftData = {
        ...data,
        savedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
      console.log('[DraftService] Draft saved:', draftData.savedAt);
    } catch (error) {
      console.error('[DraftService] Failed to save draft:', error);
    }
  }

  /**
   * 임시저장 데이터 불러오기
   */
  static async getDraft(): Promise<DraftData | null> {
    try {
      const draftJson = await AsyncStorage.getItem(DRAFT_KEY);
      if (!draftJson) {
        return null;
      }

      const draft: DraftData = JSON.parse(draftJson);

      // 24시간 이상 지난 임시저장은 무효화
      const savedTime = new Date(draft.savedAt).getTime();
      const now = Date.now();
      const hoursDiff = (now - savedTime) / (1000 * 60 * 60);

      if (hoursDiff > 24) {
        await this.clearDraft();
        console.log('[DraftService] Draft expired (>24h)');
        return null;
      }

      console.log('[DraftService] Draft loaded:', draft.savedAt);
      return draft;
    } catch (error) {
      console.error('[DraftService] Failed to load draft:', error);
      return null;
    }
  }

  /**
   * 임시저장 데이터 삭제
   */
  static async clearDraft(): Promise<void> {
    try {
      await AsyncStorage.removeItem(DRAFT_KEY);
      console.log('[DraftService] Draft cleared');
    } catch (error) {
      console.error('[DraftService] Failed to clear draft:', error);
    }
  }

  /**
   * 임시저장 데이터 존재 여부 확인
   */
  static async hasDraft(): Promise<boolean> {
    try {
      const draft = await this.getDraft();
      return draft !== null && draft.content.trim().length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * 자동저장 간격 반환
   */
  static getAutoSaveInterval(): number {
    return AUTO_SAVE_INTERVAL;
  }

  /**
   * 임시저장 시간 포맷팅
   */
  static formatSavedTime(savedAt: string): string {
    const saved = new Date(savedAt);
    const now = new Date();
    const diffMs = now.getTime() - saved.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) {
      return '방금 전';
    } else if (diffMins < 60) {
      return `${diffMins}분 전`;
    } else if (diffHours < 24) {
      return `${diffHours}시간 전`;
    } else {
      return saved.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }
}
