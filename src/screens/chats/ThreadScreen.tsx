import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { Avatar } from '../../components/common/Avatar';
import { PromptInput } from '../../components/voice/PromptInput';
import { EmojiReactionPicker } from '../../components/chat/EmojiReactionPicker';
import type { Message, Reply, Reaction } from '../../types/chat';
import type { MainStackParamList } from '../../navigation/MainNavigator';

type ThreadScreenProps = NativeStackScreenProps<
  MainStackParamList,
  'ThreadScreen'
>;

export const ThreadScreen: React.FC<ThreadScreenProps> = ({
  navigation,
  route,
}) => {
  const {
    parentMessage,
    channelId,
    channelName,
    members,
    channels,
    onUpdateMessage,
  } = route.params;
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  // State
  const [replies, setReplies] = useState<Reply[]>(parentMessage.replies || []);
  const [currentParentMessage, setCurrentParentMessage] =
    useState(parentMessage);
  const [replyingTo, setReplyingTo] = useState<Reply | null>(null);
  const [editingReply, setEditingReply] = useState<Reply | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<{
    replyId: string;
    type: 'message' | 'reply';
  } | null>(null);

  // Mock data for mentions
  const recentMessages = [
    {
      id: 'msg1',
      content: 'Great progress on the API design',
      sender: { name: 'Sarah' },
      channel: channelName,
    },
    {
      id: 'msg2',
      content: 'Testing framework is ready',
      sender: { name: 'Mike' },
      channel: channelName,
    },
  ];

  const tasks = [
    {
      id: 'task1',
      title: 'Complete wireframes',
      description: 'Create detailed wireframes for all screens',
    },
    {
      id: 'task2',
      title: 'API documentation',
      description: 'Document all REST endpoints',
    },
  ];

  useEffect(() => {
    // Update parent when replies change
    onUpdateMessage(parentMessage.id, replies);
  }, [replies]);

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSendReply = (text: string) => {
    if (!text.trim()) return;

    const newReply: Reply = {
      id: Date.now().toString(),
      content: text,
      sender: { id: 'current_user', name: 'You' },
      timestamp: new Date(),
      reactions: [],
    };

    if (editingReply) {
      // Update existing reply
      setReplies(prev =>
        prev.map(reply =>
          reply.id === editingReply.id ? { ...reply, content: text } : reply,
        ),
      );
      setEditingReply(null);
    } else {
      // Add new reply
      setReplies(prev => [...prev, newReply]);
    }

    // Auto-scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendVoiceReply = (audioUri: string, transcript?: string) => {
    const newReply: Reply = {
      id: Date.now().toString(),
      content: transcript || 'Voice message',
      sender: { id: 'current_user', name: 'You' },
      timestamp: new Date(),
      reactions: [],
    };

    // Add voice properties
    (newReply as any).audioUri = audioUri;
    (newReply as any).voiceTranscript = transcript;

    setReplies(prev => [...prev, newReply]);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleAttachFile = (file: any) => {
    const newReply: Reply = {
      id: Date.now().toString(),
      content: `📎 ${file.name || 'File attachment'}`,
      sender: { id: 'current_user', name: 'You' },
      timestamp: new Date(),
      reactions: [],
    };

    // Add file properties
    (newReply as any).fileUri = file.uri;
    (newReply as any).fileName = file.name;
    (newReply as any).fileType = file.type;

    setReplies(prev => [...prev, newReply]);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleReaction = (
    replyId: string,
    emoji: string,
    isParentMessage = false,
  ) => {
    if (isParentMessage) {
      // Handle parent message reaction by updating parent message locally
      interface ParentMessage {
        id: string;
        content: string;
        sender: {
          id: string;
          name: string;
          avatar?: string;
          role?: string;
          isOnline?: boolean;
        };
        timestamp: Date;
        reactions?: Reaction[];
        isEdited?: boolean;
        voiceTranscript?: string;
        replies?: Reply[];
      }

      interface Reaction {
        emoji: string;
        users: string[];
        count: number;
      }

      setCurrentParentMessage((prev: ParentMessage): ParentMessage => {
        const updatedParentMessage: ParentMessage = { ...prev };
        const reactions: Reaction[] = updatedParentMessage.reactions || [];
        const existingReaction: Reaction | undefined = reactions.find(
          (r: Reaction) => r.emoji === emoji,
        );

        if (existingReaction) {
          if (existingReaction.users.includes('current_user')) {
            // Remove reaction
            const updatedUsers: string[] = existingReaction.users.filter(
              (u: string) => u !== 'current_user',
            );
            if (updatedUsers.length === 0) {
              updatedParentMessage.reactions = reactions.filter(
                (r: Reaction) => r.emoji !== emoji,
              );
            } else {
              updatedParentMessage.reactions = reactions.map((r: Reaction) =>
                r.emoji === emoji
                  ? { ...r, users: updatedUsers, count: updatedUsers.length }
                  : r,
              );
            }
          } else {
            // Add reaction
            updatedParentMessage.reactions = reactions.map((r: Reaction) =>
              r.emoji === emoji
                ? {
                    ...r,
                    users: [...r.users, 'current_user'],
                    count: r.count + 1,
                  }
                : r,
            );
          }
        } else {
          // New reaction
          updatedParentMessage.reactions = [
            ...reactions,
            { emoji, users: ['current_user'], count: 1 },
          ];
        }

        return updatedParentMessage;
      });

      setShowEmojiPicker(null);
      return;
    }

    setReplies(prev =>
      prev.map(reply => {
        if (reply.id === replyId) {
          const reactions = reply.reactions || [];
          const existingReaction = reactions.find(r => r.emoji === emoji);

          if (existingReaction) {
            if (existingReaction.users.includes('current_user')) {
              // Remove reaction
              const updatedUsers = existingReaction.users.filter(
                u => u !== 'current_user',
              );
              if (updatedUsers.length === 0) {
                return {
                  ...reply,
                  reactions: reactions.filter(r => r.emoji !== emoji),
                };
              } else {
                return {
                  ...reply,
                  reactions: reactions.map(r =>
                    r.emoji === emoji
                      ? {
                          ...r,
                          users: updatedUsers,
                          count: updatedUsers.length,
                        }
                      : r,
                  ),
                };
              }
            } else {
              // Add reaction
              return {
                ...reply,
                reactions: reactions.map(r =>
                  r.emoji === emoji
                    ? {
                        ...r,
                        users: [...r.users, 'current_user'],
                        count: r.count + 1,
                      }
                    : r,
                ),
              };
            }
          } else {
            // New reaction
            return {
              ...reply,
              reactions: [
                ...reactions,
                {
                  emoji,
                  users: ['current_user'],
                  count: 1,
                },
              ],
            };
          }
        }
        return reply;
      }),
    );
  };


  const handleNavigateToReference = (type: string, id: string) => {
    // Handle navigation to different types of references
    switch (type) {
      case 'user':
        navigation.navigate('UserProfile', { userId: id });
        break;
      case 'channel':
        // For now, alert since we don't have a channel list screen
        Alert.alert('Navigate', `Navigate to channel: ${id}`);
        break;
      case 'message':
        Alert.alert('Navigate', `Navigate to message: ${id}`);
        break;
      case 'task':
        navigation.navigate('TaskDetailScreen', { taskId: id });
        break;
      default:
        break;
    }
  };

  const renderParentMessage = () => (
    <View className="bg-gray-50 p-4 border-b border-gray-200">
      <View className="flex-row items-start space-x-3">
        <Avatar
          user={{
            id: currentParentMessage.sender.id,
            name: currentParentMessage.sender.name,
            avatar: currentParentMessage.sender.avatar,
            role: currentParentMessage.sender.role,
            isOnline: true,
          }}
          size="md"
          showOnlineStatus
          onPress={() =>
            handleNavigateToReference('user', currentParentMessage.sender.id)
          }
        />

        <View className="flex-1">
          <View className="flex-row items-center space-x-2 mb-1">
            <Text className="font-semibold text-gray-900">
              {currentParentMessage.sender.name}
            </Text>
            <Text className="text-xs text-gray-500">
              {formatTime(currentParentMessage.timestamp)}
            </Text>
            {currentParentMessage.isEdited && (
              <Text className="text-xs text-gray-400">(edited)</Text>
            )}
          </View>

          <Text className="text-gray-700 leading-5">
            {currentParentMessage.content}
          </Text>

          {/* Voice Transcript */}
          {currentParentMessage.voiceTranscript && (
            <View className="mt-2 p-2 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <View className="flex-row items-center mb-1">
                <MaterialIcon name="mic" size={16} color="#3B82F6" />
                <Text className="text-blue-600 text-xs font-medium ml-1">
                  Voice Message
                </Text>
              </View>
              <Text className="text-gray-700 text-sm">
                {currentParentMessage.voiceTranscript}
              </Text>
            </View>
          )}

          {/* Reactions */}
          {currentParentMessage.reactions &&
            currentParentMessage.reactions.length > 0 && (
              <View className="flex-row flex-wrap mt-2">
                {currentParentMessage.reactions.map(
                  (reaction: any, idx: number) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() =>
                        handleReaction(
                          currentParentMessage.id,
                          reaction.emoji,
                          true,
                        )
                      }
                      className="bg-white rounded-full px-2 py-1 mr-1 mb-1 border border-gray-200"
                    >
                      <Text className="text-sm">
                        {reaction.emoji} {reaction.count}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>
            )}
        </View>

        <TouchableOpacity
          onPress={() =>
            setShowEmojiPicker({
              replyId: currentParentMessage.id,
              type: 'message',
            })
          }
          className="bg-gray-100 rounded-full p-2"
        >
          <Text className="text-lg">😊</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReply = ({ item }: { item: Reply }) => (
    <View className="flex-row items-start space-x-3 px-4 py-3 border-b border-gray-50">
      <Avatar
        user={{
          id: item.sender.id,
          name: item.sender.name,
          avatar: item.sender.avatar,
          isOnline: true,
        }}
        size="sm"
        onPress={() => handleNavigateToReference('user', item.sender.id)}
      />

      <View className="flex-1">
        <View className="flex-row items-center space-x-2 mb-1">
          <Text className="font-medium text-gray-900">{item.sender.name}</Text>
          <Text className="text-xs text-gray-500">
            {formatTime(item.timestamp)}
          </Text>
        </View>

        <Text className="text-gray-700">{item.content}</Text>

        {/* Voice Transcript for replies */}
        {(item as any).voiceTranscript && (
          <View className="mt-2 p-2 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <View className="flex-row items-center mb-1">
              <MaterialIcon name="mic" size={14} color="#3B82F6" />
              <Text className="text-blue-600 text-xs font-medium ml-1">
                Voice Reply
              </Text>
            </View>
            <Text className="text-gray-700 text-sm">
              {(item as any).voiceTranscript}
            </Text>
          </View>
        )}

        {/* File Attachments for replies */}
        {(item as any).fileUri && (
          <View className="mt-2 p-2 bg-gray-50 rounded-lg border">
            <View className="flex-row items-center">
              <MaterialIcon name="attach-file" size={14} color="#6B7280" />
              <Text className="text-gray-700 text-sm font-medium ml-1">
                {(item as any).fileName || 'File attachment'}
              </Text>
            </View>
            <Text className="text-gray-500 text-xs mt-1">
              {(item as any).fileType || 'Unknown type'}
            </Text>
          </View>
        )}

        {/* Reply Reactions */}
        {item.reactions && item.reactions.length > 0 && (
          <View className="flex-row flex-wrap mt-2">
            {item.reactions.map((reaction, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => handleReaction(item.id, reaction.emoji)}
                className="bg-gray-100 rounded-full px-2 py-1 mr-1 mb-1"
              >
                <Text className="text-xs">
                  {reaction.emoji} {reaction.count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View className="flex-row space-x-1">
        <TouchableOpacity
          onPress={() =>
            setShowEmojiPicker({ replyId: item.id, type: 'reply' })
          }
          className="bg-gray-50 rounded-full p-1"
        >
          <Text className="text-sm">😊</Text>
        </TouchableOpacity>

        {item.sender.id === 'current_user' && (
          <TouchableOpacity
            onPress={() => setEditingReply(item)}
            className="bg-gray-50 rounded-full p-1"
          >
            <MaterialIcon name="edit" size={14} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />

        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mr-3 p-1"
            >
              <MaterialIcon name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <MaterialIcon name="forum" size={20} color="#8B5CF6" />
            <Text className="text-lg font-semibold ml-2">Thread</Text>
          </View>

          <View className="flex-row items-center space-x-2">
            <Text className="text-sm text-gray-500">in #{channelName}</Text>
          </View>
        </View>

        {/* Content */}
        <FlatList
          ref={flatListRef}
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={renderParentMessage}
          ListFooterComponent={() => (
            <View>
              <View className="px-4 py-2">
                <Text className="text-sm text-gray-500 font-medium">
                  {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                </Text>
              </View>

              <FlatList
                data={replies}
                renderItem={renderReply}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            </View>
          )}
          keyExtractor={() => 'thread'}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />

        {/* Reply Input */}
        <View className="border-t border-gray-200">
          {editingReply && (
            <View className="flex-row items-center px-4 py-2 bg-orange-50 border-b border-orange-200">
              <MaterialIcon name="edit" size={16} color="#F97316" />
              <Text className="text-orange-600 text-sm font-medium ml-2 flex-1">
                Editing reply
              </Text>
              <TouchableOpacity onPress={() => setEditingReply(null)}>
                <MaterialIcon name="close" size={18} color="#F97316" />
              </TouchableOpacity>
            </View>
          )}

          <View className="px-3 py-3">
            <PromptInput
              onSendMessage={handleSendReply}
              onSendRecording={handleSendVoiceReply}
              onAttachFile={handleAttachFile}
              onAttachImage={handleAttachFile}
              placeholder={
                editingReply ? 'Edit your reply...' : 'Reply to this thread...'
              }
              maxLines={4}
              disabled={false}
            />
          </View>
        </View>

        {/* Emoji Picker */}
        <EmojiReactionPicker
          visible={!!showEmojiPicker}
          onClose={() => setShowEmojiPicker(null)}
          onEmojiSelect={emoji => {
            if (showEmojiPicker) {
              handleReaction(
                showEmojiPicker.replyId,
                emoji,
                showEmojiPicker.type === 'message',
              );
            }
          }}
          title={
            showEmojiPicker?.type === 'message'
              ? 'React to Message'
              : 'React to Reply'
          }
        />

      </View>
    </KeyboardAvoidingView>
  );
};
