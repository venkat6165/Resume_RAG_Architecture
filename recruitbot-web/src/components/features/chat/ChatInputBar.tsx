import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';

interface ChatInputBarProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

export function ChatInputBar({ onSendMessage, disabled = false }: ChatInputBarProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  function handleSend() {
    if (!input.trim() || disabled) return;
    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="p-4 border-t border-white/[0.07] bg-bg-surface/50 backdrop-blur shrink-0">
      <div className="max-w-4xl mx-auto flex flex-col gap-1.5">
        <div className="relative flex items-center bg-bg-card border border-white/10 rounded-2xl p-2 focus-within:border-primary/60 transition-colors shadow-lg">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Type recruiter search query (e.g., Senior QA Architect with RAG & DeepEval)..."
            className="flex-1 bg-transparent border-0 focus:outline-none text-xs text-text-primary placeholder:text-text-muted resize-none px-3 py-1.5 min-h-[28px] max-h-[120px]"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || disabled}
            className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${
              input.trim() && !disabled
                ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md shadow-primary/30 cursor-pointer'
                : 'bg-white/5 text-text-muted opacity-40 cursor-not-allowed'
            }`}
          >
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
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <div className="flex items-center justify-between text-[11px] text-text-muted px-2">
          <span>Press <kbd className="px-1 py-0.5 rounded bg-white/10 text-[10px]">Enter</kbd> to search</span>
          <span><kbd className="px-1 py-0.5 rounded bg-white/10 text-[10px]">Shift + Enter</kbd> for new line</span>
        </div>
      </div>
    </div>
  );
}
