/**
 * BackgroundContext - 앱 전체 배경 관리
 * 
 * 사용자가 선택한 배경 설정을 저장하고 앱 전체에서 사용할 수 있도록 관리
 */
import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BackgroundPreset,
  BackgroundSettings,
  BACKGROUND_PRESETS,
  DEFAULT_BACKGROUND_SETTINGS,
  getPresetById,
} from '../theme/backgrounds';

interface BackgroundContextValue {
  currentSettings: BackgroundSettings;
  currentPreset: BackgroundPreset;
  allPresets: BackgroundPreset[];
  setBackgroundPreset: (presetId: string) => Promise<void>;
  updateOpacity: (opacity: number) => Promise<void>;
  updateBlur: (blur: number) => Promise<void>;
  updateOverlay: (color: string | undefined, opacity: number) => Promise<void>;
  resetToDefault: () => Promise<void>;
  isLoading: boolean;
}

const BackgroundContext = createContext<BackgroundContextValue | undefined>(undefined);

const BACKGROUND_STORAGE_KEY = '@confession_app:background_settings';

export function BackgroundProvider({children}: {children: ReactNode}) {
  const [currentSettings, setCurrentSettings] = useState<BackgroundSettings>(
    DEFAULT_BACKGROUND_SETTINGS,
  );
  const [isLoading, setIsLoading] = useState(true);

  // 저장된 배경 설정 불러오기
  useEffect(() => {
    loadBackgroundSettings();
  }, []);

  const loadBackgroundSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(BACKGROUND_STORAGE_KEY);
      if (saved) {
        const parsedSettings: BackgroundSettings = JSON.parse(saved);
        setCurrentSettings(parsedSettings);
      }
    } catch (error) {
      console.error('배경 설정 불러오기 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: BackgroundSettings) => {
    try {
      await AsyncStorage.setItem(BACKGROUND_STORAGE_KEY, JSON.stringify(newSettings));
      setCurrentSettings(newSettings);
    } catch (error) {
      console.error('배경 설정 저장 실패:', error);
    }
  };

  const setBackgroundPreset = async (presetId: string) => {
    const newSettings: BackgroundSettings = {
      ...currentSettings,
      presetId,
    };
    await saveSettings(newSettings);
  };

  const updateOpacity = async (opacity: number) => {
    const newSettings: BackgroundSettings = {
      ...currentSettings,
      opacity: Math.max(0, Math.min(1, opacity)), // 0-1 범위로 제한
    };
    await saveSettings(newSettings);
  };

  const updateBlur = async (blur: number) => {
    const newSettings: BackgroundSettings = {
      ...currentSettings,
      blur: Math.max(0, Math.min(20, blur)), // 0-20 범위로 제한
    };
    await saveSettings(newSettings);
  };

  const updateOverlay = async (color: string | undefined, opacity: number) => {
    const newSettings: BackgroundSettings = {
      ...currentSettings,
      overlayColor: color,
      overlayOpacity: Math.max(0, Math.min(1, opacity)), // 0-1 범위로 제한
    };
    await saveSettings(newSettings);
  };

  const resetToDefault = async () => {
    await saveSettings(DEFAULT_BACKGROUND_SETTINGS);
  };

  const currentPreset = getPresetById(currentSettings.presetId);

  return (
    <BackgroundContext.Provider
      value={{
        currentSettings,
        currentPreset,
        allPresets: BACKGROUND_PRESETS,
        setBackgroundPreset,
        updateOpacity,
        updateBlur,
        updateOverlay,
        resetToDefault,
        isLoading,
      }}>
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error('useBackground must be used within BackgroundProvider');
  }
  return context;
}
