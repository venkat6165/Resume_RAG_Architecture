import { create } from 'zustand';
import type { ReactNode } from 'react';
import type { Message } from '@/types/chat.types';

interface ChatState {
  messages: Message[];
  addUserMessage: (text: string) => void;
  addBotMessage: (content: ReactNode) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  addUserMessage: (text: string) =>
    set((s: ChatState) => ({
      messages: [...s.messages, { id: crypto.randomUUID(), type: 'user', text, timestamp: new Date() }],
    })),
  addBotMessage: (content: ReactNode) =>
    set((s: ChatState) => ({
      messages: [...s.messages, { id: crypto.randomUUID(), type: 'bot', content, timestamp: new Date() }],
    })),
  clearMessages: () => set({ messages: [] }),
}));
