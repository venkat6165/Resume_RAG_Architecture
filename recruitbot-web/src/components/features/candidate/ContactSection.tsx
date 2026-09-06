interface ContactSectionProps {
  email?: string;
  phone?: string;
  location?: string;
}

export function ContactSection({ email, phone, location }: ContactSectionProps) {
  if (!email && !phone && !location) return null;

  return (
    <div className="flex flex-wrap gap-3 py-3">
      {email && (
        <div className="flex items-center gap-2.5 px-3 py-2 bg-bg-card rounded-xl border border-white/5 text-xs flex-1 min-w-[220px]">
          <span className="text-base shrink-0">✉️</span>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[10px] text-text-muted uppercase font-semibold tracking-wider">Email</span>
            <a
              href={`mailto:${email}`}
              className="text-text-primary hover:text-indigo-300 font-medium break-all select-all transition-colors"
            >
              {email}
            </a>
          </div>
        </div>
      )}

      {phone && (
        <div className="flex items-center gap-2.5 px-3 py-2 bg-bg-card rounded-xl border border-white/5 text-xs flex-1 min-w-[180px]">
          <span className="text-base shrink-0">📞</span>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[10px] text-text-muted uppercase font-semibold tracking-wider">Phone</span>
            <a
              href={`tel:${phone}`}
              className="text-text-primary hover:text-indigo-300 font-medium select-all transition-colors"
            >
              {phone}
            </a>
          </div>
        </div>
      )}

      {location && (
        <div className="flex items-center gap-2.5 px-3 py-2 bg-bg-card rounded-xl border border-white/5 text-xs flex-1 min-w-[160px]">
          <span className="text-base shrink-0">📍</span>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[10px] text-text-muted uppercase font-semibold tracking-wider">Location</span>
            <span className="text-text-primary font-medium">{location}</span>
          </div>
        </div>
      )}
    </div>
  );
}
