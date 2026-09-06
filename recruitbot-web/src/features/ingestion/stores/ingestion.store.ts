import { create } from 'zustand';
import type { IngestionStep, IngestionResult } from '@/types/ingestion.types';

interface IngestionState {
  currentStep: IngestionStep;
  progressPercentage: number;
  statusMessage: string;
  selectedFile: File | null;
  lastResult: IngestionResult | null;
  setFile: (file: File | null) => void;
  setProgress: (step: IngestionStep, percentage: number, message: string) => void;
  setResult: (result: IngestionResult) => void;
  resetIngestion: () => void;
}

export const useIngestionStore = create<IngestionState>((set) => ({
  currentStep: 'idle',
  progressPercentage: 0,
  statusMessage: 'Ready to ingest resume',
  selectedFile: null,
  lastResult: null,
  setFile: (file: File | null) => set({ selectedFile: file, currentStep: 'idle', progressPercentage: 0, lastResult: null }),
  setProgress: (step: IngestionStep, percentage: number, message: string) =>
    set({ currentStep: step, progressPercentage: percentage, statusMessage: message }),
  setResult: (result: IngestionResult) => set({ lastResult: result, currentStep: result.success ? 'completed' : 'failed' }),
  resetIngestion: () => set({ currentStep: 'idle', progressPercentage: 0, statusMessage: 'Ready to ingest resume', selectedFile: null, lastResult: null }),
}));
