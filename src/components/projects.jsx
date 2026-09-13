'use client';

import { site } from '@/content/site';
import { ProjectCard } from '@/components/project-card';
import { Reveal } from '@/components/reveal';
import { useProjects } from '@/hooks/use-projects';

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
