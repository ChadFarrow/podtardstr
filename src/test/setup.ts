import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation((_callback) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation((_callback) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock fetch for relative URLs in test environment
const originalFetch = global.fetch;
global.fetch = vi.fn().mockImplementation((input, init) => {
  // If it's a relative URL starting with /api/, mock it
  if (typeof input === 'string' && input.startsWith('/api/')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ status: 'true', feeds: [] }),
      text: () => Promise.resolve('<?xml version="1.0"?><rss></rss>'),
    } as Response);
  }
  
  // For absolute URLs, use the original fetch
  return originalFetch(input, init);
});