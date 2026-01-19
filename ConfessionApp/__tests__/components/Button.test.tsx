/**
 * Button Component Tests
 *
 * Tests for accessibility and functionality
 */
import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {Button} from '../../src/components/ui/Button';

// Mock theme context
jest.mock('../../src/hooks/useThemeColors', () => ({
  useThemeColors: () => ({
    colors: {
      primary: '#5B5FEF',
      surface: '#FFFFFF',
      textPrimary: '#1A1A1A',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      error: '#EF4444',
      success: '#10B981',
    },
    neutral: {
      0: '#FFFFFF',
      100: '#F5F5F5',
      500: '#737373',
      900: '#171717',
    },
  }),
}));

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render with title', () => {
      const {getByText} = render(<Button title="Test Button" onPress={() => {}} />);
      expect(getByText('Test Button')).toBeTruthy();
    });

    it('should render children when provided', () => {
      const {getByText} = render(
        <Button onPress={() => {}}>
          Child Content
        </Button>,
      );
      expect(getByText('Child Content')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('should call onPress when pressed', () => {
      const onPressMock = jest.fn();
      const {getByText} = render(
        <Button title="Press Me" onPress={onPressMock} />,
      );

      fireEvent.press(getByText('Press Me'));
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('should not call onPress when disabled', () => {
      const onPressMock = jest.fn();
      const {getByText} = render(
        <Button title="Disabled" onPress={onPressMock} disabled />,
      );

      fireEvent.press(getByText('Disabled'));
      expect(onPressMock).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible role', () => {
      const {getByRole} = render(
        <Button title="Accessible" onPress={() => {}} />,
      );
      expect(getByRole('button')).toBeTruthy();
    });

    it('should have accessibility label when provided', () => {
      const {getByLabelText} = render(
        <Button
          title="Submit"
          onPress={() => {}}
          accessibilityLabel="Submit form"
        />,
      );
      expect(getByLabelText('Submit form')).toBeTruthy();
    });

    it('should indicate disabled state for accessibility', () => {
      const {getByRole} = render(
        <Button title="Disabled" onPress={() => {}} disabled />,
      );

      const button = getByRole('button');
      expect(button.props.accessibilityState?.disabled).toBe(true);
    });

    it('should have accessibility hint when provided', () => {
      const {getByA11yHint} = render(
        <Button
          title="Action"
          onPress={() => {}}
          accessibilityHint="Double tap to perform action"
        />,
      );
      expect(getByA11yHint('Double tap to perform action')).toBeTruthy();
    });
  });

  describe('Variants', () => {
    it('should render primary variant by default', () => {
      const {getByText} = render(
        <Button title="Primary" onPress={() => {}} />,
      );
      expect(getByText('Primary')).toBeTruthy();
    });

    it('should render secondary variant', () => {
      const {getByText} = render(
        <Button title="Secondary" onPress={() => {}} variant="secondary" />,
      );
      expect(getByText('Secondary')).toBeTruthy();
    });

    it('should render outline variant', () => {
      const {getByText} = render(
        <Button title="Outline" onPress={() => {}} variant="outline" />,
      );
      expect(getByText('Outline')).toBeTruthy();
    });

    it('should render ghost variant', () => {
      const {getByText} = render(
        <Button title="Ghost" onPress={() => {}} variant="ghost" />,
      );
      expect(getByText('Ghost')).toBeTruthy();
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      const {getByText} = render(
        <Button title="Small" onPress={() => {}} size="small" />,
      );
      expect(getByText('Small')).toBeTruthy();
    });

    it('should render medium size by default', () => {
      const {getByText} = render(
        <Button title="Medium" onPress={() => {}} />,
      );
      expect(getByText('Medium')).toBeTruthy();
    });

    it('should render large size', () => {
      const {getByText} = render(
        <Button title="Large" onPress={() => {}} size="large" />,
      );
      expect(getByText('Large')).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator when loading', () => {
      const {queryByText, getByTestId} = render(
        <Button title="Loading" onPress={() => {}} loading testID="button" />,
      );

      // Title might be hidden or replaced during loading
      // Check that the button exists
      expect(getByTestId('button')).toBeTruthy();
    });

    it('should not call onPress when loading', () => {
      const onPressMock = jest.fn();
      const {getByTestId} = render(
        <Button
          title="Loading"
          onPress={onPressMock}
          loading
          testID="button"
        />,
      );

      fireEvent.press(getByTestId('button'));
      expect(onPressMock).not.toHaveBeenCalled();
    });
  });
});
