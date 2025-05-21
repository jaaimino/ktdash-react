// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock SWR hooks
jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
  })),
  headers: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});