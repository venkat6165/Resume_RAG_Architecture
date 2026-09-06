import { BrandAvatar } from '../common/BrandAvatar';
import { SearchModeNav } from '../features/sidebar/SearchModeNav';
import { HybridWeightPanel } from '../features/sidebar/HybridWeightPanel';
import { ResultsLimitSelect } from '../features/sidebar/ResultsLimitSelect';
import { ClearChatButton } from '../features/sidebar/ClearChatButton';
import { UploadResumeButton } from '../features/sidebar/UploadResumeButton';
import { useSearchStore } from '@/lib/stores/search.store';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className = '' }: SidebarProps) {
  const { searchType, setSearchType } = useSearchStore();

  return (
    <aside
      className={`w-[260px] shrink-0 bg-bg-surface border-r border-white/[0.07] flex flex-col p-5 gap-4 overflow-y-auto select-none ${className}`}
    >
      <BrandAvatar />

      <UploadResumeButton />

      <SearchModeNav activeMode={searchType} onChange={setSearchType} />

      {searchType === 'hybrid' && <HybridWeightPanel />}

      <ResultsLimitSelect />

      <div className="mt-auto flex flex-col gap-3 pt-3 border-t border-white/[0.07]">
        <ClearChatButton />
        <div className="flex items-center justify-between text-[11px] text-text-muted px-1">
          <span>RecruitBot Web v2.0</span>
          <span className="text-emerald-400 font-mono">RAG Active</span>
        </div>
      </div>
    </aside>
  );
}
