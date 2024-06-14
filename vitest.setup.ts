import '@testing-library/jest-dom/vitest';

import { cleanup, configure } from '@testing-library/react';
import { afterEach, expect, vitest } from 'vitest';

// @ts-ignore
global.expect = expect;

configure({ testIdAttribute: 'data-test' });

afterEach(() => {
  cleanup();
});

const observe = vitest.fn();
const unobserve = vitest.fn();
const disconnect = vitest.fn();

// @ts-ignore
window.IntersectionObserver = vitest.fn(() => ({
  observe,
  unobserve,
  disconnect,
}));
