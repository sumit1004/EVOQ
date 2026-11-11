import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';

if (typeof window !== 'undefined') {
  window.scrollTo = () => {};
  window.matchMedia = window.matchMedia || function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
      addEventListener: function () {},
      removeEventListener: function () {},
      dispatchEvent: function () { return false; },
    };
  };
}

vi.mock('axios', () => {
  const instance = {
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    get: vi.fn().mockResolvedValue({ data: { success: true, data: {} } }),
    post: vi.fn().mockResolvedValue({ data: { success: true, data: {} } }),
    put: vi.fn().mockResolvedValue({ data: { success: true, data: {} } }),
    patch: vi.fn().mockResolvedValue({ data: { success: true, data: {} } }),
    delete: vi.fn().mockResolvedValue({ data: { success: true, data: {} } }),
  };
  return {
    default: {
      create: vi.fn(() => instance),
      ...instance,
    },
  };
});

beforeEach(() => {
  if (typeof window !== 'undefined') {
    localStorage.clear();
  }
});

