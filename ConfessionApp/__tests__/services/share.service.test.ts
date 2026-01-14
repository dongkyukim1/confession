/**
 * Share Service Tests
 */
import {Share} from 'react-native';
import {ShareService} from '../../src/services/share.service';
import {Confession} from '../../src/types';

// Mock Share
jest.mock('react-native', () => ({
  Share: {
    share: jest.fn(),
    sharedAction: 'sharedAction',
    dismissedAction: 'dismissedAction',
  },
  Platform: {
    OS: 'ios',
  },
}));

describe('ShareService', () => {
  const mockConfession: Confession = {
    id: 'test-id',
    device_id: 'device-123',
    content: 'This is a test confession content for sharing.',
    mood: '😊',
    tags: ['test', 'sharing'],
    images: [],
    created_at: '2025-01-01T12:00:00Z',
    view_count: 10,
    like_count: 5,
    dislike_count: 1,
    report_count: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('shareConfession', () => {
    it('should call Share.share with correct message', async () => {
      (Share.share as jest.Mock).mockResolvedValue({
        action: Share.sharedAction,
      });

      await ShareService.shareConfession({confession: mockConfession});

      expect(Share.share).toHaveBeenCalledTimes(1);
      expect(Share.share).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
          title: '고백일기에서 공유',
        }),
        expect.objectContaining({
          dialogTitle: '공유하기',
          subject: '고백일기에서 공유',
        }),
      );
    });

    it('should return success with shared action', async () => {
      (Share.share as jest.Mock).mockResolvedValue({
        action: Share.sharedAction,
      });

      const result = await ShareService.shareConfession({
        confession: mockConfession,
      });

      expect(result.success).toBe(true);
      expect(result.action).toBe('shared');
    });

    it('should return success with dismissed action', async () => {
      (Share.share as jest.Mock).mockResolvedValue({
        action: Share.dismissedAction,
      });

      const result = await ShareService.shareConfession({
        confession: mockConfession,
      });

      expect(result.success).toBe(true);
      expect(result.action).toBe('dismissed');
    });

    it('should handle share error', async () => {
      (Share.share as jest.Mock).mockRejectedValue(new Error('Share failed'));

      const result = await ShareService.shareConfession({
        confession: mockConfession,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Share failed');
    });

    it('should include mood emoji in share text', async () => {
      (Share.share as jest.Mock).mockResolvedValue({
        action: Share.sharedAction,
      });

      await ShareService.shareConfession({confession: mockConfession});

      const shareCall = (Share.share as jest.Mock).mock.calls[0][0];
      expect(shareCall.message).toContain('😊');
    });

    it('should include tags in share text', async () => {
      (Share.share as jest.Mock).mockResolvedValue({
        action: Share.sharedAction,
      });

      await ShareService.shareConfession({confession: mockConfession});

      const shareCall = (Share.share as jest.Mock).mock.calls[0][0];
      expect(shareCall.message).toContain('#test');
      expect(shareCall.message).toContain('#sharing');
    });

    it('should truncate long content', async () => {
      const longConfession = {
        ...mockConfession,
        content: 'A'.repeat(300),
      };
      (Share.share as jest.Mock).mockResolvedValue({
        action: Share.sharedAction,
      });

      await ShareService.shareConfession({confession: longConfession});

      const shareCall = (Share.share as jest.Mock).mock.calls[0][0];
      expect(shareCall.message).toContain('...');
    });
  });

  describe('getDeepLink', () => {
    it('should return correct deep link format', () => {
      const link = ShareService.getDeepLink('test-123');
      expect(link).toBe('confession://view/test-123');
    });
  });

  describe('getWebLink', () => {
    it('should return correct web link format', () => {
      const link = ShareService.getWebLink('test-123');
      expect(link).toContain('confession/test-123');
    });
  });

  describe('canShare', () => {
    it('should return true for iOS', () => {
      expect(ShareService.canShare()).toBe(true);
    });
  });
});
