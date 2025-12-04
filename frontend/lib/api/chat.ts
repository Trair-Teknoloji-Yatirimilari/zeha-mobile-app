import { apiClient } from './client';
import { ChatMessage, SendMessageRequest, ChatMode } from '../../types';

export const chatApi = {
  // Create chat session
  createSession: async (userId: string, mode: string = 'general'): Promise<{ id: string }> => {
    const response = await apiClient.post(`/sessions?user_id=${userId}`, { mode });
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
    userId: string,
    sessionId: string,
    message: string,
    mode: string,
    onChunk: (chunk: string) => void,
    onComplete: (message: ChatMessage) => void,
    onError: (error: Error) => void
  ) => {
    try {
      const SecureStore = await import('expo-secure-store');
      const token = await SecureStore.getItemAsync('authToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Increased timeout to 30 seconds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch('https://zeha.trairx.com/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          user_id: userId,
          session_id: sessionId,
          message: message,
          mode: mode
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body reader not available');
      }

      let fullText = '';
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            // Stream complete
            if (fullText) {
              onComplete({
                id: Date.now().toString(),
                userId: 'zeha-ai',
                content: fullText,
                mode: mode,
                type: 'text',
                timestamp: new Date().toISOString(),
                isAI: true,
              });
            }
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          
          // Keep incomplete line in buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            
            // SSE format: "data: {json}"
            if (trimmedLine.startsWith('data: ')) {
              const data = trimmedLine.slice(6);
              
              if (data === '[DONE]') {
                onComplete({
                  id: Date.now().toString(),
                  userId: 'zeha-ai',
                  content: fullText,
                  mode: mode,
                  type: 'text',
                  timestamp: new Date().toISOString(),
                  isAI: true,
                });
                return;
              }

              try {
                const parsed = JSON.parse(data);
                
                // Handle different response formats
                const text = parsed.text || parsed.content || parsed.message || '';
                
                if (text) {
                  fullText += text;
                  onChunk(text);
                }
              } catch (e) {
                console.warn('Failed to parse SSE data:', data);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        onError(new Error('Request timeout (30s) - Please try again'));
      } else {
        onError(error as Error);
      }
    }
  },
};
