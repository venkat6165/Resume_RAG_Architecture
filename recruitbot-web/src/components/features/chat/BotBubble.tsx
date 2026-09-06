import type { ReactNode } from 'react';

interface BotBubbleProps {
  children?: ReactNode;
  text?: string;
  timestamp?: Date;
}

export function BotBubble({ children, text, timestamp }: BotBubbleProps) {
  const timeString = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : undefined;

  return (
    <div className="flex items-start gap-3 my-2 max-w-[90%] mr-auto animate-slide-in-left">
      <div className="h-7 w-7 rounded-lg bg-bg-card border border-white/10 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
        🤖
      </div>
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <div className="bg-bg-card border border-white/10 text-text-primary p-4 rounded-2xl rounded-tl-sm shadow-md text-xs leading-relaxed">
          {children || text}
        </div>
        {timeString && <span className="text-[10px] text-text-muted px-1">{timeString}</span>}
      </div>
    </div>
  );
}
