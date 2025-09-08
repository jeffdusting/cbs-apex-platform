// Jest type declarations
/// <reference types="jest" />

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValid(): R;
    }
  }
}

export {};