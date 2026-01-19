/**
 * Zod Validation Schemas Tests
 */
import {
  confessionSchema,
  commentSchema,
  reportSchema,
  validateWithSchema,
  validateField,
  sanitizeText,
  validateConfessionContent,
} from '../../src/validation/schemas';

describe('confessionSchema', () => {
  describe('content validation', () => {
    it('should accept valid content (10-500 chars)', () => {
      const result = confessionSchema.safeParse({
        content: '이것은 유효한 고백 내용입니다. 10자 이상입니다.',
      });
      expect(result.success).toBe(true);
    });

    it('should reject content less than 10 chars', () => {
      const result = confessionSchema.safeParse({
        content: '짧은 내용',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('10자');
      }
    });

    it('should reject content more than 500 chars', () => {
      const longContent = 'a'.repeat(501);
      const result = confessionSchema.safeParse({
        content: longContent,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('500자');
      }
    });

    it('should trim whitespace from content', () => {
      const result = confessionSchema.safeParse({
        content: '   유효한 고백 내용입니다. 앞뒤 공백이 있습니다.   ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.content).not.toMatch(/^\s/);
        expect(result.data.content).not.toMatch(/\s$/);
      }
    });
  });

  describe('tags validation', () => {
    it('should accept valid tags array', () => {
      const result = confessionSchema.safeParse({
        content: '유효한 고백 내용입니다. 태그도 있습니다.',
        tags: ['일상', '고민', '사랑'],
      });
      expect(result.success).toBe(true);
    });

    it('should reject more than 5 tags', () => {
      const result = confessionSchema.safeParse({
        content: '유효한 고백 내용입니다.',
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6'],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('5개');
      }
    });

    it('should reject tags with special characters', () => {
      const result = confessionSchema.safeParse({
        content: '유효한 고백 내용입니다.',
        tags: ['valid', 'invalid@tag'],
      });
      expect(result.success).toBe(false);
    });

    it('should allow null tags', () => {
      const result = confessionSchema.safeParse({
        content: '유효한 고백 내용입니다.',
        tags: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('mood validation', () => {
    it('should accept valid mood emoji', () => {
      const result = confessionSchema.safeParse({
        content: '유효한 고백 내용입니다.',
        mood: '😊',
      });
      expect(result.success).toBe(true);
    });

    it('should allow null mood', () => {
      const result = confessionSchema.safeParse({
        content: '유효한 고백 내용입니다.',
        mood: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('images validation', () => {
    it('should accept valid image URLs', () => {
      const result = confessionSchema.safeParse({
        content: '유효한 고백 내용입니다.',
        images: ['https://example.com/image1.jpg'],
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid URLs', () => {
      const result = confessionSchema.safeParse({
        content: '유효한 고백 내용입니다.',
        images: ['not-a-url'],
      });
      expect(result.success).toBe(false);
    });

    it('should reject more than 3 images', () => {
      const result = confessionSchema.safeParse({
        content: '유효한 고백 내용입니다.',
        images: [
          'https://example.com/1.jpg',
          'https://example.com/2.jpg',
          'https://example.com/3.jpg',
          'https://example.com/4.jpg',
        ],
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('commentSchema', () => {
  it('should accept valid comment', () => {
    const result = commentSchema.safeParse({
      content: '좋은 글이네요!',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty comment', () => {
    const result = commentSchema.safeParse({
      content: '',
    });
    expect(result.success).toBe(false);
  });

  it('should reject comment over 200 chars', () => {
    const result = commentSchema.safeParse({
      content: 'a'.repeat(201),
    });
    expect(result.success).toBe(false);
  });
});

describe('reportSchema', () => {
  it('should accept valid report', () => {
    const result = reportSchema.safeParse({
      confession_id: '123e4567-e89b-12d3-a456-426614174000',
      reason: 'offensive',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid reason', () => {
    const result = reportSchema.safeParse({
      confession_id: '123e4567-e89b-12d3-a456-426614174000',
      reason: 'invalid_reason',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid UUID', () => {
    const result = reportSchema.safeParse({
      confession_id: 'not-a-uuid',
      reason: 'spam',
    });
    expect(result.success).toBe(false);
  });
});

describe('validateWithSchema', () => {
  it('should return success with valid data', () => {
    const result = validateWithSchema(confessionSchema, {
      content: '유효한 고백 내용입니다.',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe('유효한 고백 내용입니다.');
    }
  });

  it('should return errors with invalid data', () => {
    const result = validateWithSchema(confessionSchema, {
      content: '짧음',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });
});

describe('sanitizeText', () => {
  it('should remove HTML tags', () => {
    const result = sanitizeText('<script>alert("xss")</script>hello');
    expect(result).toBe('hello');
  });

  it('should remove javascript: protocol', () => {
    const result = sanitizeText('javascript:alert(1)');
    expect(result).toBe('alert(1)');
  });

  it('should remove event handlers', () => {
    const result = sanitizeText('text onclick=alert(1) more');
    expect(result).toBe('text alert(1) more');
  });

  it('should trim whitespace', () => {
    const result = sanitizeText('  hello world  ');
    expect(result).toBe('hello world');
  });
});

describe('validateConfessionContent', () => {
  it('should return valid for proper content', () => {
    const result = validateConfessionContent('이것은 유효한 고백 내용입니다.');
    expect(result.valid).toBe(true);
  });

  it('should return error for short content', () => {
    const result = validateConfessionContent('짧음');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toBeDefined();
    }
  });
});
