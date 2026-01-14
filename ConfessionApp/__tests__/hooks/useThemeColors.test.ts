/**
 * useThemeColors Hook Tests
 */
import {renderHook} from '@testing-library/react-hooks';
import {useThemeColors} from '../../src/hooks/useThemeColors';
import {useTheme} from '../../src/contexts/ThemeContext';

// Mock useTheme
jest.mock('../../src/contexts/ThemeContext', () => ({
  useTheme: jest.fn(),
}));

describe('useThemeColors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return default colors when theme is not available', () => {
    (useTheme as jest.Mock).mockReturnValue(null);

    const {result} = renderHook(() => useThemeColors());

    expect(result.current.colors).toBeDefined();
    expect(result.current.neutral).toBeDefined();
    expect(result.current.neutral[500]).toBeDefined();
  });

  it('should return theme colors when theme is available', () => {
    const mockColors = {
      primary: '#5B5FEF',
      background: '#FAFBFC',
      neutral: {
        0: '#FFFFFF',
        50: '#FAFAFA',
        100: '#F5F5F5',
        200: '#E5E5E5',
        300: '#D4D4D4',
        400: '#A3A3A3',
        500: '#737373',
        600: '#525252',
        700: '#404040',
        800: '#262626',
        900: '#171717',
        950: '#0A0A0A',
        1000: '#000000',
      },
      error: {
        500: '#EF4444',
      },
    };

    (useTheme as jest.Mock).mockReturnValue({
      colors: mockColors,
      isDark: false,
      currentThemeName: 'light',
      setThemeMode: jest.fn(),
    });

    const {result} = renderHook(() => useThemeColors());

    expect(result.current.colors.primary).toBe('#5B5FEF');
    expect(result.current.neutral[500]).toBe('#737373');
    expect(result.current.isDark).toBe(false);
    expect(result.current.currentThemeName).toBe('light');
  });

  it('should return all neutral scale values', () => {
    (useTheme as jest.Mock).mockReturnValue(null);

    const {result} = renderHook(() => useThemeColors());

    // Check all neutral scale values exist
    const expectedScales = [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 1000];
    expectedScales.forEach(scale => {
      expect(result.current.neutral[scale]).toBeDefined();
      expect(typeof result.current.neutral[scale]).toBe('string');
    });
  });

  it('should return error, warning, success, info colors', () => {
    (useTheme as jest.Mock).mockReturnValue(null);

    const {result} = renderHook(() => useThemeColors());

    expect(result.current.error).toBeDefined();
    expect(result.current.warning).toBeDefined();
    expect(result.current.success).toBeDefined();
    expect(result.current.info).toBeDefined();

    // Check common scale values
    expect(result.current.error[500]).toBeDefined();
    expect(result.current.warning[500]).toBeDefined();
    expect(result.current.success[500]).toBeDefined();
    expect(result.current.info[500]).toBeDefined();
  });

  it('should return setThemeMode function', () => {
    const mockSetThemeMode = jest.fn();
    (useTheme as jest.Mock).mockReturnValue({
      colors: {},
      isDark: false,
      currentThemeName: 'light',
      setThemeMode: mockSetThemeMode,
    });

    const {result} = renderHook(() => useThemeColors());

    expect(result.current.setThemeMode).toBeDefined();
    result.current.setThemeMode('dark');
    expect(mockSetThemeMode).toHaveBeenCalledWith('dark');
  });
});
