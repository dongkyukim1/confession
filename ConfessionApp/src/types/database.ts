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

export interface Database {
  public: {
    Tables: {
      confessions: {
        Row: Confession;
        Insert: ConfessionInsert;
        Update: ConfessionUpdate;
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
