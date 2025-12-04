import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GiftedChat, IMessage, InputToolbar, Bubble, Send } from 'react-native-gifted-chat';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { useAuthStore } from '../../lib/store/authStore';
import { useChatStore } from '../../lib/store/chatStore';
import { chatApi } from '../../lib/api/chat';
import { ChatMode } from '../../types';

const CHAT_MODES: { value: ChatMode; label: string; icon: string; color: string }[] = [
  { value: 'general', label: 'Genel', icon: 'chatbubbles', color: '#6366f1' },
  { value: 'teacher', label: 'Öğretmen', icon: 'school', color: '#10b981' },
  { value: 'homework', label: 'Ödev', icon: 'book', color: '#f59e0b' },
  { value: 'fun', label: 'Eğlence', icon: 'happy', color: '#ec4899' },
  { value: 'support', label: 'Destek', icon: 'heart', color: '#ef4444' },
];

export default function ChatScreen() {
  const { user } = useAuthStore();
  const { messages, currentMode, isStreaming, streamingText, setMessages, addMessage, setCurrentMode, setStreaming, setStreamingText, clearStreamingText } = useChatStore();
  const [giftedMessages, setGiftedMessages] = useState<IMessage[]>([]);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  // Request permissions
  useEffect(() => {
    (async () => {
      await Audio.requestPermissionsAsync();
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      await ImagePicker.requestCameraPermissionsAsync();
    })();
  }, []);

  // Convert messages to GiftedChat format
  useEffect(() => {
    const converted = messages.map((msg) => ({
      _id: msg.id,
      text: msg.content,
      createdAt: new Date(msg.timestamp),
      user: {
        _id: msg.isAI ? 2 : 1,
        name: msg.isAI ? 'Zeha' : user?.name || 'Ben',
        avatar: msg.isAI ? undefined : undefined,
      },
      image: msg.imageUrl,
    }));
    setGiftedMessages(converted);
  }, [messages, user]);

  // Add streaming message to display
  useEffect(() => {
    if (isStreaming && streamingText) {
      const streamingMessage: IMessage = {
        _id: 'streaming',
        text: streamingText,
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'Zeha',
        },
      };
      setGiftedMessages([streamingMessage, ...giftedMessages.filter(m => m._id !== 'streaming')]);
    } else if (!isStreaming) {
      setGiftedMessages(giftedMessages.filter(m => m._id !== 'streaming'));
    }
  }, [isStreaming, streamingText]);

  const loadChatHistory = async () => {
    try {
      const history = await chatApi.getHistory();
      setMessages(history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSend = useCallback(
    (newMessages: IMessage[] = []) => {
      if (newMessages.length === 0) return;

      const message = newMessages[0];
      
      // Add user message immediately
      addMessage({
        id: message._id.toString(),
        userId: user?.id || '',
        content: message.text,
        mode: currentMode,
        type: 'text',
        timestamp: new Date().toISOString(),
        isAI: false,
      });

      // Stream AI response
      setStreaming(true);
      clearStreamingText();

      chatApi.streamMessage(
        {
          content: message.text,
          mode: currentMode,
          type: 'text',
        },
        (chunk) => {
          setStreamingText(streamingText + chunk);
        },
        (aiMessage) => {
          addMessage(aiMessage);
          setStreaming(false);
          clearStreamingText();
        },
        (error) => {
          console.error('Streaming error:', error);
          setStreaming(false);
          clearStreamingText();
          Alert.alert('Hata', 'Mesaj gönderilemedi');
        }
      );
    },
    [currentMode, user, streamingText]
  );

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        const imageData = result.assets[0].base64;
        
        // Add user image message
        addMessage({
          id: Date.now().toString(),
          userId: user?.id || '',
          content: 'Resim gönderildi',
          mode: currentMode,
          type: 'image',
          imageUrl: `data:image/jpeg;base64,${imageData}`,
          timestamp: new Date().toISOString(),
          isAI: false,
        });

        // TODO: Send to API and get AI response about the image
        Alert.alert('Bilgi', 'Resim analizi yakında eklenecek');
      }
    } catch (error) {
      console.error('Image pick error:', error);
      Alert.alert('Hata', 'Resim seçilemedi');
    }
  };

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Hata', 'Ses kaydı başlatılamadı');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      
      // TODO: Send voice to API
      Alert.alert('Bilgi', 'Sesli mesaj yakında eklenecek');
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const renderInputToolbar = (props: any) => (
    <InputToolbar
      {...props}
      containerStyle={styles.inputToolbar}
      primaryStyle={styles.inputPrimary}
    />
  );

  const renderBubble = (props: any) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: styles.bubbleRight,
        left: styles.bubbleLeft,
      }}
      textStyle={{
        right: styles.bubbleTextRight,
        left: styles.bubbleTextLeft,
      }}
    />
  );

  const renderSend = (props: any) => (
    <Send {...props} containerStyle={styles.sendContainer}>
      <Ionicons name="send" size={24} color="#6366f1" style={{ marginRight: 12, marginBottom: 8 }} />
    </Send>
  );

  const renderActions = () => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity onPress={handleImagePick} style={styles.actionButton}>
        <Ionicons name="image" size={24} color="#6366f1" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={recording ? stopRecording : startRecording}
        style={[styles.actionButton, recording && styles.actionButtonRecording]}
      >
        <Ionicons
          name={recording ? 'stop-circle' : 'mic'}
          size={24}
          color={recording ? '#ef4444' : '#6366f1'}
        />
      </TouchableOpacity>
    </View>
  );

  const selectedModeData = CHAT_MODES.find(m => m.value === currentMode);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.modeIndicator, { backgroundColor: selectedModeData?.color }]} />
          <View>
            <Text style={styles.headerTitle}>Zeha</Text>
            <Text style={styles.headerSubtitle}>
              {user?.role === 'kids' 
                ? `Merhaba ${user.name}! 👋` 
                : 'Global AI Asistanı'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.modeButton}
          onPress={() => setShowModeSelector(true)}
        >
          <Ionicons name={selectedModeData?.icon as any} size={24} color="#f8fafc" />
        </TouchableOpacity>
      </View>

      {/* Chat */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <GiftedChat
          messages={giftedMessages}
          onSend={handleSend}
          user={{ _id: 1 }}
          renderInputToolbar={renderInputToolbar}
          renderBubble={renderBubble}
          renderSend={renderSend}
          renderActions={renderActions}
          placeholder="Mesajınızı yazın..."
          alwaysShowSend
          scrollToBottom
          isLoadingEarlier={isLoadingMessages}
        />
      </KeyboardAvoidingView>

      {/* Mode Selector Modal */}
      <Modal
        visible={showModeSelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModeSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sohbet Modu Seçin</Text>
              <TouchableOpacity onPress={() => setShowModeSelector(false)}>
                <Ionicons name="close" size={28} color="#f8fafc" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={CHAT_MODES}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modeItem,
                    currentMode === item.value && styles.modeItemActive,
                  ]}
                  onPress={() => {
                    setCurrentMode(item.value);
                    setShowModeSelector(false);
                  }}
                >
                  <View style={[styles.modeIcon, { backgroundColor: item.color }]}>
                    <Ionicons name={item.icon as any} size={28} color="#ffffff" />
                  </View>
                  <Text style={styles.modeLabel}>{item.label}</Text>
                  {currentMode === item.value && (
                    <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },
  modeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputToolbar: {
    backgroundColor: '#1e293b',
    borderTopColor: '#334155',
    paddingTop: 8,
  },
  inputPrimary: {
    alignItems: 'center',
  },
  bubbleRight: {
    backgroundColor: '#6366f1',
  },
  bubbleLeft: {
    backgroundColor: '#1e293b',
  },
  bubbleTextRight: {
    color: '#ffffff',
  },
  bubbleTextLeft: {
    color: '#f8fafc',
  },
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonRecording: {
    backgroundColor: '#fee2e2',
    borderRadius: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  modeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  modeItemActive: {
    backgroundColor: '#334155',
  },
  modeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc',
  },
});

// Export is at the top of the file (line 31)
// This comment ensures the file structure is complete
