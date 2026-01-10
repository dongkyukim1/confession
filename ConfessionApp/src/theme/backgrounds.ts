/**
 * 배경 커스텀 시스템
 * 
 * 사용자가 앱 전체 배경을 커스터마이징할 수 있는 프리셋 정의
 */

export type BackgroundType = 'default' | 'image' | 'gradient';

export interface BackgroundPreset {
  id: string;
  name: string;
  displayName: string;
  type: BackgroundType;
  description: string;
  imageSource?: any; // require() 이미지 소스
  colors?: string[]; // gradient용
  category: 'default' | 'nature' | 'sky' | 'mood';
}

export interface BackgroundSettings {
  presetId: string;
  opacity: number; // 0-1
  blur: number; // 0-20
  overlayColor?: string;
  overlayOpacity?: number; // 0-1
}

// 기본 배경 설정
export const DEFAULT_BACKGROUND_SETTINGS: BackgroundSettings = {
  presetId: 'default',
  opacity: 1,
  blur: 0,
  overlayColor: undefined,
  overlayOpacity: 0,
};

// 배경 프리셋 정의
export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  // 기본 배경
  {
    id: 'default',
    name: 'Default',
    displayName: '기본 배경',
    type: 'default',
    description: '깔끔한 순백 배경',
    category: 'default',
  },
  
  // 자연 카테고리
  {
    id: 'green',
    name: 'Green Nature',
    displayName: '초록 자연',
    type: 'image',
    description: '평화로운 자연 풍경',
    imageSource: require('../assets/images/backgrounds/green.jpg'),
    category: 'nature',
  },
  
  // 하늘/날씨 카테고리
  {
    id: 'cloud',
    name: 'Cloud Sky',
    displayName: '구름',
    type: 'image',
    description: '부드러운 구름 배경',
    imageSource: require('../assets/images/backgrounds/cloud.jpg'),
    category: 'sky',
  },
  {
    id: 'night',
    name: 'Night Sky',
    displayName: '밤하늘',
    type: 'image',
    description: '별이 빛나는 밤',
    imageSource: require('../assets/images/backgrounds/night.jpg'),
    category: 'sky',
  },
  
  // 분위기 카테고리
  {
    id: 'ocean',
    name: 'Ocean',
    displayName: '바다',
    type: 'image',
    description: '잔잔한 바다 풍경',
    imageSource: require('../assets/images/backgrounds/ocean.jpg'),
    category: 'mood',
  },
  {
    id: 'purple',
    name: 'Purple Sky',
    displayName: '보라빛 하늘',
    type: 'image',
    description: '몽환적인 보라빛',
    imageSource: require('../assets/images/backgrounds/purple.jpg'),
    category: 'mood',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    displayName: '일몰',
    type: 'image',
    description: '따뜻한 노을 배경',
    imageSource: require('../assets/images/backgrounds/sunset.jpg'),
    category: 'mood',
  },
];

// 프리셋 ID로 프리셋 찾기
export function getPresetById(id: string): BackgroundPreset {
  return BACKGROUND_PRESETS.find(preset => preset.id === id) || BACKGROUND_PRESETS[0];
}

// 카테고리별 프리셋 가져오기
export function getPresetsByCategory(category: BackgroundPreset['category']): BackgroundPreset[] {
  return BACKGROUND_PRESETS.filter(preset => preset.category === category);
}

// 카테고리 목록
export const BACKGROUND_CATEGORIES = [
  { id: 'default', name: '기본', icon: 'square-outline' },
  { id: 'nature', name: '자연', icon: 'leaf-outline' },
  { id: 'sky', name: '하늘', icon: 'cloud-outline' },
  { id: 'mood', name: '분위기', icon: 'heart-outline' },
] as const;
