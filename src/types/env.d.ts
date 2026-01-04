/**
 * react-native-config 환경변수 타입 정의
 */
declare module 'react-native-config' {
  export interface NativeConfig {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
  }

  export const Config: NativeConfig;
  export default Config;
}

