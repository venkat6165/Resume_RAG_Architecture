import { useSearchStore } from '@/lib/stores/search.store';
import { useChatStore } from '@/lib/stores/chat.store';
import { searchApi } from '@/lib/api/search.api';
import { ResultsList } from '@/components/features/results/ResultsList';
import toast from 'react-hot-toast';

export function useSearch() {
  const { searchType, bm25Weight, vectorWeight, topK, enableRerank, rerankTopN, enableDeduplication, enableSummarize, summaryStyle, setSearching, setResults } = useSearchStore();
  const { addUserMessage, addBotMessage } = useChatStore();

  async function submitQuery(queryText: string) {
    const trimmed = queryText.trim();
    if (!trimmed) return;

    addUserMessage(trimmed);
    setSearching(true);

    try {
      const data = await searchApi.searchResumes({
        query: trimmed,
        searchType: searchType === 'bm25' ? 'keyword' : searchType,
        topK,
        bm25Weight: bm25Weight / 100,
        vectorWeight: vectorWeight / 100,
        options: {
          enableRerank,
          rerankTopN,
          deduplicate: enableDeduplication,
          summarize: enableSummarize,
          summaryStyle,
        },
      });

      setResults(data.results, trimmed, data.timings, data.deduplicatedCount);

      addBotMessage(
        <ResultsList
          results={data.results}
          searchType={searchType}
          duration={data.duration}
          degraded={data.degraded}
        />
      );
    } catch (err: any) {
      console.error('[useSearch] Search API error:', err);
      toast.error('Search request failed. Check backend connection.');
      addBotMessage(
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-xs">
          ❌ Search failed to execute. Please ensure backend server on port 3000 is active.
        </div>
      );
    } finally {
      setSearching(false);
    }
  }

  return { submitQuery };
}
