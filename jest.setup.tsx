import '@testing-library/jest-dom';
import React from 'react';

// ──────────────────────────────────────────────────────────────────────────
// Polyfills + mocks for jsdom that components depend on at import time.
// ──────────────────────────────────────────────────────────────────────────

// motion/react is heavy and not test-relevant — substitute plain elements.
jest.mock('motion/react', () => {
  const passthrough = (tag: string) =>
    function MotionTag({
      children,
      whileHover: _wh,
      whileInView: _wv,
      whileTap: _wt,
      initial: _i,
      animate: _a,
      exit: _e,
      transition: _t,
      viewport: _v,
      ...props
    }: Record<string, unknown> & { children?: React.ReactNode }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return React.createElement(tag, props as any, children as React.ReactNode);
    };
  const motion = new Proxy(
    {},
    {
      get: (_target, prop: string) => passthrough(prop),
    },
  );
  const AnimatePresence = ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children);
  return { motion, AnimatePresence, useScroll: () => ({ scrollYProgress: 0 }), useSpring: (v: unknown) => v };
});

// next/navigation pieces components reach for during render.
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), refresh: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

// next/cache helpers used by server components — return the inner fn.
jest.mock('next/cache', () => ({
  unstable_cache: <T,>(fn: T) => fn,
  revalidateTag: jest.fn(),
  revalidatePath: jest.fn(),
}));

// IntersectionObserver — referenced by motion's `whileInView` + Gallery.
class MockIntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  takeRecords = () => [];
  root = null;
  rootMargin = '';
  thresholds: number[] = [];
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});
Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// matchMedia — referenced by next-themes / responsive hooks.
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }),
  });
}

// scrollIntoView — jsdom doesn't implement it.
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (Element.prototype as any).scrollIntoView = jest.fn();
}
