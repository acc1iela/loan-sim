import '@testing-library/jest-dom/vitest';
import { beforeEach, vi } from 'vitest';

// jsdom は window.matchMedia を実装していないため stub する
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// テスト間の localStorage 汚染を防ぐ
beforeEach(() => {
  localStorage.clear();
});
