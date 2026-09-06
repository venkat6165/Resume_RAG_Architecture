interface UserBubbleProps {
  text?: string;
  timestamp?: Date;
}

export function UserBubble({ text, timestamp }: UserBubbleProps) {
  const timeString = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col items-end gap-1 my-2 max-w-[80%] ml-auto animate-slide-in-right">
      <div className="bg-gradient-to-r from-primary to-accent text-white px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-md text-xs leading-relaxed font-normal">
        {text}
      </div>
      <span className="text-[10px] text-text-muted px-1">{timeString}</span>
    </div>
  );
}
