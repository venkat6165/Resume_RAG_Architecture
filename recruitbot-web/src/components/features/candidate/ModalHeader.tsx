interface ModalHeaderProps {
  name: string;
  role?: string;
  company?: string;
  onClose: () => void;
}

export function ModalHeader({ name, role, company, onClose }: ModalHeaderProps) {
  // Clean up role string if it contains bullet points or long raw sentences
  const formattedRole = role ? role.replace(/\s*•\s*/g, ' ').trim() : undefined;
  const formattedCompany = company && company !== role ? company.replace(/\s*•\s*/g, ' ').trim() : undefined;

  return (
    <div className="sticky top-0 z-10 bg-bg-surface/95 backdrop-blur-md pb-4 pt-1 border-b border-white/10 flex items-start justify-between gap-4">
      <div className="flex flex-col min-w-0 flex-1">
        <h2 className="text-xl font-bold text-text-primary leading-tight tracking-tight">{name}</h2>
        {formattedRole && (
          <p className="text-xs font-medium text-indigo-300 mt-1 leading-snug line-clamp-2">
            {formattedRole}
          </p>
        )}
        {formattedCompany && (
          <p className="text-[11px] text-text-muted mt-0.5 truncate">
            {formattedCompany}
          </p>
        )}
      </div>

      <button
        onClick={onClose}
        className="h-9 w-9 rounded-full bg-white/5 hover:bg-white/15 text-text-muted hover:text-white flex items-center justify-center transition-colors shrink-0"
        aria-label="Close Modal"
      >
        ✕
      </button>
    </div>
  );
}
