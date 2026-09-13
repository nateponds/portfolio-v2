import Image from 'next/image';
import { projectStacks, statusMeta } from '@/content/site';
import { Reveal } from '@/components/reveal';

export function ProjectCard({ project }) {
  const meta = statusMeta[project.status] || statusMeta.yellow;
  return (
    <Reveal as="article" className="project-row" delay={160}>
      <div className="project-visual has-image">
        <Image
          src={project.image}
          alt={project.imageAlt || `${project.name} project preview`}
          loading="lazy"
          decoding="async"
          width={project.imageWidth || 1600}
          height={project.imageHeight || 960}
          sizes="(max-width: 760px) 100vw, 60vw"
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
