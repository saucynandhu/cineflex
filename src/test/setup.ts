import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock localStorage if it's not fully functional (e.g. in some Node versions)
if (typeof window !== 'undefined' && (!window.localStorage || typeof window.localStorage.getItem !== 'function')) {
  const store: Record<string, string> = {};
  const mockLocalStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(key => delete store[key]); },
    length: 0,
    key: (index: number) => Object.keys(store)[index] || null,
  };
  
  Object.defineProperty(window, 'localStorage', { value: mockLocalStorage, writable: true });
  vi.stubGlobal('localStorage', mockLocalStorage);
}
