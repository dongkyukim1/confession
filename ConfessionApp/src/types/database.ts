/**
 * Supabase 데이터베이스 타입 정의
 */

export interface Confession {
  id: string;
  content: string;
  created_at: string;
  device_id: string;
  view_count: number;
  
  // 리치 컨텐츠 필드
  mood?: string | null;           // 기분 이모지
  images?: string[] | null;       // 이미지 URL 배열
  tags?: string[] | null;         // 태그 배열
  
  // 좋아요/싫어요/신고 카운트
  like_count?: number;            // 좋아요 수
  dislike_count?: number;         // 싫어요 수
  report_count?: number;          // 신고 수
}

export type ConfessionInsert = {
  content: string;
  device_id: string;
  view_count?: number;
  mood?: string | null;
  images?: string[] | null;
  tags?: string[] | null;
};

export type ConfessionUpdate = {
  content?: string;
  device_id?: string;
  view_count?: number;
  mood?: string | null;
  images?: string[] | null;
  tags?: string[] | null;
};

// 좋아요/싫어요 타입
export type LikeType = 'like' | 'dislike';

export interface Like {
  id: string;
  device_id: string;
  confession_id: string;
  like_type: LikeType;
  created_at: string;
}

export type LikeInsert = {
  device_id: string;
  confession_id: string;
  like_type: LikeType;
};

// 신고 타입
export type ReportReason = 'offensive' | 'sexual' | 'spam' | 'violence' | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved';

export interface Report {
  id: string;
  device_id: string;
  confession_id: string;
  reason: ReportReason;
  description?: string | null;
  status: ReportStatus;
  created_at: string;
}

export type ReportInsert = {
  device_id: string;
  confession_id: string;
  reason: ReportReason;
  description?: string | null;
};

// 업적 타입
export type AchievementType = 
  | 'first_post' 
  | 'first_like' 
  | 'like_received' 
  | '7_day_streak';

export interface Achievement {
  id: string;
  device_id: string;
  achievement_type: AchievementType;
  unlocked_at: string;
  viewed: boolean;
}

export type AchievementInsert = {
  device_id: string;
  achievement_type: AchievementType;
  viewed?: boolean;
};

// 조회한 고백 타입
export interface ViewedConfession {
  id: string;
  device_id: string;
  confession_id: string;
  viewed_at: string;
  confession: Confession | Confession[];
}

// 스트릭 타입
export interface UserStreak {
  id: string;
  device_id: string;
  current_streak: number;
  longest_streak: number;
  last_confession_date: string;
  updated_at: string;
}

export type UserStreakInsert = {
  device_id: string;
  current_streak?: number;
  longest_streak?: number;
  last_confession_date?: string;
};

export type UserStreakUpdate = {
  current_streak?: number;
  longest_streak?: number;
  last_confession_date?: string;
  updated_at?: string;
};

// 일일 미션 타입
export type MissionType =
  | 'write_confession'      // 고백 작성
  | 'read_confessions'      // 고백 읽기
  | 'give_reaction'         // 반응 남기기
  | 'write_with_mood'       // 특정 기분으로 작성
  | 'write_with_tag'        // 태그 사용하여 작성
  | 'write_with_image'      // 이미지 첨부하여 작성
  | 'write_long_confession'; // 긴 고백 작성

export interface Mission {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  target_count: number;
  reward_xp: number;
  icon: string;
}

export interface UserDailyMission {
  id: string;
  device_id: string;
  mission_id: string;
  mission_date: string;
  current_progress: number;
  is_completed: boolean;
  completed_at?: string | null;
  created_at: string;
}

export type UserDailyMissionInsert = {
  device_id: string;
  mission_id: string;
  mission_date: string;
  current_progress?: number;
  is_completed?: boolean;
};

// 댓글 타입
export interface Comment {
  id: string;
  confession_id: string;
  device_id: string;
  content: string;
  parent_id?: string | null;
  created_at: string;
  like_count?: number;
  // 조인 데이터
  replies?: Comment[];
}

export type CommentInsert = {
  confession_id: string;
  device_id: string;
  content: string;
  parent_id?: string | null;
};

export type CommentUpdate = {
  content?: string;
};

export interface Database {
  public: {
    Tables: {
      confessions: {
        Row: Confession;
        Insert: ConfessionInsert;
        Update: ConfessionUpdate;
      };
      likes: {
        Row: Like;
        Insert: LikeInsert;
        Update: Partial<LikeInsert>;
      };
      reports: {
        Row: Report;
        Insert: ReportInsert;
        Update: Partial<ReportInsert>;
      };
      user_achievements: {
        Row: Achievement;
        Insert: AchievementInsert;
        Update: Partial<AchievementInsert>;
      };
      user_streaks: {
        Row: UserStreak;
        Insert: UserStreakInsert;
        Update: UserStreakUpdate;
      };
      missions: {
        Row: Mission;
        Insert: Omit<Mission, 'id'>;
        Update: Partial<Omit<Mission, 'id'>>;
      };
      user_daily_missions: {
        Row: UserDailyMission;
        Insert: UserDailyMissionInsert;
        Update: Partial<UserDailyMissionInsert>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
