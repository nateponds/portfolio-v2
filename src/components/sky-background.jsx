'use client';

import { useEffect, useRef } from 'react';

// React owns the canvas; Three.js owns everything drawn inside it.
export function SkyBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    const canvas = canvasRef.current;
    let dispose;

    async function mount() {
      try {
        const { startScene } = await import('@/lib/sky/experience');
        if (controller.signal.aborted) return;
        const cleanup = await startScene(canvas, controller.signal);
        if (controller.signal.aborted) cleanup();
        else dispose = cleanup;
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('Sky background could not start:', error);
        canvas.hidden = true;
      }
    }

    mount();
    return () => {
      controller.abort();
      dispose?.();
    };
  }, []);

  return <canvas ref={canvasRef} id="sky" aria-hidden="true" />;
}
