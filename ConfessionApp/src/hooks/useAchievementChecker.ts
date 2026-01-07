/**
 * 업적 체커 훅
 * 
 * 앱 전반에서 사용할 업적 체크 및 표시 로직
 */
import {useState, useCallback} from 'react';
import {AchievementType, Achievement} from '../types/database';
import {
  getUnviewedAchievements,
  markAchievementAsViewed,
  checkAndUnlockAchievement,
} from '../utils/achievementManager';

interface UseAchievementCheckerReturn {
  /**
   * 미확인 업적 조회
   */
  checkForNewAchievements: (deviceId: string) => Promise<Achievement[]>;
  
  /**
   * 업적 확인 완료 표시
   */
  markAsViewed: (achievementId: string) => Promise<boolean>;
  
  /**
   * 특정 업적 해제 시도
   */
  unlockAchievement: (
    deviceId: string,
    achievementType: AchievementType,
  ) => Promise<Achievement | null>;
  
  /**
   * 현재 표시 중인 업적
   */
  currentAchievement: Achievement | null;
  
  /**
   * 업적 표시
   */
  showAchievement: (achievement: Achievement) => void;
  
  /**
   * 업적 숨기기
   */
  hideAchievement: () => void;
  
  /**
   * 모달 표시 여부
   */
  isModalVisible: boolean;
}

export const useAchievementChecker = (): UseAchievementCheckerReturn => {
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  /**
   * 미확인 업적 조회
   */
  const checkForNewAchievements = useCallback(
    async (deviceId: string): Promise<Achievement[]> => {
      try {
        const achievements = await getUnviewedAchievements(deviceId);
        
        // 미확인 업적이 있으면 첫 번째 것을 표시
        if (achievements.length > 0) {
          showAchievement(achievements[0]);
        }
        
        return achievements;
      } catch (error) {
        console.error('업적 조회 오류:', error);
        return [];
      }
    },
    [],
  );

  /**
   * 업적 확인 완료 표시
   */
  const markAsViewed = useCallback(
    async (achievementId: string): Promise<boolean> => {
      try {
        return await markAchievementAsViewed(achievementId);
      } catch (error) {
        console.error('업적 확인 표시 오류:', error);
        return false;
      }
    },
    [],
  );

  /**
   * 특정 업적 해제 시도
   */
  const unlockAchievement = useCallback(
    async (
      deviceId: string,
      achievementType: AchievementType,
    ): Promise<Achievement | null> => {
      try {
        const achievement = await checkAndUnlockAchievement(deviceId, achievementType);
        
        // 새로운 업적이 해제되면 모달 표시
        if (achievement) {
          showAchievement(achievement);
        }
        
        return achievement;
      } catch (error) {
        console.error('업적 해제 오류:', error);
        return null;
      }
    },
    [],
  );

  /**
   * 업적 표시
   */
  const showAchievement = useCallback((achievement: Achievement) => {
    setCurrentAchievement(achievement);
    setIsModalVisible(true);
  }, []);

  /**
   * 업적 숨기기
   */
  const hideAchievement = useCallback(() => {
    if (currentAchievement) {
      // 확인 완료 표시
      markAchievementAsViewed(currentAchievement.id);
    }
    
    setIsModalVisible(false);
    
    // 애니메이션 완료 후 상태 초기화
    setTimeout(() => {
      setCurrentAchievement(null);
    }, 300);
  }, [currentAchievement]);

  return {
    checkForNewAchievements,
    markAsViewed,
    unlockAchievement,
    currentAchievement,
    showAchievement,
    hideAchievement,
    isModalVisible,
  };
};

