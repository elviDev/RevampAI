import { useCallback, useEffect } from 'react';
import { useWebSocket, MessageEvent, MessageReactionEvent } from '../services/websocketService';
import { messageService } from '../services/api/messageService';
import { notificationService } from '../services/notificationService';
import { useToast } from '../contexts/ToastContext';
import type { Message } from '../types/chat';

export interface MessageActionsHook {
  // Message operations
  handleSendMessage: (content: string, type: Message['type']) => Promise<void>;
  handleEditMessage: (messageId: string, content: string) => Promise<void>;
  handleDeleteMessage: (messageId: string) => Promise<void>;
  handleReaction: (messageId: string, emoji: string) => Promise<void>;
  
  // Voice and file operations
  handleSendVoiceMessage: (audioUri: string, transcript?: string) => Promise<void>;
  handleAttachFile: (uri: string, fileName: string) => Promise<void>;
  
  // Typing indicators
  handleStartTyping: () => void;
  handleStopTyping: () => void;
}

export const useMessageActions = (
  channelId: string,
  currentUserId: string,
  currentUserName: string,
  currentUserAvatar: string | undefined,
  addOptimisticMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void,
  replyingTo: { id: string; content: string; sender: string; threadRoot?: string } | null,
  editingMessage: { id: string; content: string } | null,
  setReplyingTo: (reply: { id: string; content: string; sender: string; threadRoot?: string } | null) => void,
  setEditingMessage: (edit: { id: string; content: string } | null) => void
): MessageActionsHook => {
  const { 
    isConnected, 
    joinChannel, 
    leaveChannel, 
    startChannelTyping, 
    stopChannelTyping
  } = useWebSocket();
  const { showError, showSuccess } = useToast();

  // Join channel on mount
  useEffect(() => {
    if (isConnected && channelId) {
      joinChannel(channelId);
      console.log(`[useMessageActions] Joined channel: ${channelId}`);
      
      return () => {
        leaveChannel(channelId);
        console.log(`[useMessageActions] Left channel: ${channelId}`);
      };
    }
  }, [isConnected, channelId, joinChannel, leaveChannel]);

  // Handle sending messages
  const handleSendMessage = useCallback(async (content: string, type: Message['type'] = 'text') => {
    if (!content.trim() || !channelId) return;

    try {
      // Create optimistic message
      const optimisticMessage = {
        type,
        content: content.trim(),
        voiceTranscript: type === 'voice' ? content : undefined,
        sender: {
          id: currentUserId,
          name: currentUserName,
          avatar: currentUserAvatar,
          role: 'user',
        },
        reactions: [],
        replies: [],
        mentions: [],
        isEdited: false,
        connectedTo: replyingTo?.id,
        // For threading: if replying to a message that's already part of a thread, 
        // use its threadRoot. Otherwise, the message being replied to becomes the threadRoot.
        threadRoot: replyingTo?.threadRoot || replyingTo?.id,
      };

      // Add optimistic message immediately
      addOptimisticMessage(optimisticMessage);

      console.log(`[useMessageActions] Sending message to channel ${channelId}:`, {
        content: content.substring(0, 50) + '...',
        type,
        replyTo: replyingTo?.id
      });

      // Send to server
      const response = await messageService.sendMessage(channelId, {
        content: content.trim(),
        message_type: type === 'voice' ? 'voice' : 'text',
        reply_to: replyingTo?.id,
        thread_root: replyingTo?.threadRoot || replyingTo?.id, // Use proper threadRoot logic
        mentions: [],
      });

      if (response.success) {
        console.log('[useMessageActions] Message sent successfully');
        
        // Send push notifications to channel members
        try {
          await notificationService.sendChannelNotification({
            channelId: channelId,
            senderId: currentUserId,
            senderName: currentUserName,
            message: content.substring(0, 100),
            type: 'new_message',
          });
        } catch (notificationError) {
          // Don't log as error since this is not critical for message sending
          console.debug('[useMessageActions] Notification service unavailable:', notificationError);
        }
        
        // Clear reply/edit state
        setReplyingTo(null);
        setEditingMessage(null);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error: any) {
      console.error('[useMessageActions] Error sending message:', error);
      showError(error?.message || 'Failed to send message');
    }
  }, [
    channelId, 
    currentUserId, 
    currentUserName, 
    currentUserAvatar,
    replyingTo, 
    addOptimisticMessage, 
    setReplyingTo, 
    setEditingMessage, 
    showError
  ]);

  // Handle editing messages
  const handleEditMessage = useCallback(async (messageId: string, content: string) => {
    if (!content.trim()) return;

    try {
      const response = await messageService.editMessage(channelId, messageId, content.trim());

      if (response.success) {
        showSuccess('Message updated successfully');
        setEditingMessage(null);
      } else {
        throw new Error('Failed to edit message');
      }
    } catch (error: any) {
      console.error('[useMessageActions] Error editing message:', error);
      showError(error?.message || 'Failed to edit message');
    }
  }, [channelId, showSuccess, showError, setEditingMessage]);

  // Handle deleting messages
  const handleDeleteMessage = useCallback(async (messageId: string) => {
    try {
      const response = await messageService.deleteMessage(channelId, messageId);

      if (response.success) {
        showSuccess('Message deleted successfully');
      } else {
        throw new Error('Failed to delete message');
      }
    } catch (error: any) {
      console.error('[useMessageActions] Error deleting message:', error);
      showError(error?.message || 'Failed to delete message');
    }
  }, [channelId, showSuccess, showError]);

  // Handle message reactions
  const handleReaction = useCallback(async (messageId: string, emoji: string) => {
    try {
      const response = await messageService.addReaction(channelId, messageId, emoji);

      if (response.success) {
        console.log(`[useMessageActions] Added reaction ${emoji} to message ${messageId}`);
      } else {
        throw new Error('Failed to add reaction');
      }
    } catch (error: any) {
      console.error('[useMessageActions] Error adding reaction:', error);
      showError(error?.message || 'Failed to add reaction');
    }
  }, [channelId, showError]);

  // Handle voice messages
  const handleSendVoiceMessage = useCallback(async (audioUri: string, transcript?: string) => {
    if (!audioUri) return;

    try {
      // For now, send as text with voice indicator
      await handleSendMessage(transcript || '[Voice Message]', 'voice');
    } catch (error: any) {
      console.error('[useMessageActions] Error sending voice message:', error);
      showError(error?.message || 'Failed to send voice message');
    }
  }, [handleSendMessage, showError]);

  // Handle file attachments
  const handleAttachFile = useCallback(async (uri: string, fileName: string) => {
    if (!uri || !fileName) return;

    try {
      // For now, send as text with file indicator
      await handleSendMessage(`📎 ${fileName}`, 'file');
    } catch (error: any) {
      console.error('[useMessageActions] Error attaching file:', error);
      showError(error?.message || 'Failed to attach file');
    }
  }, [handleSendMessage, showError]);

  // Handle typing indicators
  const handleStartTyping = useCallback(() => {
    if (isConnected && channelId) {
      startChannelTyping(channelId);
    }
  }, [isConnected, channelId, startChannelTyping]);

  const handleStopTyping = useCallback(() => {
    if (isConnected && channelId) {
      stopChannelTyping(channelId);
    }
  }, [isConnected, channelId, stopChannelTyping]);

  return {
    handleSendMessage,
    handleEditMessage,
    handleDeleteMessage,
    handleReaction,
    handleSendVoiceMessage,
    handleAttachFile,
    handleStartTyping,
    handleStopTyping,
  };
};
