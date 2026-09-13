import { site } from '@/content/site';
import { StackCarousel } from '@/components/stack-carousel';
import { Terminal } from '@/components/terminal';

export function About() {
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
