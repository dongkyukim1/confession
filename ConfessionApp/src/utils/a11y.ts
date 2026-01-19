/**
 * 접근성(Accessibility) 유틸리티
 * 스크린 리더 지원 및 접근성 향상을 위한 헬퍼 함수들
 */
import {AccessibilityInfo, Platform} from 'react-native';

// =====================================================
// 접근성 Props 타입
// =====================================================

export interface A11yProps {
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  accessibilityActions?: AccessibilityAction[];
  onAccessibilityAction?: (event: AccessibilityActionEvent) => void;
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
}

type AccessibilityRole =
  | 'none'
  | 'button'
  | 'link'
  | 'search'
  | 'image'
  | 'keyboardkey'
  | 'text'
  | 'adjustable'
  | 'imagebutton'
  | 'header'
  | 'summary'
  | 'alert'
  | 'checkbox'
  | 'combobox'
  | 'menu'
  | 'menubar'
  | 'menuitem'
  | 'progressbar'
  | 'radio'
  | 'radiogroup'
  | 'scrollbar'
  | 'spinbutton'
  | 'switch'
  | 'tab'
  | 'tablist'
  | 'timer'
  | 'toolbar';

interface AccessibilityState {
  disabled?: boolean;
  selected?: boolean;
  checked?: boolean | 'mixed';
  busy?: boolean;
  expanded?: boolean;
}

interface AccessibilityAction {
  name: string;
  label?: string;
}

interface AccessibilityActionEvent {
  nativeEvent: {
    actionName: string;
  };
}

// =====================================================
// 버튼 접근성 Props
// =====================================================

export function buttonA11y(
  label: string,
  options?: {
    hint?: string;
    disabled?: boolean;
    selected?: boolean;
  },
): A11yProps {
  return {
    accessible: true,
    accessibilityRole: 'button',
    accessibilityLabel: label,
    accessibilityHint: options?.hint,
    accessibilityState: {
      disabled: options?.disabled,
      selected: options?.selected,
    },
  };
}

// =====================================================
// 링크 접근성 Props
// =====================================================

export function linkA11y(
  label: string,
  options?: {
    hint?: string;
  },
): A11yProps {
  return {
    accessible: true,
    accessibilityRole: 'link',
    accessibilityLabel: label,
    accessibilityHint: options?.hint || '탭하면 이동합니다',
  };
}

// =====================================================
// 이미지 접근성 Props
// =====================================================

export function imageA11y(
  label: string,
  options?: {
    isDecorative?: boolean;
  },
): A11yProps {
  if (options?.isDecorative) {
    return {
      accessible: false,
      importantForAccessibility: 'no',
    };
  }
  return {
    accessible: true,
    accessibilityRole: 'image',
    accessibilityLabel: label,
  };
}

// =====================================================
// 체크박스 접근성 Props
// =====================================================

export function checkboxA11y(
  label: string,
  checked: boolean,
  options?: {
    hint?: string;
    disabled?: boolean;
  },
): A11yProps {
  return {
    accessible: true,
    accessibilityRole: 'checkbox',
    accessibilityLabel: label,
    accessibilityHint: options?.hint,
    accessibilityState: {
      checked,
      disabled: options?.disabled,
    },
  };
}

// =====================================================
// 헤더 접근성 Props
// =====================================================

export function headerA11y(label: string): A11yProps {
  return {
    accessible: true,
    accessibilityRole: 'header',
    accessibilityLabel: label,
  };
}

// =====================================================
// 텍스트 입력 접근성 Props
// =====================================================

export function inputA11y(
  label: string,
  options?: {
    hint?: string;
    error?: string;
    required?: boolean;
  },
): A11yProps {
  let accessibilityLabel = label;
  if (options?.required) {
    accessibilityLabel += ', 필수 입력';
  }
  if (options?.error) {
    accessibilityLabel += `, 오류: ${options.error}`;
  }

  return {
    accessible: true,
    accessibilityLabel,
    accessibilityHint: options?.hint || '텍스트를 입력하세요',
  };
}

// =====================================================
// 알림/토스트 접근성 Props
// =====================================================

export function alertA11y(
  message: string,
  options?: {
    isError?: boolean;
    isSuccess?: boolean;
  },
): A11yProps {
  let label = message;
  if (options?.isError) {
    label = `오류: ${message}`;
  } else if (options?.isSuccess) {
    label = `성공: ${message}`;
  }

  return {
    accessible: true,
    accessibilityRole: 'alert',
    accessibilityLabel: label,
    accessibilityLiveRegion: 'assertive',
  };
}

// =====================================================
// 탭 접근성 Props
// =====================================================

export function tabA11y(
  label: string,
  index: number,
  total: number,
  selected: boolean,
): A11yProps {
  return {
    accessible: true,
    accessibilityRole: 'tab',
    accessibilityLabel: `${label}, 탭 ${index + 1}/${total}`,
    accessibilityState: {selected},
    accessibilityHint: selected ? undefined : '탭하면 선택됩니다',
  };
}

// =====================================================
// 진행 상태 접근성 Props
// =====================================================

export function progressA11y(
  label: string,
  value: number,
  max: number = 100,
): A11yProps {
  const percentage = Math.round((value / max) * 100);
  return {
    accessible: true,
    accessibilityRole: 'progressbar',
    accessibilityLabel: `${label}, ${percentage}% 완료`,
    accessibilityState: {busy: percentage < 100},
  };
}

// =====================================================
// 스크린 리더 상태 확인
// =====================================================

export async function isScreenReaderEnabled(): Promise<boolean> {
  return await AccessibilityInfo.isScreenReaderEnabled();
}

// =====================================================
// 스크린 리더에 메시지 전달
// =====================================================

export function announceForAccessibility(message: string): void {
  AccessibilityInfo.announceForAccessibility(message);
}

// =====================================================
// 포커스 이동
// =====================================================

export function setAccessibilityFocus(nodeHandle: number | null): void {
  if (nodeHandle) {
    AccessibilityInfo.setAccessibilityFocus(nodeHandle);
  }
}

// =====================================================
// 접근성 라벨 생성 헬퍼
// =====================================================

/**
 * 카드 아이템용 접근성 라벨 생성
 */
export function cardA11yLabel(
  title: string,
  options?: {
    date?: string;
    count?: number;
    status?: string;
  },
): string {
  const parts = [title];
  if (options?.date) {
    parts.push(options.date);
  }
  if (options?.count !== undefined) {
    parts.push(`${options.count}개`);
  }
  if (options?.status) {
    parts.push(options.status);
  }
  return parts.join(', ');
}

/**
 * 고백 카드용 접근성 라벨 생성
 */
export function confessionA11yLabel(
  content: string,
  options?: {
    mood?: string;
    likes?: number;
    dislikes?: number;
    date?: string;
  },
): string {
  const parts = [];

  // 내용 (너무 길면 축약)
  const truncatedContent =
    content.length > 100 ? content.substring(0, 100) + '...' : content;
  parts.push(`고백: ${truncatedContent}`);

  if (options?.mood) {
    parts.push(`기분: ${options.mood}`);
  }
  if (options?.likes !== undefined) {
    parts.push(`좋아요 ${options.likes}개`);
  }
  if (options?.dislikes !== undefined) {
    parts.push(`싫어요 ${options.dislikes}개`);
  }
  if (options?.date) {
    parts.push(options.date);
  }

  return parts.join(', ');
}

/**
 * 시간 관련 접근성 라벨 생성
 */
export function timeA11yLabel(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return '방금 전';
  } else if (diffMins < 60) {
    return `${diffMins}분 전`;
  } else if (diffHours < 24) {
    return `${diffHours}시간 전`;
  } else if (diffDays < 7) {
    return `${diffDays}일 전`;
  } else {
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}

// =====================================================
// 플랫폼별 접근성 설정
// =====================================================

export function platformA11y(): Partial<A11yProps> {
  if (Platform.OS === 'android') {
    return {
      importantForAccessibility: 'yes',
    };
  }
  return {};
}
