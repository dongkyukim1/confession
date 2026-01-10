/**
 * Draft Manager Utility
 * 고해성사 초안 자동 저장 및 관리
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 초안 데이터 타입
 */
export interface Draft {
  content: string;
  mood?: string;
  tags?: string[];
  images?: string[];
  lastSaved: string;
}

/**
 * AsyncStorage 키
 */
const DRAFT_KEY = '@confession_draft';
const DRAFT_TIMESTAMP_KEY = '@confession_draft_timestamp';

/**
 * Draft Manager Class
 */
class DraftManager {
  private autoSaveTimeout: NodeJS.Timeout | null = null;
  private autoSaveInterval: number = 5000; // 5초마다 자동 저장

  /**
   * 초안 저장
   */
  async saveDraft(draft: Omit<Draft, 'lastSaved'>): Promise<void> {
    try {
      const draftWithTimestamp: Draft = {
        ...draft,
        lastSaved: new Date().toISOString(),
      };

      await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draftWithTimestamp));
      await AsyncStorage.setItem(DRAFT_TIMESTAMP_KEY, draftWithTimestamp.lastSaved);

      console.log('[Draft Manager] Draft saved successfully');
    } catch (error) {
      console.error('[Draft Manager] Failed to save draft:', error);
    }
  }

  /**
   * 초안 불러오기
   */
  async loadDraft(): Promise<Draft | null> {
    try {
      const draftJson = await AsyncStorage.getItem(DRAFT_KEY);

      if (!draftJson) {
        return null;
      }

      const draft: Draft = JSON.parse(draftJson);

      // 24시간 이상 된 초안은 삭제
      const lastSaved = new Date(draft.lastSaved);
      const now = new Date();
      const hoursDiff = (now.getTime() - lastSaved.getTime()) / (1000 * 60 * 60);

      if (hoursDiff > 24) {
        await this.clearDraft();
        return null;
      }

      return draft;
    } catch (error) {
      console.error('[Draft Manager] Failed to load draft:', error);
      return null;
    }
  }

  /**
   * 초안 삭제
   */
  async clearDraft(): Promise<void> {
    try {
      await AsyncStorage.removeItem(DRAFT_KEY);
      await AsyncStorage.removeItem(DRAFT_TIMESTAMP_KEY);
      console.log('[Draft Manager] Draft cleared');
    } catch (error) {
      console.error('[Draft Manager] Failed to clear draft:', error);
    }
  }

  /**
   * 초안 존재 여부 확인
   */
  async hasDraft(): Promise<boolean> {
    try {
      const draft = await this.loadDraft();
      return draft !== null && draft.content.trim().length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * 자동 저장 시작
   */
  startAutoSave(getDraft: () => Omit<Draft, 'lastSaved'>): void {
    this.stopAutoSave();

    this.autoSaveTimeout = setInterval(() => {
      const draft = getDraft();

      // 내용이 있을 때만 저장
      if (draft.content.trim().length > 0) {
        this.saveDraft(draft);
      }
    }, this.autoSaveInterval);

    console.log('[Draft Manager] Auto-save started');
  }

  /**
   * 자동 저장 중지
   */
  stopAutoSave(): void {
    if (this.autoSaveTimeout) {
      clearInterval(this.autoSaveTimeout);
      this.autoSaveTimeout = null;
      console.log('[Draft Manager] Auto-save stopped');
    }
  }

  /**
   * 자동 저장 간격 설정 (밀리초)
   */
  setAutoSaveInterval(intervalMs: number): void {
    this.autoSaveInterval = intervalMs;
  }

  /**
   * 마지막 저장 시간 가져오기
   */
  async getLastSavedTime(): Promise<Date | null> {
    try {
      const timestamp = await AsyncStorage.getItem(DRAFT_TIMESTAMP_KEY);

      if (!timestamp) {
        return null;
      }

      return new Date(timestamp);
    } catch (error) {
      console.error('[Draft Manager] Failed to get last saved time:', error);
      return null;
    }
  }

  /**
   * 초안 크기 가져오기 (문자 수)
   */
  async getDraftSize(): Promise<number> {
    const draft = await this.loadDraft();
    return draft?.content.length || 0;
  }

  /**
   * 초안 유효성 검사
   */
  async isDraftValid(): Promise<boolean> {
    const draft = await this.loadDraft();

    if (!draft) {
      return false;
    }

    // 내용이 비어있지 않고, 최대 길이를 초과하지 않음
    return draft.content.trim().length > 0 && draft.content.length <= 500;
  }

  /**
   * 초안을 백업으로 저장 (제출 전)
   */
  async backupDraft(): Promise<void> {
    try {
      const draft = await this.loadDraft();

      if (draft) {
        const backupKey = `${DRAFT_KEY}_backup_${Date.now()}`;
        await AsyncStorage.setItem(backupKey, JSON.stringify(draft));
        console.log('[Draft Manager] Draft backed up');
      }
    } catch (error) {
      console.error('[Draft Manager] Failed to backup draft:', error);
    }
  }

  /**
   * 오래된 백업 정리 (30일 이상)
   */
  async cleanupOldBackups(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const backupKeys = allKeys.filter(key =>
        key.startsWith(`${DRAFT_KEY}_backup_`),
      );

      const now = Date.now();
      const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;

      for (const key of backupKeys) {
        const timestamp = parseInt(key.split('_').pop() || '0', 10);

        if (now - timestamp > thirtyDaysInMs) {
          await AsyncStorage.removeItem(key);
          console.log(`[Draft Manager] Removed old backup: ${key}`);
        }
      }
    } catch (error) {
      console.error('[Draft Manager] Failed to cleanup old backups:', error);
    }
  }
}

// Singleton instance
export const draftManager = new DraftManager();

/**
 * React Hook: useDraft
 * 컴포넌트에서 초안 관리를 쉽게 사용할 수 있는 훅
 */
export function useDraft() {
  const [draft, setDraft] = React.useState<Draft | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadDraft();
  }, []);

  const loadDraft = async () => {
    setIsLoading(true);
    const loadedDraft = await draftManager.loadDraft();
    setDraft(loadedDraft);
    setIsLoading(false);
  };

  const saveDraft = async (draftData: Omit<Draft, 'lastSaved'>) => {
    await draftManager.saveDraft(draftData);
    await loadDraft();
  };

  const clearDraft = async () => {
    await draftManager.clearDraft();
    setDraft(null);
  };

  const hasDraft = draft !== null && draft.content.trim().length > 0;

  return {
    draft,
    isLoading,
    hasDraft,
    saveDraft,
    clearDraft,
    loadDraft,
  };
}

// React import (TypeScript에서 타입 체크를 위해)
import React from 'react';
