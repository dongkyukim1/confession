/**
 * useConfessionForm - 고백 작성 폼 관리 훅
 *
 * react-hook-form과 Zod를 사용한 폼 상태 및 검증 관리
 * 설치 필요: npm install react-hook-form @hookform/resolvers
 */
import {useState, useCallback, useMemo} from 'react';
import {
  confessionSchema,
  sanitizeConfession,
  validateConfessionContent,
  type ConfessionInput,
} from '../validation/schemas';

// react-hook-form이 설치되어 있는지 확인
let useForm: any = null;
let zodResolver: any = null;

try {
  const hookForm = require('react-hook-form');
  const resolvers = require('@hookform/resolvers/zod');
  useForm = hookForm.useForm;
  zodResolver = resolvers.zodResolver;
} catch {
  console.log(
    '[useConfessionForm] react-hook-form not installed, using fallback',
  );
}

// =====================================================
// 타입 정의
// =====================================================

export interface ConfessionFormData {
  content: string;
  mood: string | null;
  tags: string[];
  images: string[];
}

export interface ConfessionFormState {
  // 폼 데이터
  data: ConfessionFormData;
  // 에러 상태
  errors: Partial<Record<keyof ConfessionFormData, string>>;
  // 터치 상태
  touched: Partial<Record<keyof ConfessionFormData, boolean>>;
  // 유효성
  isValid: boolean;
  isDirty: boolean;
}

interface UseConfessionFormReturn {
  // 상태
  formState: ConfessionFormState;

  // 값 설정
  setContent: (content: string) => void;
  setMood: (mood: string | null) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  setTags: (tags: string[]) => void;
  addImage: (imageUri: string) => void;
  removeImage: (imageUri: string) => void;
  setImages: (images: string[]) => void;

  // 검증
  validateField: (field: keyof ConfessionFormData) => string | null;
  validateAll: () => boolean;

  // 제출
  getSubmitData: () => ConfessionInput | null;
  reset: () => void;

  // 컨텐츠 길이 정보
  contentLength: number;
  contentMaxLength: number;
  contentRemaining: number;
}

// =====================================================
// 기본값
// =====================================================

const DEFAULT_FORM_DATA: ConfessionFormData = {
  content: '',
  mood: null,
  tags: [],
  images: [],
};

const CONTENT_MAX_LENGTH = 500;
const CONTENT_MIN_LENGTH = 10;
const MAX_TAGS = 5;
const MAX_IMAGES = 3;

// =====================================================
// Fallback 훅 (react-hook-form 미설치시)
// =====================================================

function useConfessionFormFallback(): UseConfessionFormReturn {
  const [data, setData] = useState<ConfessionFormData>(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ConfessionFormData, string>>
  >({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof ConfessionFormData, boolean>>
  >({});

  // 콘텐츠 설정
  const setContent = useCallback((content: string) => {
    setData(prev => ({...prev, content}));
    setTouched(prev => ({...prev, content: true}));

    // 실시간 검증
    const validation = validateConfessionContent(content);
    if (!validation.valid) {
      setErrors(prev => ({...prev, content: validation.error}));
    } else {
      setErrors(prev => ({...prev, content: undefined}));
    }
  }, []);

  // 기분 설정
  const setMood = useCallback((mood: string | null) => {
    setData(prev => ({...prev, mood}));
  }, []);

  // 태그 추가
  const addTag = useCallback((tag: string) => {
    setData(prev => {
      if (prev.tags.length >= MAX_TAGS) {
        setErrors(e => ({...e, tags: `태그는 최대 ${MAX_TAGS}개까지 가능합니다`}));
        return prev;
      }
      if (prev.tags.includes(tag)) {
        return prev;
      }
      setErrors(e => ({...e, tags: undefined}));
      return {...prev, tags: [...prev.tags, tag]};
    });
  }, []);

  // 태그 제거
  const removeTag = useCallback((tag: string) => {
    setData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
    setErrors(prev => ({...prev, tags: undefined}));
  }, []);

  // 태그 일괄 설정
  const setTags = useCallback((tags: string[]) => {
    if (tags.length > MAX_TAGS) {
      setErrors(e => ({...e, tags: `태그는 최대 ${MAX_TAGS}개까지 가능합니다`}));
      return;
    }
    setData(prev => ({...prev, tags}));
    setErrors(prev => ({...prev, tags: undefined}));
  }, []);

  // 이미지 추가
  const addImage = useCallback((imageUri: string) => {
    setData(prev => {
      if (prev.images.length >= MAX_IMAGES) {
        setErrors(e => ({
          ...e,
          images: `이미지는 최대 ${MAX_IMAGES}개까지 가능합니다`,
        }));
        return prev;
      }
      setErrors(e => ({...e, images: undefined}));
      return {...prev, images: [...prev.images, imageUri]};
    });
  }, []);

  // 이미지 제거
  const removeImage = useCallback((imageUri: string) => {
    setData(prev => ({
      ...prev,
      images: prev.images.filter(i => i !== imageUri),
    }));
    setErrors(prev => ({...prev, images: undefined}));
  }, []);

  // 이미지 일괄 설정
  const setImages = useCallback((images: string[]) => {
    if (images.length > MAX_IMAGES) {
      setErrors(e => ({
        ...e,
        images: `이미지는 최대 ${MAX_IMAGES}개까지 가능합니다`,
      }));
      return;
    }
    setData(prev => ({...prev, images}));
    setErrors(prev => ({...prev, images: undefined}));
  }, []);

  // 필드 검증
  const validateField = useCallback(
    (field: keyof ConfessionFormData): string | null => {
      if (field === 'content') {
        const validation = validateConfessionContent(data.content);
        const error = validation.valid ? null : validation.error;
        setErrors(prev => ({...prev, content: error || undefined}));
        return error;
      }
      return null;
    },
    [data.content],
  );

  // 전체 검증
  const validateAll = useCallback((): boolean => {
    const result = confessionSchema.safeParse({
      content: data.content,
      mood: data.mood,
      tags: data.tags,
      images: data.images,
    });

    if (!result.success) {
      const newErrors: Partial<Record<keyof ConfessionFormData, string>> = {};
      result.error.errors.forEach(err => {
        const field = err.path[0] as keyof ConfessionFormData;
        if (!newErrors[field]) {
          newErrors[field] = err.message;
        }
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  }, [data]);

  // 제출용 데이터 반환
  const getSubmitData = useCallback((): ConfessionInput | null => {
    if (!validateAll()) {
      return null;
    }

    const sanitized = sanitizeConfession({
      content: data.content,
      mood: data.mood,
      tags: data.tags.length > 0 ? data.tags : undefined,
      images: data.images.length > 0 ? data.images : undefined,
    });

    return sanitized;
  }, [data, validateAll]);

  // 폼 초기화
  const reset = useCallback(() => {
    setData(DEFAULT_FORM_DATA);
    setErrors({});
    setTouched({});
  }, []);

  // 유효성 상태
  const isValid = useMemo(() => {
    return (
      data.content.length >= CONTENT_MIN_LENGTH &&
      data.content.length <= CONTENT_MAX_LENGTH &&
      Object.values(errors).every(e => !e)
    );
  }, [data.content, errors]);

  // dirty 상태
  const isDirty = useMemo(() => {
    return (
      data.content !== DEFAULT_FORM_DATA.content ||
      data.mood !== DEFAULT_FORM_DATA.mood ||
      data.tags.length > 0 ||
      data.images.length > 0
    );
  }, [data]);

  // 콘텐츠 길이 정보
  const contentLength = data.content.length;
  const contentMaxLength = CONTENT_MAX_LENGTH;
  const contentRemaining = CONTENT_MAX_LENGTH - contentLength;

  return {
    formState: {
      data,
      errors,
      touched,
      isValid,
      isDirty,
    },
    setContent,
    setMood,
    addTag,
    removeTag,
    setTags,
    addImage,
    removeImage,
    setImages,
    validateField,
    validateAll,
    getSubmitData,
    reset,
    contentLength,
    contentMaxLength,
    contentRemaining,
  };
}

// =====================================================
// 메인 훅
// =====================================================

export function useConfessionForm(): UseConfessionFormReturn {
  // react-hook-form이 없으면 fallback 사용
  if (!useForm || !zodResolver) {
    return useConfessionFormFallback();
  }

  // react-hook-form 버전 (설치된 경우)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const form = useForm<ConfessionInput>({
    resolver: zodResolver(confessionSchema),
    defaultValues: {
      content: '',
      mood: null,
      tags: [],
      images: [],
    },
    mode: 'onChange',
  });

  const {
    watch,
    setValue,
    formState: {errors, touchedFields, isValid, isDirty},
    trigger,
    reset: formReset,
  } = form;

  const content = watch('content') || '';
  const mood = watch('mood');
  const tags = watch('tags') || [];
  const images = watch('images') || [];

  // 콘텐츠 설정
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const setContent = useCallback(
    (value: string) => {
      setValue('content', value, {shouldValidate: true, shouldTouch: true});
    },
    [setValue],
  );

  // 기분 설정
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const setMood = useCallback(
    (value: string | null) => {
      setValue('mood', value);
    },
    [setValue],
  );

  // 태그 추가
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const addTag = useCallback(
    (tag: string) => {
      if (tags.length < MAX_TAGS && !tags.includes(tag)) {
        setValue('tags', [...tags, tag], {shouldValidate: true});
      }
    },
    [tags, setValue],
  );

  // 태그 제거
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const removeTag = useCallback(
    (tag: string) => {
      setValue('tags', tags.filter((t: string) => t !== tag), {shouldValidate: true});
    },
    [tags, setValue],
  );

  // 태그 일괄 설정
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const setTags = useCallback(
    (newTags: string[]) => {
      setValue('tags', newTags.slice(0, MAX_TAGS), {shouldValidate: true});
    },
    [setValue],
  );

  // 이미지 추가
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const addImage = useCallback(
    (imageUri: string) => {
      if (images.length < MAX_IMAGES) {
        setValue('images', [...images, imageUri], {shouldValidate: true});
      }
    },
    [images, setValue],
  );

  // 이미지 제거
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const removeImage = useCallback(
    (imageUri: string) => {
      setValue('images', images.filter((i: string) => i !== imageUri), {
        shouldValidate: true,
      });
    },
    [images, setValue],
  );

  // 이미지 일괄 설정
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const setImages = useCallback(
    (newImages: string[]) => {
      setValue('images', newImages.slice(0, MAX_IMAGES), {shouldValidate: true});
    },
    [setValue],
  );

  // 필드 검증
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const validateField = useCallback(
    (field: keyof ConfessionFormData): string | null => {
      trigger(field as any);
      return errors[field as keyof typeof errors]?.message || null;
    },
    [trigger, errors],
  );

  // 전체 검증
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const validateAll = useCallback((): boolean => {
    trigger();
    return isValid;
  }, [trigger, isValid]);

  // 제출용 데이터 반환
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const getSubmitData = useCallback((): ConfessionInput | null => {
    if (!isValid) {
      trigger();
      return null;
    }

    return sanitizeConfession({
      content,
      mood,
      tags: tags.length > 0 ? tags : undefined,
      images: images.length > 0 ? images : undefined,
    });
  }, [isValid, content, mood, tags, images, trigger]);

  // 폼 초기화
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const reset = useCallback(() => {
    formReset();
  }, [formReset]);

  // 에러 변환
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const formattedErrors = useMemo(() => {
    const result: Partial<Record<keyof ConfessionFormData, string>> = {};
    if (errors.content) result.content = errors.content.message;
    if (errors.mood) result.mood = errors.mood.message;
    if (errors.tags) result.tags = (errors.tags as any)?.message;
    if (errors.images) result.images = (errors.images as any)?.message;
    return result;
  }, [errors]);

  // touched 변환
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const formattedTouched = useMemo(() => {
    return touchedFields as Partial<Record<keyof ConfessionFormData, boolean>>;
  }, [touchedFields]);

  return {
    formState: {
      data: {content, mood: mood || null, tags, images},
      errors: formattedErrors,
      touched: formattedTouched,
      isValid,
      isDirty,
    },
    setContent,
    setMood,
    addTag,
    removeTag,
    setTags,
    addImage,
    removeImage,
    setImages,
    validateField,
    validateAll,
    getSubmitData,
    reset,
    contentLength: content.length,
    contentMaxLength: CONTENT_MAX_LENGTH,
    contentRemaining: CONTENT_MAX_LENGTH - content.length,
  };
}

export default useConfessionForm;
