/**
 * Jest Setup File
 */

// Mock global objects
global.console = {
  ...console,
  // Uncomment to ignore console.log during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Mock window.ethereum
global.window = {
  ethereum: {
    request: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
  },
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Mock performance
global.performance = {
  now: jest.fn(() => Date.now()),
};

// Set test timeout
jest.setTimeout(10000);
