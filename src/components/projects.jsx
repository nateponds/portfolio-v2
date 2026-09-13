'use client';

import Image from 'next/image';
import { projectStacks, site, statusMeta } from '@/content/site';
import { Reveal } from '@/components/reveal';
import { useProjects } from '@/hooks/use-projects';

function ProjectCard({ project }) {
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

export function Projects() {
  const projects = useProjects();
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
