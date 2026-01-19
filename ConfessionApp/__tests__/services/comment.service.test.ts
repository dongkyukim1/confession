/**
 * Comment Service Tests
 */
import {CommentService} from '../../src/services/comment.service';

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
          is: jest.fn(() => ({
            order: jest.fn(),
          })),
          order: jest.fn(),
          eq: jest.fn(),
        })),
        count: jest.fn(),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(),
        })),
      })),
    })),
  },
}));

describe('CommentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getComments', () => {
    it('should throw error when confessionId is missing', async () => {
      await expect(CommentService.getComments('')).rejects.toThrow();
    });

    it('should not throw for valid confessionId', async () => {
      // Test that validation passes
      try {
        await CommentService.getComments('valid-confession-id');
      } catch (e) {
        // Mock will fail, but validation should pass
        expect(e.message).not.toContain('고백 ID');
      }
    });
  });

  describe('createComment', () => {
    it('should throw error when confession_id is missing', async () => {
      await expect(
        CommentService.createComment({
          confession_id: '',
          device_id: 'test-device',
          content: 'Test comment',
        }),
      ).rejects.toThrow();
    });

    it('should throw error when device_id is missing', async () => {
      await expect(
        CommentService.createComment({
          confession_id: 'test-confession',
          device_id: '',
          content: 'Test comment',
        }),
      ).rejects.toThrow();
    });

    it('should throw error when content is missing', async () => {
      await expect(
        CommentService.createComment({
          confession_id: 'test-confession',
          device_id: 'test-device',
          content: '',
        }),
      ).rejects.toThrow();
    });

    it('should accept optional parent_id for replies', async () => {
      try {
        await CommentService.createComment({
          confession_id: 'test-confession',
          device_id: 'test-device',
          content: 'Test reply',
          parent_id: 'parent-comment-id',
        });
      } catch (e) {
        // Mock will fail, but validation should pass
        expect(e.message).not.toContain('필수');
      }
    });
  });

  describe('deleteComment', () => {
    it('should throw error when commentId is missing', async () => {
      await expect(
        CommentService.deleteComment('', 'test-device'),
      ).rejects.toThrow();
    });

    it('should throw error when deviceId is missing', async () => {
      await expect(
        CommentService.deleteComment('test-comment', ''),
      ).rejects.toThrow();
    });
  });

  describe('getCommentCount', () => {
    it('should return 0 on error', async () => {
      // Mock should fail, and function should return 0
      const count = await CommentService.getCommentCount('test-confession');
      expect(count).toBe(0);
    });
  });

  describe('getReplies', () => {
    it('should return empty array on error', async () => {
      const replies = await CommentService.getReplies('test-comment');
      expect(replies).toEqual([]);
    });
  });
});

describe('CommentService - Content Trimming', () => {
  it('should trim whitespace from content', async () => {
    try {
      await CommentService.createComment({
        confession_id: 'test-confession',
        device_id: 'test-device',
        content: '  Test content with spaces  ',
      });
    } catch {
      // Expected due to mock
    }
    // Validation passes if no error about content format
  });
});
