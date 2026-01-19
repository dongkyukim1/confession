/**
 * Push Notification Service
 *
 * 설치 필요: npm install @react-native-firebase/messaging
 * 추가 설정:
 * - Firebase 프로젝트 설정
 * - Android: google-services.json
 * - iOS: GoogleService-Info.plist, APNs 인증 키
 */
import {Platform, PermissionsAndroid} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase Messaging이 설치되어 있는지 확인
let messaging: typeof import('@react-native-firebase/messaging').default | null = null;

try {
  messaging = require('@react-native-firebase/messaging').default;
} catch {
  console.log('[Notification] @react-native-firebase/messaging not installed');
}

// =====================================================
// 타입 정의
// =====================================================

interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, string>;
}

type NotificationHandler = (notification: NotificationData) => void;

// =====================================================
// 상수
// =====================================================

const FCM_TOKEN_KEY = '@confession_fcm_token';
const NOTIFICATION_ENABLED_KEY = '@confession_notification_enabled';

// =====================================================
// 서비스 클래스
// =====================================================

export class NotificationService {
  private static foregroundHandler: NotificationHandler | null = null;
  private static unsubscribeForeground: (() => void) | null = null;

  /**
   * 알림 서비스 초기화
   */
  static async initialize(): Promise<boolean> {
    if (!messaging) {
      console.log('[Notification] Skipping initialization (Firebase not installed)');
      return false;
    }

    try {
      // 권한 요청
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.log('[Notification] Permission denied');
        return false;
      }

      // FCM 토큰 가져오기
      await this.getToken();

      // 포그라운드 메시지 리스너 설정
      this.setupForegroundListener();

      // 백그라운드/종료 상태 메시지 핸들러
      this.setupBackgroundHandler();

      console.log('[Notification] Service initialized');
      return true;
    } catch (error) {
      console.error('[Notification] Initialization failed:', error);
      return false;
    }
  }

  /**
   * 알림 권한 요청
   */
  static async requestPermission(): Promise<boolean> {
    if (!messaging) {
      return false;
    }

    try {
      // iOS 권한 요청
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      console.log('[Notification] Permission status:', authStatus);
      return enabled;
    } catch (error) {
      console.error('[Notification] Permission request failed:', error);
      return false;
    }
  }

  /**
   * FCM 토큰 가져오기
   */
  static async getToken(): Promise<string | null> {
    if (!messaging) {
      return null;
    }

    try {
      const token = await messaging().getToken();
      if (token) {
        // 토큰 저장
        await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
        console.log('[Notification] Token obtained');

        // TODO: 서버에 토큰 등록
        // await this.registerTokenToServer(token);
      }
      return token;
    } catch (error) {
      console.error('[Notification] Failed to get token:', error);
      return null;
    }
  }

  /**
   * 저장된 FCM 토큰 가져오기
   */
  static async getSavedToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(FCM_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  /**
   * 토큰 갱신 리스너
   */
  static onTokenRefresh(callback: (token: string) => void): () => void {
    if (!messaging) {
      return () => {};
    }

    return messaging().onTokenRefresh(callback);
  }

  /**
   * 포그라운드 메시지 리스너 설정
   */
  private static setupForegroundListener(): void {
    if (!messaging) {
      return;
    }

    // 기존 리스너 제거
    if (this.unsubscribeForeground) {
      this.unsubscribeForeground();
    }

    this.unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('[Notification] Foreground message received:', remoteMessage);

      const notification: NotificationData = {
        title: remoteMessage.notification?.title || '',
        body: remoteMessage.notification?.body || '',
        data: remoteMessage.data as Record<string, string>,
      };

      // 커스텀 핸들러 호출
      if (this.foregroundHandler) {
        this.foregroundHandler(notification);
      }
    });
  }

  /**
   * 백그라운드/종료 상태 메시지 핸들러 설정
   */
  private static setupBackgroundHandler(): void {
    if (!messaging) {
      return;
    }

    // 백그라운드 메시지 핸들러
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('[Notification] Background message:', remoteMessage);
      // 백그라운드에서는 기본적으로 시스템 알림이 표시됨
    });
  }

  /**
   * 포그라운드 알림 핸들러 설정
   */
  static setForegroundHandler(handler: NotificationHandler): void {
    this.foregroundHandler = handler;
  }

  /**
   * 알림 클릭으로 앱 열렸을 때 데이터 가져오기
   */
  static async getInitialNotification(): Promise<NotificationData | null> {
    if (!messaging) {
      return null;
    }

    try {
      const remoteMessage = await messaging().getInitialNotification();
      if (remoteMessage) {
        return {
          title: remoteMessage.notification?.title || '',
          body: remoteMessage.notification?.body || '',
          data: remoteMessage.data as Record<string, string>,
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * 알림 클릭 리스너
   */
  static onNotificationOpened(callback: NotificationHandler): () => void {
    if (!messaging) {
      return () => {};
    }

    return messaging().onNotificationOpenedApp(remoteMessage => {
      callback({
        title: remoteMessage.notification?.title || '',
        body: remoteMessage.notification?.body || '',
        data: remoteMessage.data as Record<string, string>,
      });
    });
  }

  /**
   * 특정 토픽 구독
   */
  static async subscribeToTopic(topic: string): Promise<void> {
    if (!messaging) {
      return;
    }

    try {
      await messaging().subscribeToTopic(topic);
      console.log(`[Notification] Subscribed to topic: ${topic}`);
    } catch (error) {
      console.error(`[Notification] Failed to subscribe to topic ${topic}:`, error);
    }
  }

  /**
   * 토픽 구독 해제
   */
  static async unsubscribeFromTopic(topic: string): Promise<void> {
    if (!messaging) {
      return;
    }

    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`[Notification] Unsubscribed from topic: ${topic}`);
    } catch (error) {
      console.error(`[Notification] Failed to unsubscribe from topic ${topic}:`, error);
    }
  }

  /**
   * 알림 활성화 상태 저장
   */
  static async setNotificationEnabled(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIFICATION_ENABLED_KEY, JSON.stringify(enabled));

      if (enabled) {
        await this.subscribeToTopic('all');
      } else {
        await this.unsubscribeFromTopic('all');
      }
    } catch (error) {
      console.error('[Notification] Failed to set enabled state:', error);
    }
  }

  /**
   * 알림 활성화 상태 확인
   */
  static async isNotificationEnabled(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(NOTIFICATION_ENABLED_KEY);
      return value !== null ? JSON.parse(value) : true; // 기본값: true
    } catch {
      return true;
    }
  }

  /**
   * 정리 (앱 종료 시)
   */
  static cleanup(): void {
    if (this.unsubscribeForeground) {
      this.unsubscribeForeground();
      this.unsubscribeForeground = null;
    }
    this.foregroundHandler = null;
  }
}

export default NotificationService;
