import React from 'react';
import { EnhancedChannelInput } from './EnhancedChannelInput';
import { SimpleTypingIndicators } from './SimpleTypingIndicators';

interface ChannelInputContainerProps {
  channelName: string;
  typingUsers: Array<{
    userId: string;
    userName: string;
    isTyping: boolean;
    lastTypingTime?: number;
  }>;
  currentUserId: string;
  replyingTo: { id: string; content: string; sender: string } | null;
  editingMessage: { id: string; content: string } | null;
  onSendMessage: (content: string) => void;
  onEditMessage?: (messageId: string, content: string) => void;
  onSendVoiceMessage: (audioUri: string, transcript?: string) => void;
  onAttachFile: (file: any) => void;
  onAttachImage: (image: any) => void;
  onStartTyping: () => void;
  onStopTyping: () => void;
  onCancelReply: () => void;
  onCancelEdit: () => void;
}

export const ChannelInputContainer: React.FC<ChannelInputContainerProps> = ({
  channelName,
  typingUsers,
  currentUserId,
  replyingTo,
  editingMessage,
  onSendMessage,
  onEditMessage,
  onSendVoiceMessage,
  onAttachFile,
  onAttachImage,
  onStartTyping,
  onStopTyping,
  onCancelReply,
  onCancelEdit,
}) => {
  return (
    <>
      {/* Typing Indicators */}
      <SimpleTypingIndicators
        typingUsers={typingUsers}
        currentUserId={currentUserId}
      />

      {/* Input */}
      <EnhancedChannelInput
        onSendMessage={onSendMessage}
        onEditMessage={onEditMessage}
        onSendVoiceMessage={onSendVoiceMessage}
        onAttachFile={onAttachFile}
        onAttachImage={onAttachImage}
        onStartTyping={onStartTyping}
        onStopTyping={onStopTyping}
        placeholder={`Message #${channelName}`}
        replyingTo={replyingTo}
        onCancelReply={onCancelReply}
        editingMessage={editingMessage}
        onCancelEdit={onCancelEdit}
      />
    </>
  );
};
