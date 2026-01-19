/**
 * Accessibility Utils Tests
 */
import {
  buttonA11y,
  linkA11y,
  imageA11y,
  checkboxA11y,
  headerA11y,
  inputA11y,
  alertA11y,
  tabA11y,
  progressA11y,
  confessionA11yLabel,
} from '../../src/utils/a11y';

describe('Accessibility Utilities', () => {
  describe('buttonA11y', () => {
    it('should return correct props for button', () => {
      const result = buttonA11y('Submit');
      expect(result.accessibilityRole).toBe('button');
      expect(result.accessibilityLabel).toBe('Submit');
    });

    it('should include hint when provided', () => {
      const result = buttonA11y('Submit', 'Double tap to submit form');
      expect(result.accessibilityHint).toBe('Double tap to submit form');
    });

    it('should include disabled state when provided', () => {
      const result = buttonA11y('Submit', undefined, true);
      expect(result.accessibilityState?.disabled).toBe(true);
    });
  });

  describe('linkA11y', () => {
    it('should return correct props for link', () => {
      const result = linkA11y('Privacy Policy');
      expect(result.accessibilityRole).toBe('link');
      expect(result.accessibilityLabel).toBe('Privacy Policy');
    });

    it('should include hint when provided', () => {
      const result = linkA11y('Privacy Policy', 'Opens in new tab');
      expect(result.accessibilityHint).toBe('Opens in new tab');
    });
  });

  describe('imageA11y', () => {
    it('should return correct props for image', () => {
      const result = imageA11y('Profile picture');
      expect(result.accessibilityRole).toBe('image');
      expect(result.accessibilityLabel).toBe('Profile picture');
    });

    it('should mark decorative images correctly', () => {
      const result = imageA11y('', true);
      expect(result.accessibilityElementsHidden).toBe(true);
    });
  });

  describe('checkboxA11y', () => {
    it('should return correct props for checkbox', () => {
      const result = checkboxA11y('Accept terms', false);
      expect(result.accessibilityRole).toBe('checkbox');
      expect(result.accessibilityLabel).toBe('Accept terms');
      expect(result.accessibilityState?.checked).toBe(false);
    });

    it('should indicate checked state', () => {
      const result = checkboxA11y('Accept terms', true);
      expect(result.accessibilityState?.checked).toBe(true);
    });
  });

  describe('headerA11y', () => {
    it('should return correct props for header', () => {
      const result = headerA11y('Page Title');
      expect(result.accessibilityRole).toBe('header');
      expect(result.accessibilityLabel).toBe('Page Title');
    });

    it('should include level when provided', () => {
      const result = headerA11y('Page Title', 1);
      expect(result.accessibilityLabel).toContain('Page Title');
    });
  });

  describe('inputA11y', () => {
    it('should return correct props for text input', () => {
      const result = inputA11y('Email', 'email');
      expect(result.accessibilityLabel).toBe('Email');
    });

    it('should indicate required state', () => {
      const result = inputA11y('Email', 'email', true);
      expect(result.accessibilityLabel).toContain('필수');
    });

    it('should include error state', () => {
      const result = inputA11y('Email', 'email', false, '유효한 이메일을 입력하세요');
      expect(result.accessibilityLabel).toContain('오류');
    });
  });

  describe('alertA11y', () => {
    it('should return correct props for alert', () => {
      const result = alertA11y('Error occurred');
      expect(result.accessibilityRole).toBe('alert');
      expect(result.accessibilityLabel).toBe('Error occurred');
    });

    it('should include live region', () => {
      const result = alertA11y('Error occurred');
      expect(result.accessibilityLiveRegion).toBe('assertive');
    });
  });

  describe('tabA11y', () => {
    it('should return correct props for tab', () => {
      const result = tabA11y('Home', true);
      expect(result.accessibilityRole).toBe('tab');
      expect(result.accessibilityLabel).toBe('Home');
      expect(result.accessibilityState?.selected).toBe(true);
    });

    it('should indicate unselected state', () => {
      const result = tabA11y('Settings', false);
      expect(result.accessibilityState?.selected).toBe(false);
    });
  });

  describe('progressA11y', () => {
    it('should return correct props for progress', () => {
      const result = progressA11y(50, 100);
      expect(result.accessibilityRole).toBe('progressbar');
      expect(result.accessibilityValue?.now).toBe(50);
      expect(result.accessibilityValue?.max).toBe(100);
    });

    it('should include label when provided', () => {
      const result = progressA11y(50, 100, 'Loading content');
      expect(result.accessibilityLabel).toBe('Loading content');
    });

    it('should calculate percentage correctly', () => {
      const result = progressA11y(25, 100);
      expect(result.accessibilityValue?.text).toContain('25');
    });
  });

  describe('confessionA11yLabel', () => {
    it('should generate label for confession', () => {
      const result = confessionA11yLabel({
        content: 'This is a test confession',
        mood: '😊',
        createdAt: new Date('2024-01-15T10:30:00'),
      });

      expect(result).toContain('고백');
      expect(result).toContain('😊');
    });

    it('should handle missing mood', () => {
      const result = confessionA11yLabel({
        content: 'This is a test confession',
        createdAt: new Date('2024-01-15T10:30:00'),
      });

      expect(result).toContain('고백');
      expect(result).not.toContain('undefined');
    });

    it('should truncate long content', () => {
      const longContent = 'A'.repeat(200);
      const result = confessionA11yLabel({
        content: longContent,
        createdAt: new Date('2024-01-15T10:30:00'),
      });

      expect(result.length).toBeLessThan(longContent.length + 100);
    });
  });
});
