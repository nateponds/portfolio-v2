'use client';

import { useEffect, useState } from 'react';

const links = [
  ['hero', 'Home'],
  ['about', 'About'],
  ['projects', 'Projects'],
  ['contact', 'Contact'],
];

export function Navigation() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () =>
      setScrolled(window.scrollY > Math.max(120, window.innerHeight * 0.65));
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <nav
      className={`site-nav${open ? ' menu-open' : ''}${scrolled ? ' is-scrolled' : ''}`}
      aria-label="Primary navigation"
    >
      <a className="site-logo" href="#hero" aria-label="Nathaniel Ponce Home">
        <img src="/assets/portfolio/logo.png" alt="Nathaniel Ponce Logo" />
      </a>
      <button
        className="nav-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="primary-nav-links"
        aria-label={`${open ? 'Close' : 'Open'} navigation menu`}
        onClick={() => setOpen((current) => !current)}
      >
        <span />
        <span />
        <span />
      </button>
      <div className="nav-link-container" id="primary-nav-links">
        <ul>
          {links.map(([id, label]) => (
            <li key={id}>
              <a className="nav-button" href={`#${id}`} onClick={() => setOpen(false)}>
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
