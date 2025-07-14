// Minimal TransformStream polyfill for Jest (Node)
if (typeof global.TransformStream === 'undefined') {
  // @ts-expect-error
  global.TransformStream = class {
    constructor() { }
  };
}

if (typeof global.BroadcastChannel === 'undefined') {
  // @ts-expect-error
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

// Extend expect for jest-axe
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): R;
    }
  }
}