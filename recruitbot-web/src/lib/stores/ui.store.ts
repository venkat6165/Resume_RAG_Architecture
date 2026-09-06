import { create } from 'zustand';

interface UIState {
  isMobileSidebarOpen: boolean;
  activeModalCandidateId: string | null;
  isIngestionModalOpen: boolean;
  toggleMobileSidebar: () => void;
  openCandidateModal: (candidateId: string) => void;
  closeCandidateModal: () => void;
  openIngestionModal: () => void;
  closeIngestionModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileSidebarOpen: false,
  activeModalCandidateId: null,
  isIngestionModalOpen: false,
  toggleMobileSidebar: () => set((s: UIState) => ({ isMobileSidebarOpen: !s.isMobileSidebarOpen })),
  openCandidateModal: (candidateId: string) => set({ activeModalCandidateId: candidateId }),
  closeCandidateModal: () => set({ activeModalCandidateId: null }),
  openIngestionModal: () => set({ isIngestionModalOpen: true }),
  closeIngestionModal: () => set({ isIngestionModalOpen: false }),
}));
