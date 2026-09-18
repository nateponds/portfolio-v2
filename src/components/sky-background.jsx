'use client';

import { useEffect, useRef } from 'react';

// React owns the canvases; Three.js owns everything drawn inside them.
export function SkyBackground({ onReady, onError }) {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);
  onReadyRef.current = onReady;
  onErrorRef.current = onError;

  useEffect(() => {
    const controller = new AbortController();
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    let active = true;
    let dispose;

    async function mount() {
      try {
        const { startScene } = await import('@/lib/sky/experience');
        if (!active || controller.signal.aborted) return;
        const cleanup = await startScene(canvas, controller.signal, overlay, () => {
          if (active) onReadyRef.current?.();
        });
        if (!active || controller.signal.aborted) cleanup();
        else dispose = cleanup;
      } catch (error) {
        if (!active || controller.signal.aborted) return;
        console.error('Sky background could not start:', error);
        canvas.hidden = true;
        overlay.hidden = true;
        onErrorRef.current?.();
      }
    }

    mount();
    return () => {
      active = false;
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
