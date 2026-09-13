import { site } from '@/content/site';
import { GitHubIcon, GridIcon, MailIcon } from '@/components/icons';

function Rise({ delay, className = '', children }) {
  return (
    <span className={`hero-rise${className ? ` ${className}` : ''}`} style={{ '--hero-rise-delay': `${delay}ms` }}>
      <span className="hero-rise-inner">{children}</span>
    </span>
  );
}

export function Hero() {
  return (
    <section id="hero" className="hero-section" aria-labelledby="hero-name">
      <div className="hero-content">
        <p className="hero-eyebrow">
          <Rise delay={120}>{site.heroEyebrow}</Rise>
          {' '}
          <Rise delay={200} className="hero-eyebrow-suffix">
            {site.heroEyebrowSuffix}
          </Rise>
        </p>
        <h1 id="hero-name" aria-label={site.heading}>
          <Rise delay={0}>{site.heading}</Rise>
        </h1>
        <p className="hero-role">
          <Rise delay={280}>
            <strong>SysAdmin & DevSecOps</strong>
            <span className="hero-role-sep"> · </span>
            Computer Science
          </Rise>
        </p>
        <p className="hero-tagline">
          <Rise delay={360}>{site.description}</Rise>
        </p>
        <div className="hero-buttons is-in">
          <span className="hero-btn-rise" style={{ '--hero-rise-delay': '520ms' }}>
            <a href="#projects" className="hero-btn btn-primary">
              <GridIcon />
              Projects
            </a>
          </span>
          <span className="hero-btn-rise" style={{ '--hero-rise-delay': '610ms' }}>
            <a
              href={site.githubRepository}
              className="hero-btn btn-secondary"
              target="_blank"
              rel="noreferrer"
            >
              <GitHubIcon size={14} />
              View my code on GitHub
            </a>
          </span>
          <span className="hero-btn-rise" style={{ '--hero-rise-delay': '700ms' }}>
            <a href="#contact" className="hero-btn btn-secondary">
              <MailIcon size={14} />
              Contact Me
            </a>
          </span>
        </div>
      </div>
    </section>
  );
}
