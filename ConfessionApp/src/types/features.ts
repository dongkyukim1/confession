/**
 * Feature-specific type definitions
 */

// Tags/Categories
export interface Tag {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export const PREDEFINED_TAGS: Tag[] = [
  {id: 'happy', name: '행복', icon: '😊', color: '#22c55e'},
  {id: 'sad', name: '슬픔', icon: '😢', color: '#3b82f6'},
  {id: 'angry', name: '화남', icon: '😠', color: '#ef4444'},
  {id: 'anxious', name: '불안', icon: '😰', color: '#f59e0b'},
  {id: 'grateful', name: '감사', icon: '🙏', color: '#8b5cf6'},
  {id: 'excited', name: '신남', icon: '🎉', color: '#ec4899'},
  {id: 'tired', name: '피곤', icon: '😴', color: '#64748b'},
  {id: 'loved', name: '사랑', icon: '❤️', color: '#f43f5e'},
  {id: 'work', name: '일', icon: '💼', color: '#0ea5e9'},
  {id: 'family', name: '가족', icon: '👨‍👩‍👧‍👦', color: '#14b8a6'},
  {id: 'friends', name: '친구', icon: '👥', color: '#a855f7'},
  {id: 'hobby', name: '취미', icon: '🎨', color: '#f97316'},
  {id: 'health', name: '건강', icon: '💪', color: '#10b981'},
  {id: 'travel', name: '여행', icon: '✈️', color: '#06b6d4'},
  {id: 'food', name: '음식', icon: '🍽️', color: '#eab308'},
  {id: 'achievement', name: '성취', icon: '🏆', color: '#fbbf24'},
];

// Reactions/Emotions
export interface Reaction {
  id: string;
  emoji: string;
  name: string;
}

export const REACTIONS: Reaction[] = [
  {id: 'heart', emoji: '❤️', name: '공감'},
  {id: 'hug', emoji: '🤗', name: '위로'},
  {id: 'clap', emoji: '👏', name: '응원'},
  {id: 'laugh', emoji: '😂', name: '웃김'},
  {id: 'sad', emoji: '😢', name: '슬픔'},
  {id: 'wow', emoji: '😮', name: '놀람'},
];

// Diary Entry with enhanced fields
export interface DiaryEntry {
  id: string;
  content: string;
  created_at: string;
  device_id: string;
  view_count: number;
  tags?: string[];
  mood?: string;
  word_count?: number;
  reactions?: Record<string, number>;
}

// Statistics
export interface UserStatistics {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  totalWords: number;
  averageWordsPerEntry: number;
  mostUsedTags: {tag: string; count: number}[];
  moodDistribution: Record<string, number>;
  entriesByDayOfWeek: number[];
  entriesByHour: number[];
}

// Daily prompt
export interface DailyPrompt {
  id: string;
  text: string;
  category: string;
  date: string;
}

export const DAILY_PROMPTS: DailyPrompt[] = [
  {
    id: '1',
    text: '오늘 가장 기억에 남는 순간은 무엇이었나요?',
    category: 'reflection',
    date: new Date().toISOString(),
  },
  {
    id: '2',
    text: '오늘 감사한 일 세 가지를 적어보세요.',
    category: 'gratitude',
    date: new Date().toISOString(),
  },
  {
    id: '3',
    text: '오늘 배운 것이나 깨달은 점이 있나요?',
    category: 'learning',
    date: new Date().toISOString(),
  },
  {
    id: '4',
    text: '지금 이 순간 당신의 기분은 어떤가요?',
    category: 'emotion',
    date: new Date().toISOString(),
  },
  {
    id: '5',
    text: '오늘 누군가에게 해주고 싶은 말이 있나요?',
    category: 'relationship',
    date: new Date().toISOString(),
  },
  {
    id: '6',
    text: '내일은 어떤 하루가 되었으면 좋겠나요?',
    category: 'future',
    date: new Date().toISOString(),
  },
  {
    id: '7',
    text: '오늘 나에게 수고했다고 말해주세요.',
    category: 'self-care',
    date: new Date().toISOString(),
  },
  {
    id: '8',
    text: '지금 가장 하고 싶은 일은 무엇인가요?',
    category: 'desire',
    date: new Date().toISOString(),
  },
  {
    id: '9',
    text: '오늘 당신을 웃게 만든 것은 무엇인가요?',
    category: 'joy',
    date: new Date().toISOString(),
  },
  {
    id: '10',
    text: '최근에 힘들었던 일과 그것을 어떻게 극복했는지 적어보세요.',
    category: 'challenge',
    date: new Date().toISOString(),
  },
];

// Bookmark
export interface Bookmark {
  id: string;
  device_id: string;
  confession_id: string;
  created_at: string;
  note?: string;
}
