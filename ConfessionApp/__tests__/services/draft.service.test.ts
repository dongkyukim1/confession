/**
 * Draft Service Tests
 */
import {DraftService, DraftData} from '../../src/services/draft.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('DraftService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveDraft', () => {
    it('should save draft data to AsyncStorage', async () => {
      const draftData = {
        content: 'Test content',
        mood: '😊',
        tags: ['test'],
      };

      await DraftService.saveDraft(draftData);

      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'confession_draft',
        expect.any(String),
      );

      const savedData = JSON.parse(
        (AsyncStorage.setItem as jest.Mock).mock.calls[0][1],
      );
      expect(savedData.content).toBe('Test content');
      expect(savedData.mood).toBe('😊');
      expect(savedData.savedAt).toBeDefined();
    });

    it('should not save empty content', async () => {
      await DraftService.saveDraft({content: ''});
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should not save whitespace only content', async () => {
      await DraftService.saveDraft({content: '   '});
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('getDraft', () => {
    it('should return null if no draft exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await DraftService.getDraft();
      expect(result).toBeNull();
    });

    it('should return draft data if exists', async () => {
      const mockDraft: DraftData = {
        content: 'Saved content',
        mood: '😢',
        savedAt: new Date().toISOString(),
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockDraft),
      );

      const result = await DraftService.getDraft();
      expect(result).not.toBeNull();
      expect(result?.content).toBe('Saved content');
    });

    it('should return null for expired drafts (>24h)', async () => {
      const expiredDate = new Date();
      expiredDate.setHours(expiredDate.getHours() - 25);

      const mockDraft: DraftData = {
        content: 'Old content',
        savedAt: expiredDate.toISOString(),
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockDraft),
      );

      const result = await DraftService.getDraft();
      expect(result).toBeNull();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('confession_draft');
    });
  });

  describe('clearDraft', () => {
    it('should remove draft from AsyncStorage', async () => {
      await DraftService.clearDraft();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('confession_draft');
    });
  });

  describe('hasDraft', () => {
    it('should return true if draft with content exists', async () => {
      const mockDraft: DraftData = {
        content: 'Some content',
        savedAt: new Date().toISOString(),
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockDraft),
      );

      const result = await DraftService.hasDraft();
      expect(result).toBe(true);
    });

    it('should return false if no draft exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await DraftService.hasDraft();
      expect(result).toBe(false);
    });
  });

  describe('formatSavedTime', () => {
    it('should return "방금 전" for very recent times', () => {
      const now = new Date().toISOString();
      const result = DraftService.formatSavedTime(now);
      expect(result).toBe('방금 전');
    });

    it('should return minutes for times less than an hour ago', () => {
      const thirtyMinsAgo = new Date();
      thirtyMinsAgo.setMinutes(thirtyMinsAgo.getMinutes() - 30);
      const result = DraftService.formatSavedTime(thirtyMinsAgo.toISOString());
      expect(result).toBe('30분 전');
    });

    it('should return hours for times less than a day ago', () => {
      const fiveHoursAgo = new Date();
      fiveHoursAgo.setHours(fiveHoursAgo.getHours() - 5);
      const result = DraftService.formatSavedTime(fiveHoursAgo.toISOString());
      expect(result).toBe('5시간 전');
    });
  });

  describe('getAutoSaveInterval', () => {
    it('should return 30 seconds', () => {
      const interval = DraftService.getAutoSaveInterval();
      expect(interval).toBe(30000);
    });
  });
});
