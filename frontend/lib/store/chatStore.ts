import { create } from 'zustand';
import { ChatMode, ChatMessage } from '../../types';

interface ChatState {
  messages: ChatMessage[];
  currentMode: ChatMode;
  isStreaming: boolean;
  streamingText: string;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  setCurrentMode: (mode: ChatMode) => void;
  setStreaming: (streaming: boolean) => void;
  setStreamingText: (text: string) => void;
  clearStreamingText: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  currentMode: 'general',
  isStreaming: false,
  streamingText: '',
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setCurrentMode: (mode) => set({ currentMode: mode }),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
  setStreamingText: (text) => set({ streamingText: text }),
  clearStreamingText: () => set({ streamingText: '' }),
}));
