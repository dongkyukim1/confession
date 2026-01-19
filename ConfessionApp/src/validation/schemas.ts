/**
 * Zod 검증 스키마
 * 클라이언트 측 입력 검증을 위한 스키마 정의
 */
import {z} from 'zod';

// =====================================================
// 고백(Confession) 스키마
// =====================================================

export const confessionSchema = z.object({
  content: z
    .string()
    .min(10, '고백은 최소 10자 이상이어야 합니다')
    .max(500, '고백은 500자를 초과할 수 없습니다')
    .trim(),
  mood: z
    .string()
    .max(10, '기분 이모지는 10자를 초과할 수 없습니다')
    .optional()
    .nullable(),
  tags: z
    .array(
      z
        .string()
        .min(1, '태그는 비어있을 수 없습니다')
        .max(20, '태그는 20자를 초과할 수 없습니다')
        .regex(/^[가-힣a-zA-Z0-9_]+$/, '태그에는 특수문자를 사용할 수 없습니다'),
    )
    .max(5, '태그는 최대 5개까지 가능합니다')
    .optional()
    .nullable(),
  images: z
    .array(z.string().url('유효한 이미지 URL이 아닙니다'))
    .max(3, '이미지는 최대 3개까지 가능합니다')
    .optional()
    .nullable(),
});

export type ConfessionInput = z.infer<typeof confessionSchema>;

// =====================================================
// 댓글(Comment) 스키마
// =====================================================

export const commentSchema = z.object({
  content: z
    .string()
    .min(1, '댓글을 입력해주세요')
    .max(200, '댓글은 200자를 초과할 수 없습니다')
    .trim(),
  parent_id: z.string().uuid().optional().nullable(),
});

export type CommentInput = z.infer<typeof commentSchema>;

// =====================================================
// 신고(Report) 스키마
// =====================================================

export const reportReasonSchema = z.enum([
  'offensive',
  'sexual',
  'spam',
  'violence',
  'other',
]);

export const reportSchema = z.object({
  confession_id: z.string().uuid('유효한 고백 ID가 아닙니다'),
  reason: reportReasonSchema,
  description: z
    .string()
    .max(500, '상세 설명은 500자를 초과할 수 없습니다')
    .optional()
    .nullable(),
});

export type ReportInput = z.infer<typeof reportSchema>;

// =====================================================
// 좋아요(Like) 스키마
// =====================================================

export const likeTypeSchema = z.enum(['like', 'dislike']);

export const likeSchema = z.object({
  confession_id: z.string().uuid('유효한 고백 ID가 아닙니다'),
  like_type: likeTypeSchema,
});

export type LikeInput = z.infer<typeof likeSchema>;

// =====================================================
// 프로필/설정 스키마
// =====================================================

export const userSettingsSchema = z.object({
  theme: z
    .enum(['light', 'dark', 'ocean', 'sunset', 'forest', 'purple', 'system'])
    .default('system'),
  fontSize: z.enum(['small', 'medium', 'large']).default('medium'),
  notifications: z.boolean().default(true),
  language: z.enum(['ko', 'en']).default('ko'),
});

export type UserSettings = z.infer<typeof userSettingsSchema>;

// =====================================================
// Device ID 스키마
// =====================================================

export const deviceIdSchema = z
  .string()
  .uuid('유효한 디바이스 ID가 아닙니다')
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    'UUID v4 형식이어야 합니다',
  );

// =====================================================
// 검증 헬퍼 함수
// =====================================================

/**
 * 스키마로 데이터 검증 및 에러 메시지 반환
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): {success: true; data: T} | {success: false; errors: string[]} {
  const result = schema.safeParse(data);

  if (result.success) {
    return {success: true, data: result.data};
  }

  const errors = result.error.errors.map(err => {
    const path = err.path.join('.');
    return path ? `${path}: ${err.message}` : err.message;
  });

  return {success: false, errors};
}

/**
 * 단일 필드 검증
 */
export function validateField<T>(
  schema: z.ZodSchema<T>,
  value: unknown,
): string | null {
  const result = schema.safeParse(value);
  if (result.success) {
    return null;
  }
  return result.error.errors[0]?.message || '유효하지 않은 값입니다';
}

// =====================================================
// XSS 방지 유틸리티
// =====================================================

/**
 * HTML 태그 및 스크립트 제거
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // HTML 태그 제거
    .replace(/javascript:/gi, '') // javascript: 프로토콜 제거
    .replace(/on\w+=/gi, '') // 이벤트 핸들러 제거
    .trim();
}

/**
 * 고백 내용 검증 및 정제
 */
export function sanitizeConfession(input: ConfessionInput): ConfessionInput {
  return {
    ...input,
    content: sanitizeText(input.content),
    tags: input.tags?.map(tag => sanitizeText(tag)),
  };
}

// =====================================================
// 콘텐츠 필터링 (욕설/비방 필터)
// =====================================================

// 기본적인 금지어 목록 (확장 필요)
const BANNED_WORDS: string[] = [
  // 실제 금지어 목록은 별도 파일로 관리하거나 서버에서 가져오는 것이 좋음
];

/**
 * 금지어 포함 여부 확인
 */
export function containsBannedWords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return BANNED_WORDS.some(word => lowerText.includes(word.toLowerCase()));
}

/**
 * 콘텐츠 검증 (스키마 + 금지어)
 */
export function validateConfessionContent(
  content: string,
): {valid: true} | {valid: false; error: string} {
  // 스키마 검증
  const schemaResult = confessionSchema.shape.content.safeParse(content);
  if (!schemaResult.success) {
    return {
      valid: false,
      error: schemaResult.error.errors[0]?.message || '유효하지 않은 내용입니다',
    };
  }

  // 금지어 검증
  if (containsBannedWords(content)) {
    return {valid: false, error: '부적절한 내용이 포함되어 있습니다'};
  }

  return {valid: true};
}
