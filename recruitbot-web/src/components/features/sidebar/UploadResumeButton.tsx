import { useUIStore } from '@/lib/stores/ui.store';

export function UploadResumeButton() {
  const { openIngestionModal } = useUIStore();

  return (
    <button
      onClick={openIngestionModal}
      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-medium text-xs shadow-md shadow-primary/20 transition-all duration-200"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      + Ingest New Resume PDF
    </button>
  );
}
