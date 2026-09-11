'use client';

import { useEffect, useRef } from 'react';

// React owns the canvases; Three.js owns everything drawn inside them.
export function SkyBackground() {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    let dispose;

    async function mount() {
      try {
        const { startScene } = await import('@/lib/sky/experience');
        if (controller.signal.aborted) return;
        const cleanup = await startScene(canvas, controller.signal, overlay);
        if (controller.signal.aborted) cleanup();
        else dispose = cleanup;
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('Sky background could not start:', error);
        canvas.hidden = true;
        overlay.hidden = true;
      }
    }

    mount();
    return () => {
      controller.abort();
      dispose?.();
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} id="sky" aria-hidden="true" />
      <canvas ref={overlayRef} id="sky-bird" aria-hidden="true" />
    </>
  );
}
