import { ChatTopbar } from '@/components/features/chat/ChatTopbar';
import { ChatMessages } from '@/components/features/chat/ChatMessages';
import { SuggestionChips } from '@/components/features/chat/SuggestionChips';
import { ChatInputBar } from '@/components/features/chat/ChatInputBar';
import { useSearchStore } from '@/lib/stores/search.store';
import { useSearch } from '@/hooks/use-search.tsx';

export function ChatMain() {
  const { isSearching } = useSearchStore();
  const { submitQuery } = useSearch();

  return (
    <main className="flex-1 flex flex-col h-full bg-bg-base overflow-hidden relative min-w-0">
      <ChatTopbar />

      <ChatMessages />

      <SuggestionChips onSelectQuery={submitQuery} />

      <ChatInputBar onSendMessage={submitQuery} disabled={isSearching} />
    </main>
  );
}
