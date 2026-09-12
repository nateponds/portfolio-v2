'use client';

import { useEffect, useRef, useState } from 'react';
import { SkyBackground } from '@/components/sky-background';
import {
  initialProjects,
  projectStacks,
  site,
  statusMeta,
  technologies,
} from '@/content/site';

function GridIcon({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <rect x="1" y="1" width="5" height="5" rx="1" fill="currentColor" />
      <rect x="8" y="1" width="5" height="5" rx="1" fill="currentColor" />
      <rect x="1" y="8" width="5" height="5" rx="1" fill="currentColor" />
      <rect x="8" y="8" width="5" height="5" rx="1" fill="currentColor" />
    </svg>
  );
}

function GitHubIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.341-3.369-1.341-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}

function MailIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M4 7L12 13L20 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 10V17M11 17V13.25C11 11.75 11.9 10.75 13.25 10.75C14.7 10.75 15.5 11.7 15.5 13.45V17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="7" cy="7" r="1.25" fill="currentColor" />
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6.6 4.8L8.9 4.25C9.6 4.08 10.3 4.44 10.58 5.1L11.55 7.36C11.8 7.95 11.65 8.63 11.16 9.05L9.95 10.09C10.76 11.83 12.17 13.24 13.91 14.05L14.95 12.84C15.37 12.35 16.05 12.2 16.64 12.45L18.9 13.42C19.56 13.7 19.92 14.4 19.75 15.1L19.2 17.4C19.04 18.07 18.44 18.55 17.75 18.55C10.98 18.55 5.45 13.02 5.45 6.25C5.45 5.56 5.93 4.96 6.6 4.8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Navigation() {
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

  const links = [
    ['hero', 'Home'],
    ['about', 'About'],
    ['projects', 'Projects'],
    ['contact', 'Contact'],
  ];

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

function Reveal({ as: Element = 'div', className = '', delay = 0, children, ...props }) {
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

function Hero() {
  return (
    <section id="hero" className="hero-section" aria-labelledby="hero-name">
      <div className="hero-content">
        <p className="hero-eyebrow">
          {site.heroEyebrow} <span>{site.heroEyebrowSuffix}</span>
        </p>
        <h1 id="hero-name">{site.heading}</h1>
        <p className="hero-role">
          <strong>SysAdmin &amp; DevSecOps</strong> · Computer Science
        </p>
        <p className="hero-tagline">{site.description}</p>
        <div className="hero-buttons">
          <a href="#projects" className="hero-btn btn-primary">
            <GridIcon />
            Projects
          </a>
          <a
            href={site.githubRepository}
            className="hero-btn btn-secondary"
            target="_blank"
            rel="noreferrer"
          >
            <GitHubIcon size={14} />
            View my code on GitHub
          </a>
          <a href="#contact" className="hero-btn btn-secondary">
            <MailIcon size={14} />
            Contact Me
          </a>
        </div>
      </div>
      <div className="hero-symbols" aria-hidden="true">
        <span className="ps-sym sym-t">△</span>
        <span className="ps-sym sym-o">○</span>
        <span className="ps-sym sym-x">✕</span>
        <span className="ps-sym sym-s">□</span>
      </div>
      <div className="hero-scroll" aria-hidden="true">
        <div className="scroll-line" />
        <span>Scroll</span>
      </div>
    </section>
  );
}

function Terminal() {
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

function StackCarousel() {
  const items = [...technologies, ...technologies];
  return (
    <section className="stack-showcase" aria-labelledby="stack-title">
      <div className="stack-showcase-header">
        <p className="section-kicker">{site.stack.kicker}</p>
        <h3 id="stack-title">{site.stack.title}</h3>
      </div>
      <div className="stack-carousel" aria-label="Technology stack carousel">
        <div className="stack-track">
          {items.map((stack, index) => (
            <article className="stack-item" key={`${stack.name}-${index}`}>
              <img
                src={stack.icon}
                alt={`${stack.name} logo`}
                loading="lazy"
                className={stack.inverted ? 'stack-icon-inverted' : ''}
              />
              <span>{stack.name}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="page-section about-section" aria-labelledby="about-title">
      <div className="section-container">
        <p className="section-kicker">{site.about.kicker}</p>
        <div className="about-grid">
          <div className="about-copy">
            <h2 id="about-title">
              {site.about.titleLead} <span>{site.about.titleAccent}</span>
            </h2>
            {site.about.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <div className="about-actions">
              <a href="#projects" className="about-link">
                View projects
              </a>
              <a
                href={site.githubProfile}
                className="about-link about-link-muted"
                target="_blank"
                rel="noreferrer"
              >
                GitHub profile
              </a>
            </div>
          </div>
          <Terminal />
        </div>
        <StackCarousel />
        <div className="about-focus-grid" aria-label="Technical focus areas">
          {site.focusAreas.map((area) => (
            <article className="about-card" key={area.number}>
              <span className="about-card-number">{area.number}</span>
              <h3>{area.title}</h3>
              <p>{area.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function useProjects() {
  const [projects, setProjects] = useState(initialProjects);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      try {
        const response = await fetch('/api/project-statuses', {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(String(response.status));
        const statuses = await response.json();
        if (active) {
          setProjects(
            initialProjects.map((project) => ({
              ...project,
              status: statuses[project.number] ?? project.status,
            })),
          );
        }
      } catch {
        if (active) setProjects(initialProjects);
      } finally {
        clearTimeout(timeout);
      }
    };
    refresh();
    const timer = setInterval(refresh, 300000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return projects;
}

function ProjectCard({ project }) {
  const meta = statusMeta[project.status] || statusMeta.yellow;
  return (
    <Reveal as="article" className="project-row" delay={160}>
      <div className="project-visual has-image">
        <img
          src={project.image}
          alt={project.imageAlt || `${project.name} project preview`}
          loading="lazy"
        />
      </div>
      <div className="project-card">
        <span className="project-number">{project.number}</span>
        <h3>{project.name}</h3>
        <p>{project.description}</p>
        <div className="project-stack-tags" aria-label="Technology stack">
          {project.stacks.map((name) => (
            <span
              className={`project-stack-tag ${projectStacks.find((stack) => stack.name.toLowerCase() === name.toLowerCase())?.className || 'stack-default'}`}
              key={name}
            >
              {name}
            </span>
          ))}
        </div>
        <div className="project-card-footer">
          {meta.available ? (
            <a
              href={project.url}
              className="project-link"
              target="_blank"
              rel="noreferrer"
            >
              View Project
            </a>
          ) : (
            <span className="project-link project-link-disabled" aria-disabled="true">
              Unavailable
            </span>
          )}
          <span className="status-badge">
            <span className={`status-dot ${meta.dot}`} aria-hidden="true" />
            {project.statusLabel || meta.label}
          </span>
        </div>
      </div>
    </Reveal>
  );
}

function Projects({ projects }) {
  const visible = projects.filter((project) => project.featured).slice(0, 4);
  return (
    <section id="projects" className="page-section projects-section" aria-labelledby="projects-title">
      <div className="section-container">
        <Reveal className="projects-heading">
          <p className="section-kicker">{site.projectsKicker}</p>
          <h2 id="projects-title">{site.projectsTitle}</h2>
        </Reveal>
        <div className="projects-list" aria-label="Featured projects">
          {visible.map((project) => (
            <ProjectCard project={project} key={project.number} />
          ))}
        </div>
        <Reveal className="projects-actions" delay={160}>
          <span className="project-link projects-more-link project-link-disabled">
            More Projects Coming Soon
          </span>
        </Reveal>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <footer id="contact" className="site-footer" aria-labelledby="contact-title">
      <div className="section-container contact-container">
        <div className="contact-heading">
          <p className="contact-kicker">{site.contact.kicker}</p>
          <h2 id="contact-title">
            {site.contact.titleLead} <span>{site.contact.titleAccent}</span>
            <br />
            {site.contact.titleSecondLead} <span>{site.contact.titleSecondAccent}</span>
          </h2>
          <p>{site.contact.description}</p>
        </div>
        <div className="contact-layout">
          <div className="contact-primary">
            <div className="contact-circle-mark" aria-hidden="true" />
            <span className="contact-label">{site.contact.availability}</span>
            <a className="contact-email" href={`mailto:${site.email}`}>
              <MailIcon />
              {site.email}
            </a>
            <p>{site.contact.emailNote}</p>
          </div>
          <div className="contact-methods" aria-label="Contact links">
            <a
              className="contact-method"
              href={site.githubProfile}
              target="_blank"
              rel="noreferrer"
            >
              <GitHubIcon />
              <span>
                <strong>GitHub</strong>
                <small>{site.contact.githubLabel}</small>
              </span>
            </a>
            <a
              className="contact-method contact-method-muted"
              href={site.linkedin}
              target="_blank"
              rel="noreferrer"
            >
              <LinkedInIcon />
              <span>
                <strong>LinkedIn</strong>
                <small>{site.contact.linkedinLabel}</small>
              </span>
            </a>
            <a className="contact-method" href={site.phoneHref}>
              <PhoneIcon />
              <span>
                <strong>Phone</strong>
                <small>{site.phone}</small>
              </span>
            </a>
          </div>
        </div>
        <div className="contact-bottom">
          <div className="contact-legal">
            <p>{site.footer.copyright}</p>
            <p>{site.footer.credit}</p>
          </div>
          <a className="contact-top-link" href="#hero">
            <span>Back to top</span>
            <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  const projects = useProjects();

  return (
    <>
      <SkyBackground />
      <Navigation />
      <div id="content">
        <Hero />
        <main>
          <About />
          <Projects projects={projects} />
        </main>
        <Contact />
      </div>
    </>
  );
}
