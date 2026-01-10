/**
 * Supabase 클라이언트 설정
 */
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createClient} from '@supabase/supabase-js';
import Config from 'react-native-config';

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

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

