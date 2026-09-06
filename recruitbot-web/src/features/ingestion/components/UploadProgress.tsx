import type { IngestionStep } from '@/types/ingestion.types';

interface UploadProgressProps {
  step: IngestionStep;
  percentage: number;
  message: string;
}

const stepsList = [
  { id: 'uploading', label: 'PDF Upload' },
  { id: 'processing_pdf', label: 'Text Extraction' },
  { id: 'parsing_text', label: 'Skills Detection' },
  { id: 'generating_embeddings', label: 'Mistral Embedding' },
  { id: 'storing_mongodb', label: 'MongoDB Ingestion' },
];

export function UploadProgress({ percentage, message }: UploadProgressProps) {
  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="flex items-center justify-between text-xs font-medium">
        <span className="text-indigo-300">{message}</span>
        <span className="text-text-muted">{percentage}%</span>
      </div>

      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden relative">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="grid grid-cols-5 gap-1 pt-2">
        {stepsList.map((s, idx) => {
          const stepPercent = (idx + 1) * 20;
          const isComplete = percentage >= stepPercent;
          const isActive = percentage >= stepPercent - 20 && percentage < stepPercent;

          return (
            <div key={s.id} className="flex flex-col items-center gap-1 text-center">
              <div
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  isComplete
                    ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                    : isActive
                    ? 'bg-indigo-400 animate-ping'
                    : 'bg-white/15'
                }`}
              />
              <span
                className={`text-[10px] truncate max-w-full ${
                  isComplete ? 'text-emerald-300 font-medium' : isActive ? 'text-indigo-300' : 'text-text-muted'
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
