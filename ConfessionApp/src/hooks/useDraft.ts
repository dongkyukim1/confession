/**
 * Draft Hook
 *
 * 임시저장 기능을 위한 React 훅
 */
import {useState, useEffect, useCallback, useRef} from 'react';
import {DraftService, DraftData} from '../services/draft.service';

interface UseDraftResult {
  draft: DraftData | null;
  hasDraft: boolean;
  isLoading: boolean;
  saveDraft: (data: Omit<DraftData, 'savedAt'>) => Promise<void>;
  clearDraft: () => Promise<void>;
  loadDraft: () => Promise<DraftData | null>;
  startAutoSave: (getData: () => Omit<DraftData, 'savedAt'>) => void;
  stopAutoSave: () => void;
}

export function useDraft(): UseDraftResult {
  const [draft, setDraft] = useState<DraftData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const getDataRef = useRef<(() => Omit<DraftData, 'savedAt'>) | null>(null);

  // 초기 로드
  useEffect(() => {
    const initLoadDraft = async () => {
      setIsLoading(true);
      try {
        const savedDraft = await DraftService.getDraft();
        setDraft(savedDraft);
      } finally {
        setIsLoading(false);
      }
    };
    initLoadDraft();
  }, []);

  // 클린업
  useEffect(() => {
    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, []);

  const loadDraft = useCallback(async () => {
    setIsLoading(true);
    try {
      const savedDraft = await DraftService.getDraft();
      setDraft(savedDraft);
      return savedDraft;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveDraft = useCallback(async (data: Omit<DraftData, 'savedAt'>) => {
    await DraftService.saveDraft(data);
    setDraft({
      ...data,
      savedAt: new Date().toISOString(),
    });
  }, []);

  const clearDraft = useCallback(async () => {
    await DraftService.clearDraft();
    setDraft(null);
  }, []);

  const startAutoSave = useCallback(
    (getData: () => Omit<DraftData, 'savedAt'>) => {
      getDataRef.current = getData;

      // 기존 타이머 제거
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }

      // 새 타이머 시작
      autoSaveRef.current = setInterval(async () => {
        if (getDataRef.current) {
          const data = getDataRef.current();
          if (data.content && data.content.trim().length > 0) {
            await DraftService.saveDraft(data);
            console.log('[useDraft] Auto-saved');
          }
        }
      }, DraftService.getAutoSaveInterval());
    },
    [],
  );

  const stopAutoSave = useCallback(() => {
    if (autoSaveRef.current) {
      clearInterval(autoSaveRef.current);
      autoSaveRef.current = null;
    }
    getDataRef.current = null;
  }, []);

  return {
    draft,
    hasDraft: draft !== null && draft.content.trim().length > 0,
    isLoading,
    saveDraft,
    clearDraft,
    loadDraft,
    startAutoSave,
    stopAutoSave,
  };
}
