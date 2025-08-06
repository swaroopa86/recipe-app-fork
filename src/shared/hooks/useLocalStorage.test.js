import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('useLocalStorage Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns initial value when localStorage is empty', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));
    
    expect(result.current[0]).toBe('defaultValue');
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('testKey');
  });

  test('returns stored value from localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify('storedValue'));
    
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));
    
    expect(result.current[0]).toBe('storedValue');
  });

  test('sets value in localStorage when state is updated', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));
    
    act(() => {
      result.current[1]('newValue');
    });
    
    expect(result.current[0]).toBe('newValue');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('testKey', JSON.stringify('newValue'));
  });

  test('handles arrays correctly', () => {
    const testArray = [1, 2, 3];
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testArray));
    
    const { result } = renderHook(() => useLocalStorage('testKey', []));
    
    expect(result.current[0]).toEqual(testArray);
  });

  test('handles objects correctly', () => {
    const testObject = { name: 'test', value: 123 };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testObject));
    
    const { result } = renderHook(() => useLocalStorage('testKey', {}));
    
    expect(result.current[0]).toEqual(testObject);
  });

  test('handles custom serializer', () => {
    const customSerializer = {
      stringify: (value) => `custom:${JSON.stringify(value)}`,
      parse: (value) => JSON.parse(value.replace('custom:', ''))
    };
    
    mockLocalStorage.getItem.mockReturnValue('custom:{"name":"test"}');
    
    const { result } = renderHook(() => 
      useLocalStorage('testKey', {}, customSerializer)
    );
    
    expect(result.current[0]).toEqual({ name: 'test' });
    
    act(() => {
      result.current[1]({ name: 'updated' });
    });
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'testKey', 
      'custom:{"name":"updated"}'
    );
  });

  test('handles JSON parse errors gracefully', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid json');
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));
    
    expect(result.current[0]).toBe('defaultValue');
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  test('handles localStorage setItem errors gracefully', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));
    
    act(() => {
      result.current[1]('newValue');
    });
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
