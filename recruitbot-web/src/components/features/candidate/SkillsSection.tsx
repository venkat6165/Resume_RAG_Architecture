interface SkillsSectionProps {
  skills?: string[];
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  if (!skills || skills.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 py-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Skills & Competencies</h3>
      <div className="flex flex-wrap gap-1.5">
        {skills.map((skill, idx) => (
          <span
            key={idx}
            className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 text-xs font-medium border border-indigo-500/20"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
