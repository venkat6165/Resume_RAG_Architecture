import { useUIStore } from '@/lib/stores/ui.store';
import { useIngestionStore } from '../stores/ingestion.store';
import { UploadDropzone } from './UploadDropzone';
import { UploadProgress } from './UploadProgress';
import { ingestionApi } from '../services/ingestion.api';

export function ResumeUploadModal() {
  const { isIngestionModalOpen, closeIngestionModal } = useUIStore();
  const {
    currentStep,
    progressPercentage,
    statusMessage,
    selectedFile,
    lastResult,
    setFile,
    setProgress,
    setResult,
    resetIngestion,
  } = useIngestionStore();

  if (!isIngestionModalOpen) return null;

  async function handleFileSelected(file: File) {
    setFile(file);
    const result = await ingestionApi.uploadAndIngest(file, (percent, msg) => {
      let stepName = 'uploading';
      if (percent > 20) stepName = 'processing_pdf';
      if (percent > 40) stepName = 'parsing_text';
      if (percent > 70) stepName = 'generating_embeddings';
      if (percent > 85) stepName = 'storing_mongodb';

      setProgress(stepName as any, percent, msg);
    });

    setResult(result);
  }

  function handleClose() {
    resetIngestion();
    closeIngestionModal();
  }

  const isIngesting = currentStep !== 'idle' && currentStep !== 'completed' && currentStep !== 'failed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-bg-surface border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
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
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary leading-tight">Ingest Resume PDF</h3>
              <p className="text-xs text-text-muted">Parse skills & generate vector embedding for search</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-text-muted hover:text-white hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        {currentStep === 'idle' && (
          <UploadDropzone onFileSelected={handleFileSelected} disabled={isIngesting} />
        )}

        {isIngesting && (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex items-center gap-3 p-3 bg-bg-card rounded-xl border border-white/5">
              <div className="h-10 w-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-xs uppercase">
                PDF
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text-primary truncate">{selectedFile?.name}</p>
                <p className="text-[11px] text-text-muted">
                  {selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB' : ''}
                </p>
              </div>
            </div>

            <UploadProgress step={currentStep} percentage={progressPercentage} message={statusMessage} />
          </div>
        )}

        {currentStep === 'completed' && lastResult && (
          <div className="flex flex-col gap-4 py-2">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex flex-col gap-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <span>✓ Resume Ingested Successfully!</span>
              </div>
              <p className="text-xs text-text-muted">
                Candidate is now stored in MongoDB Atlas and immediately searchable via Vector & BM25 search.
              </p>
              <div className="flex items-center gap-3 pt-2 text-xs text-emerald-300">
                <span>• 1024-dim Vector generated</span>
                <span>• {lastResult.extractedSkillsCount || 0} skills detected</span>
              </div>
            </div>

            <button
              onClick={resetIngestion}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-text-primary text-xs font-medium transition-colors"
            >
              Ingest Another Resume
            </button>
          </div>
        )}

        {currentStep === 'failed' && (
          <div className="flex flex-col gap-4 py-2">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex flex-col gap-1.5">
              <span className="text-red-400 font-semibold text-sm">❌ Ingestion Failed</span>
              <p className="text-xs text-text-muted">{lastResult?.error || 'Failed to process resume'}</p>
            </div>
            <button
              onClick={resetIngestion}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
