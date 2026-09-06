interface CertificationsSectionProps {
  certifications?: string[];
}

export function CertificationsSection({ certifications }: CertificationsSectionProps) {
  if (!certifications || certifications.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 py-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Certifications</h3>
      <div className="flex flex-wrap gap-1.5">
        {certifications.map((cert, idx) => (
          <span
            key={idx}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 text-xs font-medium border border-emerald-500/20"
          >
            🏆 {cert}
          </span>
        ))}
      </div>
    </div>
  );
}
