/**
 * Mission Service
 *
 * 일일 미션 관련 비즈니스 로직을 처리합니다.
 */
import {supabase} from '../lib/supabase';
import {Mission, MissionType, UserDailyMission} from '../types';
import {handleApiError, withRetry, validateRequired} from './api.utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DAILY_MISSIONS_KEY = '@daily_missions';
const MISSIONS_DATE_KEY = '@missions_date';

// 미션 풀 정의
const MISSION_POOL: Omit<Mission, 'id'>[] = [
  {
    type: 'write_confession',
    title: '오늘의 고백',
    description: '고백을 1개 작성하세요',
    target_count: 1,
    reward_xp: 10,
    icon: '✍️',
  },
  {
    type: 'read_confessions',
    title: '다른 이의 이야기',
    description: '다른 사람의 고백을 3개 읽으세요',
    target_count: 3,
    reward_xp: 15,
    icon: '👀',
  },
  {
    type: 'give_reaction',
    title: '공감 표현하기',
    description: '고백에 반응을 2번 남기세요',
    target_count: 2,
    reward_xp: 10,
    icon: '❤️',
  },
  {
    type: 'write_with_mood',
    title: '감정 표현하기',
    description: '기분을 선택해서 고백을 작성하세요',
    target_count: 1,
    reward_xp: 15,
    icon: '😊',
  },
  {
    type: 'write_with_tag',
    title: '태그 달인',
    description: '태그를 사용해서 고백을 작성하세요',
    target_count: 1,
    reward_xp: 15,
    icon: '🏷️',
  },
  {
    type: 'write_with_image',
    title: '사진과 함께',
    description: '이미지를 첨부해서 고백을 작성하세요',
    target_count: 1,
    reward_xp: 20,
    icon: '📸',
  },
  {
    type: 'write_long_confession',
    title: '깊은 이야기',
    description: '100자 이상의 긴 고백을 작성하세요',
    target_count: 1,
    reward_xp: 20,
    icon: '📝',
  },
  {
    type: 'read_confessions',
    title: '탐험가',
    description: '다른 사람의 고백을 5개 읽으세요',
    target_count: 5,
    reward_xp: 25,
    icon: '🔍',
  },
  {
    type: 'give_reaction',
    title: '활발한 공감러',
    description: '고백에 반응을 5번 남기세요',
    target_count: 5,
    reward_xp: 25,
    icon: '💕',
  },
];

export interface DailyMissionInfo {
  mission: Omit<Mission, 'id'> & {id: string};
  currentProgress: number;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface DailyMissionsResult {
  missions: DailyMissionInfo[];
  totalXP: number;
  completedCount: number;
}

export class MissionService {
  /**
   * 오늘의 일일 미션 조회
   */
  static async getDailyMissions(deviceId: string): Promise<DailyMissionsResult> {
    try {
      validateRequired(deviceId, '기기 ID');

      const today = this.getDateString(new Date());

      // 로컬에서 먼저 확인
      const storedDate = await AsyncStorage.getItem(MISSIONS_DATE_KEY);
      const storedMissions = await AsyncStorage.getItem(DAILY_MISSIONS_KEY);

      if (storedDate === today && storedMissions) {
        const missions = JSON.parse(storedMissions) as DailyMissionInfo[];
        return this.calculateResult(missions);
      }

      // 새로운 미션 생성 (랜덤 3개 선택)
      const selectedMissions = this.selectRandomMissions(3);
      const missions: DailyMissionInfo[] = selectedMissions.map(
        (mission, index) => ({
          mission: {...mission, id: `mission_${today}_${index}`},
          currentProgress: 0,
          isCompleted: false,
        }),
      );

      // 로컬에 저장
      await AsyncStorage.setItem(MISSIONS_DATE_KEY, today);
      await AsyncStorage.setItem(DAILY_MISSIONS_KEY, JSON.stringify(missions));

      // 서버에도 저장 (백업)
      await this.saveMissionsToServer(deviceId, missions, today);

      console.log('[MissionService] Generated new daily missions');
      return this.calculateResult(missions);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * 미션 진행도 업데이트
   */
  static async updateMissionProgress(
    deviceId: string,
    missionType: MissionType,
    incrementBy: number = 1,
  ): Promise<DailyMissionInfo | null> {
    try {
      const storedMissions = await AsyncStorage.getItem(DAILY_MISSIONS_KEY);
      if (!storedMissions) return null;

      const missions: DailyMissionInfo[] = JSON.parse(storedMissions);
      const missionIndex = missions.findIndex(
        m => m.mission.type === missionType && !m.isCompleted,
      );

      if (missionIndex === -1) return null;

      const mission = missions[missionIndex];
      mission.currentProgress += incrementBy;

      // 완료 체크
      if (mission.currentProgress >= mission.mission.target_count) {
        mission.currentProgress = mission.mission.target_count;
        mission.isCompleted = true;
        mission.completedAt = new Date();
      }

      missions[missionIndex] = mission;
      await AsyncStorage.setItem(DAILY_MISSIONS_KEY, JSON.stringify(missions));

      console.log(
        '[MissionService] Updated mission:',
        missionType,
        'Progress:',
        mission.currentProgress,
      );

      return mission;
    } catch (error) {
      console.error('[MissionService] Failed to update mission:', error);
      return null;
    }
  }

  /**
   * 특정 타입의 미션 진행도 업데이트 (고백 작성 시 호출)
   */
  static async onConfessionCreated(
    deviceId: string,
    options: {
      hasMood?: boolean;
      hasTags?: boolean;
      hasImages?: boolean;
      contentLength?: number;
    },
  ): Promise<DailyMissionInfo[]> {
    const updatedMissions: DailyMissionInfo[] = [];

    // 기본 작성 미션
    const writeResult = await this.updateMissionProgress(
      deviceId,
      'write_confession',
    );
    if (writeResult) updatedMissions.push(writeResult);

    // 기분 선택 미션
    if (options.hasMood) {
      const moodResult = await this.updateMissionProgress(
        deviceId,
        'write_with_mood',
      );
      if (moodResult) updatedMissions.push(moodResult);
    }

    // 태그 사용 미션
    if (options.hasTags) {
      const tagResult = await this.updateMissionProgress(
        deviceId,
        'write_with_tag',
      );
      if (tagResult) updatedMissions.push(tagResult);
    }

    // 이미지 첨부 미션
    if (options.hasImages) {
      const imageResult = await this.updateMissionProgress(
        deviceId,
        'write_with_image',
      );
      if (imageResult) updatedMissions.push(imageResult);
    }

    // 긴 고백 미션
    if (options.contentLength && options.contentLength >= 100) {
      const longResult = await this.updateMissionProgress(
        deviceId,
        'write_long_confession',
      );
      if (longResult) updatedMissions.push(longResult);
    }

    return updatedMissions;
  }

  /**
   * 고백 읽기 미션 업데이트
   */
  static async onConfessionRead(deviceId: string): Promise<DailyMissionInfo | null> {
    return this.updateMissionProgress(deviceId, 'read_confessions');
  }

  /**
   * 반응 남기기 미션 업데이트
   */
  static async onReactionGiven(deviceId: string): Promise<DailyMissionInfo | null> {
    return this.updateMissionProgress(deviceId, 'give_reaction');
  }

  /**
   * 랜덤 미션 선택
   */
  private static selectRandomMissions(count: number): Omit<Mission, 'id'>[] {
    const shuffled = [...MISSION_POOL].sort(() => Math.random() - 0.5);

    // 타입 중복 방지
    const selected: Omit<Mission, 'id'>[] = [];
    const usedTypes = new Set<MissionType>();

    for (const mission of shuffled) {
      if (!usedTypes.has(mission.type) && selected.length < count) {
        selected.push(mission);
        usedTypes.add(mission.type);
      }
    }

    // 부족하면 중복 허용
    while (selected.length < count) {
      const randomMission = shuffled[Math.floor(Math.random() * shuffled.length)];
      selected.push(randomMission);
    }

    return selected;
  }

  /**
   * 결과 계산
   */
  private static calculateResult(missions: DailyMissionInfo[]): DailyMissionsResult {
    const completedMissions = missions.filter(m => m.isCompleted);
    const totalXP = completedMissions.reduce(
      (sum, m) => sum + m.mission.reward_xp,
      0,
    );

    return {
      missions,
      totalXP,
      completedCount: completedMissions.length,
    };
  }

  /**
   * 서버에 미션 저장
   */
  private static async saveMissionsToServer(
    deviceId: string,
    missions: DailyMissionInfo[],
    date: string,
  ): Promise<void> {
    try {
      const records = missions.map(m => ({
        device_id: deviceId,
        mission_id: m.mission.id,
        mission_date: date,
        current_progress: m.currentProgress,
        is_completed: m.isCompleted,
      }));

      await supabase.from('user_daily_missions').upsert(records, {
        onConflict: 'device_id,mission_id,mission_date',
      });
    } catch (error) {
      console.error('[MissionService] Failed to save to server:', error);
    }
  }

  /**
   * 오늘 날짜 문자열 반환
   */
  private static getDateString(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
