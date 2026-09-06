import { useState } from 'react';
import { candidateApi } from '@/lib/api/candidate.api';
import type { CandidateProfile } from '@/types/candidate.types';
import toast from 'react-hot-toast';

export function useCandidateModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(false);

  async function openCandidateModal(id: string) {
    setIsOpen(true);
    setLoading(true);
    try {
      const data = await candidateApi.getCandidate(id);
      setCandidate(data);
    } catch (err: any) {
      console.error('[useCandidateModal] Error fetching profile:', err);
      toast.error('Failed to load candidate profile details.');
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  }

  function closeModal() {
    setIsOpen(false);
    setCandidate(null);
  }

  return {
    isOpen,
    candidate,
    loading,
    openCandidateModal,
    closeModal,
  };
}
