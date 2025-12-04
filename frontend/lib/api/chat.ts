import { apiClient } from './client';
import { ChatMessage, SendMessageRequest } from '../../types';

export const chatApi = {
  // Create chat session
  createSession: async (mode: string = 'general'): Promise<{ session_id: string }> => {
    const response = await apiClient.post('/chat/sessions', { mode });
    return response.data;
  },

  // Get messages for session
  getMessages: async (sessionId: string): Promise<ChatMessage[]> => {
    const response = await apiClient.get(`/messages/${sessionId}`);
    return response.data;
  },

  sendMessage: async (data: SendMessageRequest): Promise<ChatMessage> => {
    const response = await apiClient.post<ChatMessage>('/chat/message', data);
    return response.data;
  },

  getHistory: async (limit: number = 50): Promise<ChatMessage[]> => {
    const response = await apiClient.get<ChatMessage[]>(`/chat/history?limit=${limit}`);
    return response.data;
  },

  // SSE streaming for real-time AI responses
  streamMessage: async (
    data: SendMessageRequest,
    onChunk: (chunk: string) => void,
    onComplete: (message: ChatMessage) => void,
    onError: (error: Error) => void
  ) => {
    try {
      const token = await import('expo-secure-store').then(m => m.getItemAsync('authToken'));
      const response = await fetch('https://zeha.trairx.com/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              onComplete({
                id: Date.now().toString(),
                userId: 'zeha-ai',
                content: fullText,
                mode: 'general',
                type: 'text',
                timestamp: new Date().toISOString(),
                isAI: true,
              });
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullText += parsed.text;
                onChunk(parsed.text);
              }
            } catch (e) {
              // Ignore parse errors for chunks
            }
          }
        }
      }
    } catch (error) {
      onError(error as Error);
    }
  },
};
