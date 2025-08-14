import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChatMessage } from '../../components/chat/ChatMessage';
import { ChannelInput } from '../../components/chat/ChannelInput';
import { ChannelActions } from '../../components/chat/ChannelActions';
import { ChannelHeader } from '../../components/chat/ChannelHeader';
import { MeetingSummaryModal } from '../../components/chat/MeetingSummaryModal';
import { KeyPointsModal } from '../../components/chat/KeyPointsModal';
import { EmojiReactionPicker } from '../../components/chat/EmojiReactionPicker';
import type { Message, ChannelSummary } from '../../types/chat';
import type { MainStackParamList } from '../../navigation/MainNavigator';

type ChannelDetailScreenProps = NativeStackScreenProps<MainStackParamList, 'ChannelDetailScreen'>;

export const ChannelDetailScreen: React.FC<ChannelDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { channelId, channelName, members } = route.params;
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    content: string;
    sender: string;
  } | null>(null);
  const [editingMessage, setEditingMessage] = useState<{
    id: string;
    content: string;
  } | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showKeyPointsModal, setShowKeyPointsModal] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isCreatingTasks, setIsCreatingTasks] = useState(false);
  const [channelSummary, setChannelSummary] = useState<ChannelSummary | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);

  // Mock data for enhanced features - ensure all required properties
  const channels = [
    { id: 'ch1', name: 'general', description: 'General discussions' },
    { id: 'ch2', name: 'development', description: 'Development discussions' },
    { id: 'ch3', name: 'design', description: 'Design discussions' },
  ];

  const recentMessages = [
    { 
      id: 'msg1', 
      content: 'Great progress on the API design', 
      sender: { name: 'Sarah', id: '1', avatar: undefined }, 
      channel: channelName 
    },
    { 
      id: 'msg2', 
      content: 'Testing framework is ready', 
      sender: { name: 'Mike', id: '2', avatar: undefined }, 
      channel: channelName 
    },
  ];

  const tasks = [
    { id: 'task1', title: 'Complete wireframes', description: 'Create detailed wireframes for all screens' },
    { id: 'task2', title: 'API documentation', description: 'Document all REST endpoints' },
  ];

  // Ensure members array has proper structure
  const enhancedMembers = (members || []).map((member, index) => ({
    id: member?.id || `member_${index}`,
    name: member?.name || `User ${index + 1}`,
    role: member?.role || 'Member',
    avatar: member?.avatar || undefined,
    isOnline: member?.isOnline || true,
  }));

  // Load messages on mount
  useEffect(() => {
    loadMockMessages();
  }, []);

  const loadMockMessages = () => {
    const mockMessages: Message[] = [
      {
        id: '1',
        type: 'system',
        content: `Welcome to #${channelName}! This channel is for project collaboration and brainstorming.`,
        sender: { 
          id: 'system', 
          name: 'Javier AI', 
          role: 'assistant',
          avatar: undefined 
        },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        reactions: [],
        replies: [],
        mentions: [],
        isEdited: false,
      },
      {
        id: '2',
        type: 'text',
        content: "Let's start planning our approach. What are everyone's thoughts on the initial requirements?",
        sender: { 
          id: '1', 
          name: 'Sarah', 
          role: 'Project Manager',
          avatar: undefined 
        },
        timestamp: new Date(Date.now() - 90 * 60 * 1000),
        reactions: [{ emoji: '👍', users: ['2', '3'], count: 2 }],
        replies: [
          {
            id: 'r1',
            content: 'I think we should focus on the core features first',
            sender: { 
              id: '2', 
              name: 'Mike',
              avatar: undefined 
            },
            timestamp: new Date(Date.now() - 85 * 60 * 1000),
            reactions: [{ emoji: '💯', users: ['1'], count: 1 }],
          },
          {
            id: 'r2',
            content: 'Agreed! Let me create a wireframe for the main flow',
            sender: { 
              id: '3', 
              name: 'Lisa',
              avatar: undefined 
            },
            timestamp: new Date(Date.now() - 80 * 60 * 1000),
            reactions: [],
          },
        ],
        mentions: ['@everyone'],
        isEdited: false,
      },
      {
        id: '3',
        type: 'text',
        content: 'I can start working on the backend API design. Should we use REST or GraphQL?',
        sender: { 
          id: '2', 
          name: 'Mike', 
          role: 'Developer',
          avatar: undefined 
        },
        timestamp: new Date(Date.now() - 70 * 60 * 1000),
        reactions: [{ emoji: '🤔', users: ['1', '4'], count: 2 }],
        replies: [],
        mentions: [],
        isEdited: false,
      },
      {
        id: '4',
        type: 'voice',
        content: 'Voice message about design approach',
        voiceTranscript: 'I think for this project, REST would be simpler to implement and maintain. We can always migrate to GraphQL later if needed.',
        audioUri: 'mock://voice_4.m4a',
        sender: { 
          id: '4', 
          name: 'Alex', 
          role: 'Tech Lead',
          avatar: undefined 
        },
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        reactions: [{ emoji: '👌', users: ['2'], count: 1 }],
        replies: [],
        mentions: ['@Mike'],
        isEdited: false,
      },
      {
        id: '5',
        type: 'text',
        content: 'Here are the updated requirements. @Sarah please review when you have a chance.',
        sender: { 
          id: '5', 
          name: 'Emma', 
          role: 'Analyst',
          avatar: undefined 
        },
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        reactions: [],
        replies: [],
        mentions: ['Sarah'],
        isEdited: false,
      },
    ];
    setMessages(mockMessages);
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'text',
      content: text,
      sender: { id: 'current_user', name: 'You', role: 'Member' },
      timestamp: new Date(),
      reactions: [],
      replies: [],
      mentions: extractMentions(text),
      isEdited: false,
    };

    if (editingMessage) {
      // Update existing message
      setMessages(prev =>
        prev.map(msg =>
          msg.id === editingMessage.id
            ? { ...msg, content: text, isEdited: true }
            : msg,
        ),
      );
      setEditingMessage(null);
    } else if (replyingTo) {
      // Add as reply to existing message
      setMessages(prev =>
        prev.map(msg =>
          msg.id === replyingTo.id
            ? {
                ...msg,
                replies: [
                  ...msg.replies,
                  {
                    id: newMessage.id,
                    content: text,
                    sender: { id: 'current_user', name: 'You' },
                    timestamp: new Date(),
                    reactions: [],
                  },
                ],
              }
            : msg,
        ),
      );
      setReplyingTo(null);
    } else {
      // Add new message
      setMessages(prev => [...prev, newMessage]);
    }

    // Auto-scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendVoiceMessage = (audioUri: string, transcript?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'voice',
      content: 'Voice message',
      voiceTranscript: transcript,
      audioUri,
      sender: { id: 'current_user', name: 'You', role: 'Member' },
      timestamp: new Date(),
      reactions: [],
      replies: [],
      mentions: transcript ? extractMentions(transcript) : [],
      isEdited: false,
    };

    if (replyingTo) {
      // Add as reply to existing message
      setMessages(prev =>
        prev.map(msg =>
          msg.id === replyingTo.id
            ? {
                ...msg,
                replies: [
                  ...msg.replies,
                  {
                    id: newMessage.id,
                    content: newMessage.content,
                    sender: { id: 'current_user', name: 'You' },
                    timestamp: new Date(),
                    reactions: [],
                  },
                ],
              }
            : msg,
        ),
      );
      setReplyingTo(null);
    } else {
      setMessages(prev => [...prev, newMessage]);
    }
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleAttachFile = (file: any) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'text',
      content: `📎 ${file.name || 'File attachment'}`,
      sender: { id: 'current_user', name: 'You', role: 'Member' },
      timestamp: new Date(),
      reactions: [],
      replies: [],
      mentions: [],
      isEdited: false,
    };

    // Add file properties
    (newMessage as any).fileUri = file.uri;
    (newMessage as any).fileName = file.name;
    (newMessage as any).fileType = file.type;

    if (replyingTo) {
      // Add as reply to existing message
      setMessages(prev =>
        prev.map(msg =>
          msg.id === replyingTo.id
            ? {
                ...msg,
                replies: [
                  ...msg.replies,
                  {
                    id: newMessage.id,
                    content: newMessage.content,
                    sender: { id: 'current_user', name: 'You' },
                    timestamp: new Date(),
                    reactions: [],
                  },
                ],
              }
            : msg,
        ),
      );
      setReplyingTo(null);
    } else {
      setMessages(prev => [...prev, newMessage]);
    }
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages(prev =>
      prev.map(msg => {
        if (msg.id === messageId) {
          const existingReaction = msg.reactions.find(r => r.emoji === emoji);
          
          if (existingReaction) {
            if (existingReaction.users.includes('current_user')) {
              // Remove reaction
              const updatedUsers = existingReaction.users.filter(u => u !== 'current_user');
              if (updatedUsers.length === 0) {
                return {
                  ...msg,
                  reactions: msg.reactions.filter(r => r.emoji !== emoji),
                };
              } else {
                return {
                  ...msg,
                  reactions: msg.reactions.map(r =>
                    r.emoji === emoji
                      ? { ...r, users: updatedUsers, count: updatedUsers.length }
                      : r,
                  ),
                };
              }
            } else {
              // Add reaction
              return {
                ...msg,
                reactions: msg.reactions.map(r =>
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
              ...msg,
              reactions: [
                ...msg.reactions,
                {
                  emoji,
                  users: ['current_user'],
                  count: 1,
                },
              ],
            };
          }
        }
        return msg;
      }),
    );
  };

  const handleReply = (message: Message) => {
    if (message.replies && message.replies.length > 0) {
      // Navigate to thread screen
      navigation.navigate('ThreadScreen', {
        parentMessage: message,
        channelId,
        channelName,
        members,
        channels,
        onUpdateMessage: (messageId: string, replies: any[]) => {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === messageId ? { ...msg, replies } : msg
            )
          );
        },
      });
    } else {
      // Start reply
      setReplyingTo({
        id: message.id,
        content: message.content,
        sender: message.sender.name,
      });
    }
  };

  const handleEdit = (message: Message) => {
    setEditingMessage({
      id: message.id,
      content: message.content,
    });
  };

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockSummary: ChannelSummary = {
      id: Date.now().toString(),
      title: `${channelName} Discussion Summary`,
      keyPoints: [
        'Project requirements discussion initiated',
        'Team agreed to focus on core features first',
        'Backend API approach decided (REST over GraphQL)',
        'Design wireframes to be created by Lisa',
        'Updated requirements shared for review',
      ],
      decisions: [
        'Use REST API for simplicity and maintainability',
        'Prioritize core features in initial development',
        'Lisa to create wireframes for main user flow',
      ],
      actionItems: [
        {
          id: 'task1',
          title: 'Create wireframes for main user flow',
          assigneeId: '3',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          priority: 'high',
        },
        {
          id: 'task2',
          title: 'Design REST API structure',
          assigneeId: '2',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          priority: 'medium',
        },
      ],
      participants: ['Sarah', 'Mike', 'Lisa', 'Alex', 'Emma', 'You'],
      duration: '2 hours',
      generatedAt: new Date(),
    };

    setChannelSummary(mockSummary);
    setIsGeneratingSummary(false);
    setShowSummaryModal(true);
  };

  const handleCreateTasks = async () => {
    setIsCreatingTasks(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsCreatingTasks(false);
    setShowKeyPointsModal(true);
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
        // Scroll to message or show it highlighted
        const messageIndex = messages.findIndex(msg => msg.id === id);
        if (messageIndex !== -1) {
          flatListRef.current?.scrollToIndex({ index: messageIndex, animated: true });
        }
        break;
      case 'task':
        navigation.navigate('TaskDetailScreen', { taskId: id });
        break;
      default:
        break;
    }
  };

  const handleNavigateToUser = (userId: string) => {
    navigation.navigate('UserProfile', { userId });
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <ChatMessage
      message={item}
      onReply={() => handleReply(item)}
      onReaction={(emoji) => handleReaction(item.id, emoji)}
      onEdit={item.sender.id === 'current_user' ? () => handleEdit(item) : undefined}
      onShowEmojiPicker={() => setShowEmojiPicker(item.id)}
      onNavigateToUser={handleNavigateToUser}
      onNavigateToReference={handleNavigateToReference}
      isOwnMessage={item.sender.id === 'current_user'}
    />
  );

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
          members={members}
          onBack={() => navigation.goBack()}
          onMembersPress={() => {
            Alert.alert('Members', 'Show channel members');
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
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />

        {/* Input */}
        <ChannelInput
          onSendMessage={handleSendMessage}
          onSendVoiceMessage={handleSendVoiceMessage}
          onAttachFile={handleAttachFile}
          onAttachImage={handleAttachFile}
          placeholder={`Message #${channelName}`}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          editingMessage={editingMessage}
          onCancelEdit={() => setEditingMessage(null)}
        />

        {/* Emoji Picker */}
        <EmojiReactionPicker
          visible={!!showEmojiPicker}
          onClose={() => setShowEmojiPicker(null)}
          onEmojiSelect={(emoji) => {
            if (showEmojiPicker) {
              handleReaction(showEmojiPicker, emoji);
              setShowEmojiPicker(null);
            }
          }}
          title="React to Message"
        />


        {/* Meeting Summary Modal */}
        <MeetingSummaryModal
          visible={showSummaryModal}
          summary={channelSummary}
          onClose={() => setShowSummaryModal(false)}
          onShare={() => {
            Alert.alert('Success', 'Meeting summary shared with team');
            setShowSummaryModal(false);
          }}
          onCreateTasks={() => {
            Alert.alert('Success', 'Tasks created from action items');
            setShowSummaryModal(false);
          }}
        />

        {/* Key Points Modal */}
        <KeyPointsModal
          visible={showKeyPointsModal}
          messages={messages}
          onClose={() => setShowKeyPointsModal(false)}
          onCreateTask={(taskData) => {
            Alert.alert('Success', `Task "${taskData.title}" created`);
            setShowKeyPointsModal(false);
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
};