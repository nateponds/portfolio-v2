'use client';

import { useEffect, useState } from 'react';
import { initialProjects } from '@/content/site';

export function useProjects() {
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
