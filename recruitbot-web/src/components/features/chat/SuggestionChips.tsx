interface SuggestionChipsProps {
  onSelectQuery: (query: string) => void;
}

const suggestions = [
  { label: '🔍 Selenium QA 3 yrs', query: 'Selenium automation engineer 3 years experience' },
  { label: '🐍 Python ML dev', query: 'Python developer with machine learning and NLP experience' },
  { label: '☁️ Java AWS backend', query: 'Java backend developer with AWS cloud and Microservices' },
  { label: '⚡ Lead QA Cypress', query: 'Lead QA engineer with Cypress, API automation and CI/CD' },
];

export function SuggestionChips({ onSelectQuery }: SuggestionChipsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 py-3 px-4">
      {suggestions.map((chip, idx) => (
        <button
          key={idx}
          onClick={() => onSelectQuery(chip.query)}
          className="py-1.5 px-3 rounded-full bg-bg-card border border-white/10 hover:border-primary/50 hover:bg-primary/10 text-text-muted hover:text-text-primary text-xs font-medium transition-all duration-200 shadow-sm"
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
