import type { EducationItem } from '@/types/candidate.types';

interface EducationSectionProps {
  education?: EducationItem[];
}

export function EducationSection({ education }: EducationSectionProps) {
  if (!education || education.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 py-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Education</h3>
      <div className="flex flex-col gap-2">
        {education.map((edu, idx) => {
          // Format degree cleanly if it starts with lower-case raw fragment
          const degreeText = edu.degree ? edu.degree.replace(/^be\)\.\s*/i, 'Bachelor of Engineering (B.E.) - ') : 'Education Record';

          return (
            <div key={idx} className="flex items-start justify-between p-3 bg-bg-card rounded-xl border border-white/5 text-xs">
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-semibold text-text-primary leading-relaxed">{degreeText}</span>
                {edu.institution && <span className="text-text-muted mt-0.5">{edu.institution}</span>}
              </div>
              {edu.year && <span className="text-[10px] text-text-muted font-mono shrink-0 ml-3">{edu.year}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
