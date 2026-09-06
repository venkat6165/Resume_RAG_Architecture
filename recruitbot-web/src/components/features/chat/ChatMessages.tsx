import { useRef, useEffect } from 'react';
import { useChatStore } from '@/lib/stores/chat.store';
import { useSearchStore } from '@/lib/stores/search.store';
import { WelcomeMessage } from './WelcomeMessage';
import { UserBubble } from './UserBubble';
import { BotBubble } from './BotBubble';
import { LoadingDots } from './LoadingDots';

export function ChatMessages() {
  const { messages } = useChatStore();
  const { isSearching } = useSearchStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSearching]);

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3 max-w-4xl mx-auto w-full">
      {messages.length === 0 ? (
        <WelcomeMessage />
      ) : (
        messages.map((msg) =>
          msg.type === 'user' ? (
            <UserBubble key={msg.id} text={msg.text} timestamp={msg.timestamp} />
          ) : (
            <BotBubble key={msg.id} timestamp={msg.timestamp}>
              {msg.content || msg.text}
            </BotBubble>
          )
        )
      )}

      {isSearching && (
        <BotBubble key="loading">
          <LoadingDots />
        </BotBubble>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
