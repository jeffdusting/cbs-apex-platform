/**
 * Jest Test Setup Configuration
 */

import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { TestSetup } from './utils/test-factories';

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Setup DOM environment
TestSetup.setupDOMEnvironment();

// Allow console output for debugging during development
// Uncomment below to mock console methods if needed for specific tests
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn()
// };

// Mock fetch globally (but can be overridden by individual tests)
global.fetch = jest.fn();

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock WebSocket
const MockWebSocket = jest.fn().mockImplementation(() => ({
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  readyState: 1
})) as any;

MockWebSocket.CONNECTING = 0;
MockWebSocket.OPEN = 1;
MockWebSocket.CLOSING = 2;
MockWebSocket.CLOSED = 3;

(global as any).WebSocket = MockWebSocket;

// Clean up after each test
afterEach(() => {
  TestSetup.cleanupAfterTest();
});