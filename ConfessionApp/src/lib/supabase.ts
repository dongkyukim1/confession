/**
 * Supabase 클라이언트 설정
 * RLS 지원을 위한 device_id 헤더 포함
 */
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createClient, SupabaseClient} from '@supabase/supabase-js';
import Config from 'react-native-config';
import {getOrCreateDeviceId} from '../utils/deviceId';

// Supabase 환경 변수
const SUPABASE_URL = Config.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = Config.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// 환경 변수 검증
if (!SUPABASE_URL || SUPABASE_URL === 'YOUR_SUPABASE_URL') {
  console.error('❌ SUPABASE_URL이 설정되지 않았습니다.');
  console.error('📝 .env 파일을 생성하고 다음 내용을 추가하세요:');
  console.error('SUPABASE_URL=your_supabase_project_url');
  console.error('SUPABASE_ANON_KEY=your_supabase_anon_key');
}

if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
  console.error('❌ SUPABASE_ANON_KEY가 설정되지 않았습니다.');
}

// 기본 Supabase 클라이언트 (device_id 없이)
const baseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Device ID가 포함된 클라이언트를 위한 캐시
let deviceIdCache: string | null = null;
let supabaseWithDeviceId: SupabaseClient | null = null;

/**
 * Device ID가 포함된 Supabase 클라이언트 가져오기
 * RLS 정책에서 device_id를 사용할 수 있도록 헤더에 포함
 */
export async function getSupabaseClient(): Promise<SupabaseClient> {
  // 캐시된 클라이언트가 있고 device_id가 동일하면 재사용
  const currentDeviceId = await getOrCreateDeviceId();

  if (supabaseWithDeviceId && deviceIdCache === currentDeviceId) {
    return supabaseWithDeviceId;
  }

  // 새 클라이언트 생성 with device_id 헤더
  deviceIdCache = currentDeviceId;
  supabaseWithDeviceId = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        'x-device-id': currentDeviceId,
      },
    },
  });

  return supabaseWithDeviceId;
}

/**
 * 동기적 접근을 위한 기본 클라이언트
 * 참고: RLS가 필요한 작업에서는 getSupabaseClient() 사용 권장
 */
export const supabase = baseClient;

/**
 * Device ID 헤더로 클라이언트 초기화
 * 앱 시작시 호출하여 캐시 워밍업
 */
export async function initializeSupabase(): Promise<void> {
  try {
    await getSupabaseClient();
    console.log('[Supabase] Client initialized with device_id');
  } catch (error) {
    console.error('[Supabase] Initialization error:', error);
  }
}

/**
 * 현재 device_id 가져오기 (디버그용)
 */
export function getCurrentDeviceId(): string | null {
  return deviceIdCache;
}
