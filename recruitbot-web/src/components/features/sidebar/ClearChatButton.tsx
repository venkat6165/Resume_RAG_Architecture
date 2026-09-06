import { useChatStore } from '@/lib/stores/chat.store';

export function ClearChatButton() {
  const { clearMessages } = useChatStore();

  return (
    <button
      onClick={clearMessages}
      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 text-text-muted hover:text-white text-xs font-medium transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-3.5 h-3.5"
      >
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      </svg>
      Clear Search Thread
    </button>
  );
}
