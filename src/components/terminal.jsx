'use client';

import { useEffect, useRef, useState } from 'react';
import { site } from '@/content/site';

export function Terminal() {
  const [lines, setLines] = useState([]);
  const ref = useRef(null);
  const played = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const timers = new Set();
    const wait = (milliseconds) =>
      new Promise((resolve) => {
        const timer = setTimeout(() => {
          timers.delete(timer);
          resolve();
        }, milliseconds);
        timers.add(timer);
      });
    const type = async (lineIndex, field, text, speed) => {
      for (const character of text) {
        if (cancelled) return;
        setLines((current) =>
          current.map((line, index) =>
            index === lineIndex
              ? { ...line, [field]: line[field] + character, typing: field }
              : line,
          ),
        );
        await wait(speed);
      }
      setLines((current) =>
        current.map((line, index) =>
          index === lineIndex ? { ...line, typing: null } : line,
        ),
      );
    };
    const play = async () => {
      if (played.current) return;
      played.current = true;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setLines(
          site.terminalLines.map(([command, output]) => ({
            command,
            output,
            typing: null,
          })),
        );
        return;
      }
      await wait(250);
      for (const [command, output] of site.terminalLines) {
        if (cancelled) return;
        const index = site.terminalLines.findIndex(([name]) => name === command);
        setLines((current) => [
          ...current,
          { command: '', output: '', typing: 'command' },
        ]);
        await type(index, 'command', command, 45);
        await wait(240);
        await type(index, 'output', output, 26);
        await wait(360);
      }
    };
    const node = ref.current;
    if (!('IntersectionObserver' in window)) play();
    else {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            play();
            observer.disconnect();
          }
        },
        { threshold: 0.3 },
      );
      if (node) observer.observe(node);
      return () => {
        cancelled = true;
        timers.forEach(clearTimeout);
        observer.disconnect();
      };
    }
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <aside ref={ref} className="about-terminal" aria-label="Current focus">
      <div className="terminal-topbar" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="terminal-body" id="about-terminal-output" aria-live="polite">
        {lines.map((line, index) => (
          <div key={site.terminalLines[index][0]}>
            <p className={`terminal-line${line.typing === 'command' ? ' terminal-caret' : ''}`}>
              <span>$</span> {line.command}
            </p>
            {(line.output || line.typing === 'output') && (
              <p className={`terminal-output${line.typing === 'output' ? ' terminal-caret' : ''}`}>
                {line.output}
              </p>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
