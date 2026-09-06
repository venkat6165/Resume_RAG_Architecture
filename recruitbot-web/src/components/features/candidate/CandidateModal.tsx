import { useEffect } from 'react';
import { useUIStore } from '@/lib/stores/ui.store';
import { useCandidateModal } from '@/hooks/use-candidate-modal';
import { ModalHeader } from './ModalHeader';
import { ContactSection } from './ContactSection';
import { SkillsSection } from './SkillsSection';
import { ExperienceSection } from './ExperienceSection';
import { EducationSection } from './EducationSection';
import { ProjectsSection } from './ProjectsSection';
import { CertificationsSection } from './CertificationsSection';

export function CandidateModal() {
  const { activeModalCandidateId, closeCandidateModal } = useUIStore();
  const { candidate, loading, openCandidateModal, closeModal } = useCandidateModal();

  useEffect(() => {
    if (activeModalCandidateId) {
      openCandidateModal(activeModalCandidateId);
    }
  }, [activeModalCandidateId]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        handleClose();
      }
    }
    if (activeModalCandidateId) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModalCandidateId]);

  if (!activeModalCandidateId) return null;

  function handleClose() {
    closeModal();
    closeCandidateModal();
  }

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[88vh] bg-bg-surface border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 overflow-y-auto"
      >
        {loading ? (
          <div className="flex flex-col gap-4 py-8 animate-pulse">
            <div className="h-6 w-48 bg-white/10 rounded" />
            <div className="h-4 w-32 bg-white/5 rounded" />
            <div className="grid grid-cols-3 gap-2 py-4">
              <div className="h-12 bg-white/5 rounded-xl" />
              <div className="h-12 bg-white/5 rounded-xl" />
              <div className="h-12 bg-white/5 rounded-xl" />
            </div>
            <div className="h-20 bg-white/5 rounded-xl" />
          </div>
        ) : candidate ? (
          <>
            <ModalHeader
              name={candidate.name}
              role={candidate.role || candidate.title}
              company={candidate.company}
              onClose={handleClose}
            />

            <ContactSection
              email={candidate.email}
              phone={candidate.phoneNumber || candidate.phone}
              location={candidate.location}
            />

            <SkillsSection skills={candidate.skills} />

            <ExperienceSection
              experience={candidate.experience}
              experienceSummary={candidate.experienceSummary}
            />

            <EducationSection education={candidate.education} />

            <ProjectsSection projects={candidate.projects} />

            <CertificationsSection certifications={candidate.certifications} />

            {(candidate.rawText || candidate.text) && (
              <div className="flex flex-col gap-2 pt-3 border-t border-white/10">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Extracted Raw Text Snippet
                </h3>
                <pre className="text-[11px] text-text-muted bg-bg-card p-3 rounded-xl border border-white/5 overflow-x-auto whitespace-pre-wrap font-mono max-h-48">
                  {candidate.rawText || candidate.text}
                </pre>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center text-text-muted">
            <p className="text-sm font-semibold text-text-primary">Unable to load candidate details</p>
            <button onClick={handleClose} className="mt-4 px-4 py-2 bg-primary text-white text-xs rounded-xl">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
