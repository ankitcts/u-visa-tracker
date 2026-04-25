import React from 'react';

// Drop motion props but render the underlying tag so tests can query
// children + attributes normally.
const STRIPPED = new Set([
  'whileHover',
  'whileInView',
  'whileTap',
  'whileFocus',
  'initial',
  'animate',
  'exit',
  'transition',
  'viewport',
  'layout',
  'layoutId',
  'drag',
]);

function makeMotionTag(tag: string) {
  return function MotionTag({
    children,
    ...rawProps
  }: Record<string, unknown> & { children?: React.ReactNode }) {
    const props: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(rawProps)) {
      if (!STRIPPED.has(k)) props[k] = v;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return React.createElement(tag, props as any, children as React.ReactNode);
  };
}

export const motion = new Proxy(
  {},
  { get: (_t, prop: string) => makeMotionTag(prop) },
);

export const AnimatePresence = ({
  children,
}: {
  children: React.ReactNode;
}) => <>{children}</>;

export const useScroll = () => ({ scrollYProgress: { get: () => 0 } });
export const useSpring = (v: unknown) => v;
export const useMotionValue = (v: unknown) => v;
