import type { ProjectItem } from '@/types/candidate.types';

interface ProjectsSectionProps {
  projects?: ProjectItem[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  if (!projects || projects.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 py-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Projects</h3>
      <div className="flex flex-col gap-2">
        {projects.map((proj, idx) => (
          <div key={idx} className="flex flex-col gap-1 p-3 bg-bg-card rounded-xl border border-white/5 text-xs">
            <span className="font-semibold text-text-primary">{proj.title}</span>
            <p className="text-text-muted leading-relaxed">{proj.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
