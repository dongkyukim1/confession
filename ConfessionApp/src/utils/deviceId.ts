/**
 * 디바이스 고유 ID 관리
 * 익명성을 유지하면서 사용자 구분용으로 사용
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = '@confession_device_id';

/**
 * UUID v4 생성 함수
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 디바이스 ID를 가져오거나 새로 생성
 */
export async function getOrCreateDeviceId(): Promise<string> {
  try {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);

    if (!deviceId) {
      deviceId = generateUUID();
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }

    return deviceId;
  } catch (error) {
    console.error('디바이스 ID 처리 중 오류:', error);
    // 오류 시 임시 ID 반환
    return generateUUID();
  }
}

