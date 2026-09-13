'use client';

import { useEffect, useRef, useState } from 'react';

export function Reveal({ as: Element = 'div', className = '', delay = 0, children, ...props }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    ) {
      const frame = window.requestAnimationFrame(() => setVisible(true));
      return () => window.cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Element
      ref={ref}
      className={`reveal ${className}${visible ? ' reveal-visible' : ''}`}
      style={{ '--reveal-delay': `${delay}ms` }}
      {...props}
    >
      {children}
    </Element>
  );
}
