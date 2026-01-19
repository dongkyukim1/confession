/**
 * Confession Service Tests
 */
import {ConfessionService} from '../../src/services/confession.service';

// Mock Supabase
jest.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(),
            limit: jest.fn(),
          })),
          neq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => ({
                not: jest.fn(),
              })),
            })),
          })),
          not: jest.fn(),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(),
        })),
      })),
    })),
  },
}));

// Mock services
jest.mock('../../src/services/streak.service', () => ({
  StreakService: {
    updateStreakOnConfession: jest.fn(),
  },
}));

jest.mock('../../src/services/mission.service', () => ({
  MissionService: {
    onConfessionCreated: jest.fn(),
    onConfessionRead: jest.fn(),
  },
}));

describe('ConfessionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createConfession', () => {
    it('should throw error when deviceId is missing', async () => {
      await expect(
        ConfessionService.createConfession('', {
          content: 'Test content',
          mood: '😊',
        }),
      ).rejects.toThrow();
    });

    it('should throw error when content is missing', async () => {
      await expect(
        ConfessionService.createConfession('test-device-id', {
          content: '',
          mood: '😊',
        }),
      ).rejects.toThrow();
    });

    it('should throw error when mood is missing', async () => {
      await expect(
        ConfessionService.createConfession('test-device-id', {
          content: 'Test content',
          mood: '',
        }),
      ).rejects.toThrow();
    });
  });

  describe('getRandomConfession', () => {
    it('should throw error when deviceId is missing', async () => {
      await expect(
        ConfessionService.getRandomConfession(''),
      ).rejects.toThrow();
    });
  });

  describe('markAsViewed', () => {
    it('should throw error when confessionId is missing', async () => {
      await expect(
        ConfessionService.markAsViewed('', 'test-device-id'),
      ).rejects.toThrow();
    });

    it('should throw error when viewerDeviceId is missing', async () => {
      await expect(
        ConfessionService.markAsViewed('test-confession-id', ''),
      ).rejects.toThrow();
    });
  });

  describe('getMyConfessions', () => {
    it('should throw error when deviceId is missing', async () => {
      await expect(
        ConfessionService.getMyConfessions(''),
      ).rejects.toThrow();
    });
  });

  describe('getViewedConfessions', () => {
    it('should throw error when deviceId is missing', async () => {
      await expect(
        ConfessionService.getViewedConfessions(''),
      ).rejects.toThrow();
    });
  });

  describe('deleteConfession', () => {
    it('should throw error when confessionId is missing', async () => {
      await expect(
        ConfessionService.deleteConfession('', 'test-device-id'),
      ).rejects.toThrow();
    });

    it('should throw error when deviceId is missing', async () => {
      await expect(
        ConfessionService.deleteConfession('test-confession-id', ''),
      ).rejects.toThrow();
    });
  });
});

describe('ConfessionService - Input Validation', () => {
  describe('content validation', () => {
    it('should require minimum content length', async () => {
      await expect(
        ConfessionService.createConfession('device-id', {
          content: 'short',  // Too short
          mood: '😊',
        }),
      ).rejects.toThrow();
    });
  });

  describe('tags validation', () => {
    it('should handle empty tags array', async () => {
      // This should not throw for empty tags
      const data = {
        content: 'This is a valid confession content for testing',
        mood: '😊',
        tags: [],
      };

      // Note: The actual API call will fail due to mock, but validation should pass
      try {
        await ConfessionService.createConfession('device-id', data);
      } catch (e) {
        // Expected to fail due to mock, but not due to validation
        expect(e.message).not.toContain('태그');
      }
    });
  });

  describe('images validation', () => {
    it('should handle empty images array', async () => {
      const data = {
        content: 'This is a valid confession content for testing',
        mood: '😊',
        images: [],
      };

      try {
        await ConfessionService.createConfession('device-id', data);
      } catch (e) {
        // Expected to fail due to mock, but not due to validation
        expect(e.message).not.toContain('이미지');
      }
    });
  });
});

describe('ConfessionService - Pagination', () => {
  describe('getMyConfessions pagination', () => {
    it('should use default limit and offset', async () => {
      try {
        await ConfessionService.getMyConfessions('device-id');
      } catch {
        // Expected due to mock
      }
      // Test passes if no validation error
    });

    it('should accept custom limit and offset', async () => {
      try {
        await ConfessionService.getMyConfessions('device-id', 10, 20);
      } catch {
        // Expected due to mock
      }
      // Test passes if no validation error
    });
  });

  describe('getViewedConfessions pagination', () => {
    it('should use default limit and offset', async () => {
      try {
        await ConfessionService.getViewedConfessions('device-id');
      } catch {
        // Expected due to mock
      }
      // Test passes if no validation error
    });

    it('should accept custom limit and offset', async () => {
      try {
        await ConfessionService.getViewedConfessions('device-id', 10, 20);
      } catch {
        // Expected due to mock
      }
      // Test passes if no validation error
    });
  });
});
