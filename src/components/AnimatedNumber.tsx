'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Count-up animation for KPIs. Inspired by 21st.dev "NumberTicker" pattern —
 * tweens from 0 to `value` on mount using requestAnimationFrame. No
 * motion library needed.
 */
export default function AnimatedNumber({
  value,
  duration = 1200,
  className,
  prefix = '',
  suffix = '',
}: {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);
  const start = useRef<number | null>(null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    start.current = null;
    const step = (t: number) => {
      if (start.current === null) start.current = t;
      const elapsed = t - start.current;
      const progress = Math.min(1, elapsed / duration);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) {
        raf.current = requestAnimationFrame(step);
      }
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}
