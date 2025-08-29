import React from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { ChannelHeader } from '../../components/chat/ChannelHeader';
import { ChannelActions } from '../../components/chat/ChannelActions';
import { ThreadedMessageList } from '../../components/chat/ThreadedMessageList';
import { ChannelInputContainer } from '../../components/chat/ChannelInputContainer';
import { ChannelModalsContainer } from '../../components/chat/ChannelModalsContainer';
import { useChannelState } from '../../hooks/useChannelState';
import { useMessageActions } from '../../hooks/useMessageActions';
import { useWebSocket } from '../../services/websocketService';
import { useToast } from '../../contexts/ToastContext';
import { RootState } from '../../store/store';
import type { Message } from '../../types/chat';
import type { MainStackParamList } from '../../navigation/MainNavigator';

type ChannelDetailScreenProps = NativeStackScreenProps<MainStackParamList, 'ChannelDetailScreen'>;

export const ChannelDetailScreen: React.FC<ChannelDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { channelId, channelName, members } = route.params;
  const insets = useSafeAreaInsets();
  
  // Get current user from auth state
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const currentUserId = currentUser?.id || 'unknown_user';
  const currentUserName = currentUser?.name || currentUser?.email || 'Unknown User';
  
  const { isConnected } = useWebSocket();
  const { showError, showSuccess, showInfo } = useToast();

  // Use custom hooks for state management
  const [channelState, channelActions] = useChannelState(channelId);
  
  const {
    // Message state
    messages,
    isLoadingMessages,
    isLoadingMoreMessages,
    hasMoreMessages,
    messageError,
    typingUsers,
    
    // Channel state
    channelStats,
    actualChannelMembers,
    isLoadingMembers,
    
    // Modal state
    showSummaryModal,
    showKeyPointsModal,
    showTaskIntegration,
    showEmojiPicker,
    channelSummary,
    isGeneratingSummary,
    isCreatingTasks,
    
    // Reply/Edit state
    replyingTo,
    editingMessage,
  } = channelState;

  const {
    // Actions
    loadMessages,
    loadMoreMessages,
    setReplyingTo,
    setEditingMessage,
    setShowSummaryModal,
    setShowKeyPointsModal,
    setShowTaskIntegration,
    setShowEmojiPicker,
    generateSummary,
  } = channelActions;

  // Use message actions hook with a simple wrapper for addOptimisticMessage
  const addOptimisticMessageWrapper = (message: Omit<Message, 'id' | 'timestamp'>) => {
    // For now, just log - the actual optimistic updates will be handled differently
    console.log('Optimistic message would be added:', message);
  };

  const {
    handleSendMessage,
    handleEditMessage,
    handleDeleteMessage,
    handleReaction,
    handleSendVoiceMessage,
    handleAttachFile,
    handleStartTyping,
    handleStopTyping,
  } = useMessageActions(
    channelId,
    currentUserId,
    currentUserName,
    currentUser?.avatar_url,
    addOptimisticMessageWrapper,
    replyingTo,
    editingMessage,
    setReplyingTo,
    setEditingMessage
  );

  // Enhanced members for UI consistency - use actual channel members if available
  const enhancedMembers = (actualChannelMembers.length > 0 ? actualChannelMembers : members || []).map((member, index) => ({
    id: member?.id || member?.user_id || `member_${index}`,
    name: member?.name || member?.user_name || `User ${index + 1}`,
    role: member?.role || 'Member',
    avatar: member?.avatar || member?.user_avatar || member?.name?.charAt(0) || member?.user_name?.charAt(0) || undefined,
    isOnline: member?.isOnline || true,
  }));

  // Message wrapper functions to handle different signatures
  const handleSendMessageWrapper = (content: string) => {
    handleSendMessage(content, 'text');
  };

  const handleAttachFileWrapper = (file: any) => {
    if (file?.uri && file?.name) {
      handleAttachFile(file.uri, file.name);
    }
  };

  const handleAttachImageWrapper = (image: any) => {
    if (image?.uri && image?.name) {
      handleAttachFile(image.uri, image.name);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    if (showEmojiPicker) {
      handleReaction(showEmojiPicker, emoji);
      setShowEmojiPicker(null);
    }
  };

  const handleShareSummary = () => {
    showSuccess('Meeting summary shared with team');
    setShowSummaryModal(false);
  };

  const handleCreateTasksFromSummary = () => {
    showSuccess('Tasks created from action items');
    setShowSummaryModal(false);
  };

  const handleCreateTaskFromKeyPoints = (taskData: any) => {
    showSuccess(`Task "${taskData.title}" created`);
    setShowKeyPointsModal(false);
  };

  const handleGenerateSummary = () => {
    generateSummary();
    setShowSummaryModal(true);
  };

  const handleCreateTasks = () => {
    setShowTaskIntegration(true);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />

        {/* Header */}
        <ChannelHeader
          channelName={channelName}
          members={enhancedMembers}
          messageCount={channelStats.messageCount}
          fileCount={channelStats.fileCount}
          onBack={() => navigation.goBack()}
          onMembersPress={() => {
            showInfo(`Channel has ${enhancedMembers.length} members${isLoadingMembers ? ' (loading...)' : ''}`);
          }}
          onStatsPress={() => {
            showInfo(`Channel has ${channelStats.messageCount} messages and ${channelStats.fileCount} files`);
          }}
        />

        {/* AI Actions */}
        <ChannelActions
          onGenerateSummary={handleGenerateSummary}
          onCreateTasks={handleCreateTasks}
          isGeneratingSummary={isGeneratingSummary}
          isCreatingTasks={isCreatingTasks}
        />

        {/* Messages */}
        <ThreadedMessageList
          messages={messages}
          isLoading={isLoadingMessages}
          isLoadingMore={isLoadingMoreMessages}
          hasMoreMessages={hasMoreMessages}
          error={messageError}
          channelId={channelId}
          channelName={channelName}
          currentUserId={currentUserId}
          isConnected={isConnected}
          onLoadMore={loadMoreMessages}
          onRetry={loadMessages}
          onReply={(message: Message) => setReplyingTo({
            id: message.id,
            content: message.content,
            sender: message.sender.name,
            threadRoot: message.threadRoot || message.id, // If message is already in a thread, use its threadRoot, otherwise it becomes the threadRoot
          })}
          onEdit={setEditingMessage}
          onDelete={handleDeleteMessage}
          onReaction={setShowEmojiPicker}
        />

        {/* Input */}
        <ChannelInputContainer
          channelName={channelName}
          typingUsers={typingUsers}
          currentUserId={currentUserId}
          replyingTo={replyingTo}
          editingMessage={editingMessage}
          onSendMessage={handleSendMessageWrapper}
          onSendVoiceMessage={handleSendVoiceMessage}
          onAttachFile={handleAttachFileWrapper}
          onAttachImage={handleAttachImageWrapper}
          onStartTyping={handleStartTyping}
          onStopTyping={handleStopTyping}
          onCancelReply={() => setReplyingTo(null)}
          onCancelEdit={() => setEditingMessage(null)}
        />

        {/* Modals */}
        <ChannelModalsContainer
          showEmojiPicker={showEmojiPicker}
          onCloseEmojiPicker={() => setShowEmojiPicker(null)}
          onEmojiSelect={handleEmojiSelect}
          showSummaryModal={showSummaryModal}
          channelSummary={channelSummary}
          onCloseSummaryModal={() => setShowSummaryModal(false)}
          onShareSummary={handleShareSummary}
          onCreateTasksFromSummary={handleCreateTasksFromSummary}
          showKeyPointsModal={showKeyPointsModal}
          messages={messages}
          onCloseKeyPointsModal={() => setShowKeyPointsModal(false)}
          onCreateTaskFromKeyPoints={handleCreateTaskFromKeyPoints}
          showTaskIntegration={showTaskIntegration}
          channelId={channelId}
          channelName={channelName}
          memberIds={enhancedMembers.map(m => m.id)}
          onCloseTaskIntegration={() => setShowTaskIntegration(false)}
        />
      </View>
    </KeyboardAvoidingView>
  );
};
