// Minimal TransformStream polyfill for Jest (Node)
if (typeof global.TransformStream === 'undefined') {
  // @ts-expect-error in Node.js, TransformStream is not available
  // This is a minimal polyfill for testing purposes
  global.TransformStream = class {
    constructor() { }
  };
}

if (typeof global.BroadcastChannel === 'undefined') {
  // @ts-expect-error in Node.js, BroadcastChannel is not available
  // This is a minimal polyfill for testing purposes
  global.BroadcastChannel = class <T = unknown> {
    name: string;
    onmessage: ((event: MessageEvent<T>) => void) | null = null;
    constructor(name: string) {
      this.name = name;
    }
    postMessage() { }
    close() { }
    addEventListener() { }
    removeEventListener() { }
  };
}
import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';
import 'whatwg-fetch';

// Polyfill for TextEncoder and TextDecoder in Node.js < 18
import { TextEncoder, TextDecoder } from 'util';

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder as typeof global.TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder as typeof global.TextDecoder;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): R;
    }
  }
}