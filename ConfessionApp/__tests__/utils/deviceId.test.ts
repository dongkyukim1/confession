/**
 * Device ID Tests
 */
import {getOrCreateDeviceId, validateDeviceId} from '../../src/utils/deviceId';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

describe('deviceId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrCreateDeviceId', () => {
    it('should return existing device ID from storage', async () => {
      const existingId = '550e8400-e29b-41d4-a716-446655440000';
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(existingId);

      const result = await getOrCreateDeviceId();
      expect(result).toBe(existingId);
    });

    it('should generate new ID if none exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const result = await getOrCreateDeviceId();
      expect(result).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should save generated ID to storage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await getOrCreateDeviceId();
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@confession_device_id',
        expect.any(String),
      );
    });
  });

  describe('validateDeviceId', () => {
    it('should validate correct UUID v4 format', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        '123e4567-e89b-42d3-a456-426614174000',
      );

      const result = await validateDeviceId();
      expect(result).toBe(true);
    });
  });
});
