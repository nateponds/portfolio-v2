'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { SkyBackground } from '@/components/sky-background';

const BOOT_TIMEOUT_MS = 10000;
const REVEAL_FALLBACK_MS = 850;

let bootDeadline = 0;

export function SiteShell({ children }) {
  const [booting, setBooting] = useState(true);
  const [revealed, setRevealed] = useState(false);

  function finishBoot() {
    setBooting(false);
  }

  useEffect(() => {
    bootDeadline ||= Date.now() + BOOT_TIMEOUT_MS;
    const timeout = window.setTimeout(finishBoot, Math.max(0, bootDeadline - Date.now()));
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (booting) return undefined;
    const fallback = window.setTimeout(() => setRevealed(true), REVEAL_FALLBACK_MS);
    return () => window.clearTimeout(fallback);
  }, [booting]);

  useEffect(() => {
    if (!revealed) return;
    document.documentElement.dataset.appReady = 'true';
  }, [revealed]);

  return (
    <>
      <SkyBackground onReady={finishBoot} onError={finishBoot} />
      <div
        className={`boot-veil${booting ? '' : ' is-gone'}`}
        role="status"
        aria-live="polite"
        aria-busy={booting}
        aria-hidden={booting ? undefined : true}
        onTransitionEnd={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.propertyName !== 'opacity') return;
          setRevealed(true);
        }}
      >
        <p className="boot-veil-label">Preparing the sky</p>
        <div className="boot-veil-inner">
          <Image className="boot-veil-mark" src="/assets/portfolio/logo.png" alt="" width={48} height={48} priority />
          <span className="boot-veil-line" />
        </div>
      </div>
      <div inert={revealed ? undefined : true}>{children}</div>
    </>
  );
}
