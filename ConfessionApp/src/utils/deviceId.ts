/**
 * 디바이스 고유 ID 관리
 * 익명성을 유지하면서 사용자 구분용으로 사용
 *
 * 보안 강화: uuid 패키지 사용 (암호학적으로 안전한 랜덤)
 * 저장: AsyncStorage (Keychain 미설치시) 또는 react-native-keychain
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {v4 as uuidv4} from 'uuid';

const DEVICE_ID_KEY = '@confession_device_id';

// Keychain이 설치되어 있는지 확인 (옵셔널 의존성)
let Keychain: typeof import('react-native-keychain') | null = null;
try {
  Keychain = require('react-native-keychain');
} catch {
  // react-native-keychain이 설치되지 않음 - AsyncStorage 사용
  console.log(
    '[DeviceID] react-native-keychain not installed, using AsyncStorage',
  );
}

/**
 * Keychain에서 device ID 가져오기
 */
async function getFromKeychain(): Promise<string | null> {
  if (!Keychain) {
    return null;
  }
  try {
    const credentials = await Keychain.getGenericPassword({
      service: 'com.confession.deviceid',
    });
    if (credentials) {
      return credentials.password;
    }
    return null;
  } catch (error) {
    console.error('[DeviceID] Keychain read error:', error);
    return null;
  }
}

/**
 * Keychain에 device ID 저장
 */
async function saveToKeychain(deviceId: string): Promise<boolean> {
  if (!Keychain) {
    return false;
  }
  try {
    await Keychain.setGenericPassword('device_id', deviceId, {
      service: 'com.confession.deviceid',
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    return true;
  } catch (error) {
    console.error('[DeviceID] Keychain write error:', error);
    return false;
  }
}

/**
 * AsyncStorage에서 device ID 가져오기 (폴백)
 */
async function getFromAsyncStorage(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(DEVICE_ID_KEY);
  } catch (error) {
    console.error('[DeviceID] AsyncStorage read error:', error);
    return null;
  }
}

/**
 * AsyncStorage에 device ID 저장 (폴백)
 */
async function saveToAsyncStorage(deviceId: string): Promise<boolean> {
  try {
    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    return true;
  } catch (error) {
    console.error('[DeviceID] AsyncStorage write error:', error);
    return false;
  }
}

/**
 * 암호학적으로 안전한 UUID v4 생성
 * uuid 패키지는 crypto.getRandomValues()를 사용
 */
function generateSecureUUID(): string {
  return uuidv4();
}

/**
 * 기존 device ID 마이그레이션
 * AsyncStorage에서 Keychain으로 이동 (Keychain 사용 가능시)
 */
async function migrateToKeychain(): Promise<void> {
  if (!Keychain) {
    return;
  }

  const asyncStorageId = await getFromAsyncStorage();
  const keychainId = await getFromKeychain();

  // AsyncStorage에는 있고 Keychain에는 없으면 마이그레이션
  if (asyncStorageId && !keychainId) {
    const saved = await saveToKeychain(asyncStorageId);
    if (saved) {
      console.log('[DeviceID] Migrated from AsyncStorage to Keychain');
    }
  }
}

/**
 * 디바이스 ID를 가져오거나 새로 생성
 * 우선순위: Keychain > AsyncStorage > 새로 생성
 */
export async function getOrCreateDeviceId(): Promise<string> {
  try {
    // 마이그레이션 시도
    await migrateToKeychain();

    // 1. Keychain에서 먼저 시도
    let deviceId = await getFromKeychain();
    if (deviceId) {
      return deviceId;
    }

    // 2. AsyncStorage에서 시도
    deviceId = await getFromAsyncStorage();
    if (deviceId) {
      // Keychain이 있으면 Keychain에도 저장
      await saveToKeychain(deviceId);
      return deviceId;
    }

    // 3. 새로 생성
    deviceId = generateSecureUUID();

    // 저장 (Keychain 우선, 실패시 AsyncStorage)
    const savedToKeychain = await saveToKeychain(deviceId);
    if (!savedToKeychain) {
      await saveToAsyncStorage(deviceId);
    }

    // AsyncStorage에도 백업 저장 (앱 재설치 대비)
    await saveToAsyncStorage(deviceId);

    console.log('[DeviceID] Generated new secure device ID');
    return deviceId;
  } catch (error) {
    console.error('[DeviceID] Critical error:', error);
    // 최후의 수단: 메모리에서만 사용되는 임시 ID
    // 앱 재시작시 새 ID 생성됨 (보안상 더 안전)
    return generateSecureUUID();
  }
}

/**
 * 현재 저장된 device ID가 유효한지 확인
 */
export async function validateDeviceId(): Promise<boolean> {
  const deviceId = await getOrCreateDeviceId();
  // UUID v4 형식 검증 (8-4-4-4-12)
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(deviceId);
}

/**
 * Device ID 초기화 (테스트/디버그용)
 * 프로덕션에서는 사용 금지
 */
export async function resetDeviceId(): Promise<string> {
  if (__DEV__) {
    try {
      await AsyncStorage.removeItem(DEVICE_ID_KEY);
      if (Keychain) {
        await Keychain.resetGenericPassword({
          service: 'com.confession.deviceid',
        });
      }
      console.log('[DeviceID] Reset complete');
    } catch (error) {
      console.error('[DeviceID] Reset error:', error);
    }
  }
  return getOrCreateDeviceId();
}

// Alias for backward compatibility
export const getDeviceId = getOrCreateDeviceId;
