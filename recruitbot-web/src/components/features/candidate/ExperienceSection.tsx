import type { ExperienceItem } from '@/types/candidate.types';

interface ExperienceSectionProps {
  experience?: ExperienceItem[];
  experienceSummary?: string;
}

export function ExperienceSection({ experience, experienceSummary }: ExperienceSectionProps) {
  const hasItems = experience && experience.length > 0;
  if (!hasItems && !experienceSummary) return null;

  return (
    <div className="flex flex-col gap-2.5 py-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Work Experience</h3>

      {experienceSummary && (
        <p className="text-xs text-text-primary bg-bg-card p-3 rounded-xl border border-white/5 leading-relaxed">
          {experienceSummary}
        </p>
      )}

      {hasItems && (
        <div className="flex flex-col gap-3 pl-2 border-l-2 border-primary/30">
          {experience!.map((item, idx) => (
            <div key={idx} className="flex flex-col gap-1 pl-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-primary">{item.title}</span>
                {item.duration && <span className="text-[10px] text-text-muted font-mono">{item.duration}</span>}
              </div>
              {item.company && <span className="text-xs text-indigo-300 font-medium">{item.company}</span>}
              {item.description && <p className="text-xs text-text-muted leading-relaxed mt-1">{item.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
