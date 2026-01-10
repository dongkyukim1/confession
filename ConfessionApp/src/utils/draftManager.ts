/**
 * Draft Manager
 * 
 * 작성 중인 고백을 자동으로 저장하고 복구합니다.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const DRAFT_KEY = '@confession_draft';
const AUTO_SAVE_INTERVAL = 5000; // 5초마다 자동 저장

export interface DraftData {
  content: string;
  mood?: string;
  tags: string[];
  images: string[];
  lastSaved: string;
}

export class DraftManager {
  private static autoSaveTimer: NodeJS.Timeout | null = null;

  /**
   * Draft 저장
   */
  static async saveDraft(data: Omit<DraftData, 'lastSaved'>): Promise<void> {
    try {
      const draft: DraftData = {
        ...data,
        lastSaved: new Date().toISOString(),
      };

      await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      console.log('[DraftManager] Draft saved:', draft);
    } catch (error) {
      console.error('[DraftManager] Failed to save draft:', error);
    }
  }

  /**
   * Draft 불러오기
   */
  static async loadDraft(): Promise<DraftData | null> {
    try {
      const draftJson = await AsyncStorage.getItem(DRAFT_KEY);
      
      if (!draftJson) {
        console.log('[DraftManager] No draft found');
        return null;
      }

      const draft: DraftData = JSON.parse(draftJson);
      console.log('[DraftManager] Draft loaded:', draft);
      
      return draft;
    } catch (error) {
      console.error('[DraftManager] Failed to load draft:', error);
      return null;
    }
  }

  /**
   * Draft 삭제
   */
  static async clearDraft(): Promise<void> {
    try {
      await AsyncStorage.removeItem(DRAFT_KEY);
      console.log('[DraftManager] Draft cleared');
    } catch (error) {
      console.error('[DraftManager] Failed to clear draft:', error);
    }
  }

  /**
   * Draft 존재 여부 확인
   */
  static async hasDraft(): Promise<boolean> {
    try {
      const draft = await AsyncStorage.getItem(DRAFT_KEY);
      return draft !== null;
    } catch (error) {
      console.error('[DraftManager] Failed to check draft:', error);
      return false;
    }
  }

  /**
   * 자동 저장 시작
   */
  static startAutoSave(
    getData: () => Omit<DraftData, 'lastSaved'>,
  ): void {
    // 기존 타이머 정리
    this.stopAutoSave();

    console.log('[DraftManager] Auto-save started');

    this.autoSaveTimer = setInterval(async () => {
      const data = getData();
      
      // 내용이 있을 때만 저장
      if (data.content.trim().length > 0) {
        await this.saveDraft(data);
      }
    }, AUTO_SAVE_INTERVAL);
  }

  /**
   * 자동 저장 중지
   */
  static stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
      console.log('[DraftManager] Auto-save stopped');
    }
  }

  /**
   * Draft가 얼마나 오래되었는지 계산
   */
  static getDraftAge(draft: DraftData): string {
    const lastSaved = new Date(draft.lastSaved);
    const now = new Date();
    const diffMs = now.getTime() - lastSaved.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}일 전`;
    } else if (diffHours > 0) {
      return `${diffHours}시간 전`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}분 전`;
    } else {
      return '방금 전';
    }
  }

  /**
   * Draft 미리보기 텍스트 생성
   */
  static getPreviewText(draft: DraftData, maxLength: number = 50): string {
    const content = draft.content.trim();
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength) + '...';
  }
}
