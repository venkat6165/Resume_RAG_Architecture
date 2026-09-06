import { AppShell } from '@/components/layout/AppShell';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileDrawer } from '@/components/layout/MobileDrawer';
import { ChatMain } from '@/components/layout/ChatMain';
import { ResumeUploadModal } from '@/features/ingestion/components/ResumeUploadModal';
import { CandidateModal } from '@/components/features/candidate/CandidateModal';

export function ChatPage() {
  return (
    <AppShell>
      <Sidebar className="hidden md:flex" />
      <MobileDrawer />
      <ChatMain />
      <ResumeUploadModal />
      <CandidateModal />
    </AppShell>
  );
}
