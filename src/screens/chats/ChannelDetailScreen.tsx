import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
  StatusBar,
  Alert,
  PanResponder,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  useAnimatedScrollHandler,
  runOnJS,
  useAnimatedGestureHandler,
} from 'react-native-reanimated';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { VoiceMessageInput } from '../../components/chat/VoiceMessageInput';
import { ChannelHeader } from '../../components/chat/ChannelHeader';
import { MeetingSummaryModal } from '../../components/chat/MeetingSummaryModal';
import { KeyPointsModal } from '../../components/chat/KeyPointsModal';
import { MentionInput } from '../../components/chat/MentionInput';
import { EmojiPicker } from '../../components/chat/EmojiPicker';
import type { Message, ChannelSummary } from '../../types/chat';

const { width, height } = Dimensions.get('window');

interface ChannelDetailScreenProps {
  navigation: any;
  route: {
    params: {
      channelId: string;
      channelName: string;
      members: any[];
    };
  };
}

export const ChannelDetailScreen: React.FC<ChannelDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { channelId, channelName, members } = route.params;
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showKeyPointsModal, setShowKeyPointsModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editingReply, setEditingReply] = useState<{
    messageId: string;
    replyId: string;
    content: string;
  } | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [replyingToReply, setReplyingToReply] = useState<{
    messageId: string;
    replyId: string;
    replyAuthor: string;
  } | null>(null);
  const [showEmojiReactionPicker, setShowEmojiReactionPicker] = useState<
    string | null
  >(null);
  const [showReplyEmojiPicker, setShowReplyEmojiPicker] = useState<{
    messageId: string;
    replyId: string;
  } | null>(null);
  const [channelSummary, setChannelSummary] = useState<ChannelSummary | null>(
    null,
  );
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingKeyPoints, setIsGeneratingKeyPoints] = useState(false);

  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  // Animations
  const headerOpacity = useSharedValue(1);
  const inputScale = useSharedValue(1);
  const summaryButtonScale = useSharedValue(1);
  const keyPointsButtonScale = useSharedValue(1);
  const scrollY = useSharedValue(0);

  // Mock data for demonstration
  useEffect(() => {
    loadMockMessages();
  }, []);

  const loadMockMessages = () => {
    const mockMessages: Message[] = [
      {
        id: '1',
        type: 'system',
        content: 'Channel created: E-commerce Website Project',
        sender: { id: 'system', name: 'Javier AI', role: 'assistant' },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        reactions: [],
        replies: [],
        mentions: [],
        isEdited: false,
      },
      {
        id: '2',
        type: 'text',
        content:
          "Welcome everyone! Let's start planning our e-commerce platform. First, we need to finalize the tech stack.",
        sender: { id: '1', name: 'Sarah (PM)', role: 'Project Manager' },
        timestamp: new Date(Date.now() - 90 * 60 * 1000),
        reactions: [{ emoji: '👍', users: ['2', '3'], count: 2 }],
        replies: [],
        mentions: ['@everyone'],
        isEdited: false,
      },
      {
        id: '3',
        type: 'text',
        content:
          'I suggest we go with React Native for mobile and Next.js for web. MongoDB for database.',
        sender: {
          id: '2',
          name: 'Mike (Engineering Lead)',
          role: 'Engineering Lead',
        },
        timestamp: new Date(Date.now() - 85 * 60 * 1000),
        reactions: [{ emoji: '💯', users: ['1', '4'], count: 2 }],
        replies: [
          {
            id: 'r1',
            content: 'Great choice! MongoDB will scale well.',
            sender: { id: '1', name: 'Sarah (PM)' },
            timestamp: new Date(Date.now() - 80 * 60 * 1000),
          },
        ],
        mentions: [],
        isEdited: false,
      },
      {
        id: '4',
        type: 'voice',
        content: 'Voice message about UI designs',
        voiceTranscript:
          "For the UI, I'm thinking of a modern, minimalist design with a focus on user experience. We should use a consistent color scheme and typography throughout.",
        audioUri: 'mock://voice_4.m4a',
        sender: {
          id: '3',
          name: 'Lisa (Lead Designer)',
          role: 'Lead Designer',
        },
        timestamp: new Date(Date.now() - 70 * 60 * 1000),
        reactions: [],
        replies: [],
        mentions: ['@Mike'],
        isEdited: false,
      },
    ];
    setMessages(mockMessages);
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;

      // Hide header when scrolling up
      const opacity = interpolate(
        event.contentOffset.y,
        [0, 100],
        [1, 0.8],
        'clamp',
      );
      headerOpacity.value = withTiming(opacity);
    },
  });

  const handleSendMessage = (
    text: string,
    voiceUri?: string,
    transcript?: string,
  ) => {
    if (!text.trim() && !voiceUri) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: voiceUri ? 'voice' : 'text',
      content: text,
      voiceTranscript: transcript,
      audioUri: voiceUri,
      sender: { id: 'current_user', name: 'You', role: 'Member' },
      timestamp: new Date(),
      reactions: [],
      replies: replyingTo ? [] : [], // Initialize empty replies array
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
    } else if (editingReply) {
      // Update existing reply
      setMessages(prev =>
        prev.map(msg =>
          msg.id === editingReply.messageId
            ? {
                ...msg,
                replies: msg.replies.map(reply =>
                  reply.id === editingReply.replyId
                    ? { ...reply, content: text }
                    : reply,
                ),
              }
            : msg,
        ),
      );
      setEditingReply(null);
    } else if (replyingToReply) {
      // Add as reply to a reply (nested)
      setMessages(prev =>
        prev.map(msg =>
          msg.id === replyingToReply.messageId
            ? {
                ...msg,
                replies: [
                  ...msg.replies,
                  {
                    id: newMessage.id,
                    content: `@${replyingToReply.replyAuthor} ${text}`,
                    sender: { id: 'current_user', name: 'You' },
                    timestamp: new Date(),
                  },
                ],
              }
            : msg,
        ),
      );
      setReplyingToReply(null);
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

    setInputText('');

    // Auto-scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Animation feedback
    inputScale.value = withSequence(
      withSpring(1.05, { damping: 10 }),
      withSpring(1, { damping: 10 }),
    );
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
              existingReaction.users = existingReaction.users.filter(
                u => u !== 'current_user',
              );
              existingReaction.count -= 1;
              if (existingReaction.count === 0) {
                msg.reactions = msg.reactions.filter(r => r.emoji !== emoji);
              }
            } else {
              // Add reaction
              existingReaction.users.push('current_user');
              existingReaction.count += 1;
            }
          } else {
            // New reaction
            msg.reactions.push({
              emoji,
              users: ['current_user'],
              count: 1,
            });
          }
        }
        return msg;
      }),
    );
    setShowEmojiReactionPicker(null);
  };

  const handleReplyEdit = (
    messageId: string,
    replyId: string,
    content: string,
  ) => {
    setEditingReply({ messageId, replyId, content });
    setInputText(content);
    inputRef.current?.focus();
  };

  const handleMessageSelect = (messageId: string) => {
    setSelectedMessage(messageId === selectedMessage ? null : messageId);
  };

  const handleReplyReaction = (messageId: string, replyId: string, emoji: string) => {
    setMessages(prev =>
      prev.map(msg => {
        if (msg.id === messageId) {
          msg.replies = msg.replies.map(reply => {
            if (reply.id === replyId) {
              const reactions = (reply as any).reactions || [];
              const existingReaction = reactions.find((r: any) => r.emoji === emoji);
              if (existingReaction) {
                if (existingReaction.users.includes('current_user')) {
                  existingReaction.users = existingReaction.users.filter((u: string) => u !== 'current_user');
                  existingReaction.count -= 1;
                  if (existingReaction.count === 0) {
                    (reply as any).reactions = reactions.filter((r: any) => r.emoji !== emoji);
                  }
                } else {
                  existingReaction.users.push('current_user');
                  existingReaction.count += 1;
                }
              } else {
                reactions.push({
                  emoji,
                  users: ['current_user'],
                  count: 1,
                });
                (reply as any).reactions = reactions;
              }
            }
            return reply;
          });
        }
        return msg;
      }),
    );
    setShowReplyEmojiPicker(null);
  };

  const handleSwipeReply = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setReplyingTo(message);
      setSelectedMessage(messageId);
      inputRef.current?.focus();
    }
  };

  // Swipeable Message Component
  const SwipeableMessage = ({ message, children }: { message: any; children: React.ReactNode }) => {
    const translateX = useSharedValue(0);
    const opacity = useSharedValue(0);

    const gestureHandler = useAnimatedGestureHandler({
      onStart: () => {
        opacity.value = withTiming(1);
      },
      onActive: (event) => {
        translateX.value = Math.min(event.translationX, 100);
      },
      onEnd: (event) => {
        if (event.translationX > 50) {
          runOnJS(handleSwipeReply)(message.id);
        }
        translateX.value = withSpring(0);
        opacity.value = withTiming(0);
      },
    });

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }],
    }));

    const replyIconStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ scale: interpolate(translateX.value, [0, 50], [0.8, 1.2]) }],
    }));

    return (
      <View style={{ position: 'relative' }}>
        <Animated.View
          style={[
            replyIconStyle,
            {
              position: 'absolute',
              left: 10,
              top: '50%',
              zIndex: 1,
              backgroundColor: '#3B82F6',
              borderRadius: 20,
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}
        >
          <Text style={{ color: 'white', fontSize: 18 }}>↩️</Text>
        </Animated.View>
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={animatedStyle}>
            {children}
          </Animated.View>
        </PanGestureHandler>
      </View>
    );
  };

  const updateMessage = (messageId: string, newContent: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? { ...msg, content: newContent, isEdited: true }
          : msg,
      ),
    );
  };

  const generateMeetingSummary = async () => {
    setIsGeneratingSummary(true);
    summaryButtonScale.value = withSequence(withSpring(0.95), withSpring(1));

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockSummary: ChannelSummary = {
      id: Date.now().toString(),
      title: 'E-commerce Project Planning Session',
      keyPoints: [
        'Tech stack decided: React Native + Next.js + MongoDB',
        'UI design approach: Modern minimalist with focus on UX',
        'Database scaling considerations discussed',
        'Team roles and responsibilities clarified',
      ],
      decisions: [
        'Use React Native for mobile development',
        'Implement MongoDB for scalable database solution',
        'Adopt minimalist design principles',
      ],
      actionItems: [
        {
          id: 'task1',
          title: 'Create initial wireframes',
          assigneeId: '3',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          priority: 'high',
        },
        {
          id: 'task2',
          title: 'Set up development environment',
          assigneeId: '2',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          priority: 'medium',
        },
      ],
      participants: [
        'Sarah (PM)',
        'Mike (Engineering Lead)',
        'Lisa (Lead Designer)',
        'You',
      ],
      duration: '2 hours 15 minutes',
      generatedAt: new Date(),
    };

    setChannelSummary(mockSummary);
    setIsGeneratingSummary(false);
    setShowSummaryModal(true);
  };

  const generateKeyPoints = async () => {
    setIsGeneratingKeyPoints(true);
    keyPointsButtonScale.value = withSequence(withSpring(0.95), withSpring(1));

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsGeneratingKeyPoints(false);
    setShowKeyPointsModal(true);
  };

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [
      {
        translateY: interpolate(scrollY.value, [0, 100], [0, -20], 'clamp'),
      },
    ],
  }));

  const inputAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: inputScale.value }],
  }));

  const summaryButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: summaryButtonScale.value }],
  }));

  const keyPointsButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: keyPointsButtonScale.value }],
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />

      {/* Header */}
      <Animated.View style={[headerAnimatedStyle]}>
        <ChannelHeader
          channelName={channelName}
          members={members}
          onBack={() => navigation.goBack()}
          onMembersPress={() => {
            /* Show members modal */
          }}
        />
      </Animated.View>

      {/* AI Action Buttons */}
      <View className="flex-row px-4 py-2 space-x-2">
        <Animated.View style={summaryButtonAnimatedStyle} className="flex-1">
          <TouchableOpacity
            onPress={generateMeetingSummary}
            disabled={isGeneratingSummary}
            className="bg-blue-500 rounded-full py-2 px-4 flex-row items-center justify-center"
            style={{
              shadowColor: '#3B82F6',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Text className="text-white text-sm font-semibold mr-2">
              {isGeneratingSummary ? '⏳' : '📝'}
            </Text>
            <Text className="text-white text-sm font-semibold">
              {isGeneratingSummary ? 'Generating...' : 'Meeting Summary'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={keyPointsButtonAnimatedStyle} className="flex-1">
          <TouchableOpacity
            onPress={generateKeyPoints}
            disabled={isGeneratingKeyPoints}
            className="bg-purple-500 rounded-full py-2 px-4 flex-row items-center justify-center"
            style={{
              shadowColor: '#8B5CF6',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Text className="text-white text-sm font-semibold mr-2">
              {isGeneratingKeyPoints ? '⏳' : '💡'}
            </Text>
            <Text className="text-white text-sm font-semibold">
              {isGeneratingKeyPoints ? 'Processing...' : 'Key Points'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Messages List */}
      <Animated.ScrollView
        ref={scrollViewRef}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message, index) => (
          <View key={message.id}>
            {/* Swipeable Message Bubble */}
            <SwipeableMessage message={message}>
              <TouchableOpacity
                onPress={() => handleMessageSelect(message.id)}
                onLongPress={() => setShowEmojiReactionPicker(message.id)}
                style={{
                  backgroundColor:
                    selectedMessage === message.id ? '#E0F2FE' : 'transparent',
                  borderRadius: 8,
                  padding: 4,
                  marginVertical: 2,
                  borderWidth: selectedMessage === message.id ? 2 : 0,
                  borderColor: selectedMessage === message.id ? '#3B82F6' : 'transparent',
                }}
              >
                <MessageBubble
                  message={message}
                  isOwn={message.sender.id === 'current_user'}
                  onReaction={emoji => handleReaction(message.id, emoji)}
                  onReply={() => setReplyingTo(message)}
                  onEdit={() => {
                    setEditingMessage(message);
                    setInputText(message.content);
                    inputRef.current?.focus();
                  }}
                  onLongPress={() => setShowEmojiReactionPicker(message.id)}
                  showConnector={false}
                />
                
                {/* Reply Button */}
                <TouchableOpacity
                  onPress={() => {
                    setReplyingTo(message);
                    setSelectedMessage(message.id);
                    inputRef.current?.focus();
                  }}
                  style={{
                    position: 'absolute',
                    bottom: 5,
                    right: 5,
                    backgroundColor: '#F3F4F6',
                    borderRadius: 12,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                  }}
                >
                  <Text style={{ fontSize: 12, color: '#6B7280' }}>Reply</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </SwipeableMessage>

            {/* Message Action Buttons (when selected) */}
            {selectedMessage === message.id && (
              <View className="flex-row justify-center space-x-4 mt-2 mb-4">
                <TouchableOpacity
                  onPress={() => {
                    setReplyingTo(message);
                    setSelectedMessage(null);
                  }}
                  className="bg-blue-500 px-4 py-2 rounded-full"
                >
                  <Text className="text-white text-sm font-medium">Reply</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowEmojiReactionPicker(message.id)}
                  className="bg-yellow-500 px-4 py-2 rounded-full"
                >
                  <Text className="text-white text-sm font-medium">React</Text>
                </TouchableOpacity>
                {message.sender.id === 'current_user' && (
                  <TouchableOpacity
                    onPress={() => {
                      setEditingMessage(message);
                      setInputText(message.content);
                      inputRef.current?.focus();
                      setSelectedMessage(null);
                    }}
                    className="bg-orange-500 px-4 py-2 rounded-full"
                  >
                    <Text className="text-white text-sm font-medium">Edit</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Enhanced Replies Section */}
            {message.replies && message.replies.length > 0 && (
              <View className="ml-8 mt-2">
                {message.replies.map((reply, replyIndex) => (
                  <View key={reply.id} className="mb-3">
                    <View className="bg-gray-50 p-3 rounded-lg border-l-4 border-gray-300">
                      <View className="flex-row justify-between items-start">
                        <View className="flex-1">
                          <Text className="font-medium text-sm text-blue-600">
                            {reply.sender.name}
                          </Text>
                          <Text className="text-gray-700 mt-1">
                            {reply.content}
                          </Text>
                          <Text className="text-xs text-gray-500 mt-1">
                            {reply.timestamp.toLocaleTimeString()}
                          </Text>
                          
                          {/* Reply Reactions */}
                          {(reply as any).reactions && (reply as any).reactions.length > 0 && (
                            <View className="flex-row mt-2">
                              {(reply as any).reactions.map((reaction: any, idx: number) => (
                                <TouchableOpacity
                                  key={idx}
                                  onPress={() => handleReplyReaction(message.id, reply.id, reaction.emoji)}
                                  className="bg-white rounded-full px-2 py-1 mr-1 border border-gray-200"
                                >
                                  <Text className="text-xs">
                                    {reaction.emoji} {reaction.count}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          )}
                        </View>
                        
                        {/* Reply Actions */}
                        <View className="flex-row space-x-1">
                          <TouchableOpacity
                            onPress={() => setShowReplyEmojiPicker({ messageId: message.id, replyId: reply.id })}
                            className="bg-gray-200 rounded-full p-1"
                          >
                            <Text style={{ fontSize: 12 }}>😊</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => setReplyingToReply({ 
                              messageId: message.id, 
                              replyId: reply.id, 
                              replyAuthor: reply.sender.name 
                            })}
                            className="bg-blue-100 rounded-full px-2 py-1"
                          >
                            <Text className="text-blue-600 text-xs">Reply</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                    
                    {/* Edit Reply Button for own replies */}
                    {reply.sender?.id === 'current_user' && (
                      <TouchableOpacity
                        onPress={() => handleReplyEdit(message.id, reply.id, reply.content)}
                        className="bg-gray-200 px-3 py-1 rounded-full mt-1 self-start"
                      >
                        <Text className="text-gray-600 text-xs">Edit Reply</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </Animated.ScrollView>

      {/* Reply Preview */}
      {replyingTo && (
        <View className="bg-blue-50 border-l-4 border-blue-500 px-4 py-2 mx-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-blue-600 text-sm font-medium">
              Replying to {replyingTo.sender.name}
            </Text>
            <TouchableOpacity onPress={() => setReplyingTo(null)}>
              <Text className="text-blue-600 text-lg">×</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-gray-600 text-sm" numberOfLines={1}>
            {replyingTo.content}
          </Text>
        </View>
      )}

      {/* Edit Preview */}
      {editingMessage && (
        <View className="bg-orange-50 border-l-4 border-orange-500 px-4 py-2 mx-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-orange-600 text-sm font-medium">
              Editing message
            </Text>
            <TouchableOpacity
              onPress={() => {
                setEditingMessage(null);
                setInputText('');
              }}
            >
              <Text className="text-orange-600 text-lg">×</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Reply to Reply Preview */}
      {replyingToReply && (
        <View className="bg-purple-50 border-l-4 border-purple-500 px-4 py-2 mx-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-purple-600 text-sm font-medium">
              Replying to {replyingToReply.replyAuthor}'s reply
            </Text>
            <TouchableOpacity onPress={() => setReplyingToReply(null)}>
              <Text className="text-purple-600 text-lg">×</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Edit Reply Preview */}
      {editingReply && (
        <View className="bg-green-50 border-l-4 border-green-500 px-4 py-2 mx-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-green-600 text-sm font-medium">
              Editing reply
            </Text>
            <TouchableOpacity
              onPress={() => {
                setEditingReply(null);
                setInputText('');
              }}
            >
              <Text className="text-green-600 text-lg">×</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Voice Input */}
      <Animated.View style={inputAnimatedStyle}>
        <View className="px-4 py-2 bg-white">
          {/* Recording Status */}
          {isVoiceMode && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-3 h-3 bg-red-500 rounded-full mr-2" />
                  <Text className="text-red-600 font-medium">
                    Recording... (Voice mode active)
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsVoiceMode(false)}
                  className="bg-red-100 rounded-full px-3 py-1"
                >
                  <Text className="text-red-600 text-xs font-medium">Stop</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Input Container */}
          <View
            className="bg-white border-2 border-blue-500 rounded-3xl px-4 py-2"
            style={{
              shadowColor: '#3B82F6',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View className="flex-row items-end">
              {/* Action Buttons */}
              <View className="flex-row mr-3">
                <TouchableOpacity
                  onPress={() => {
                    /* Handle file picker */
                  }}
                  className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-2"
                  disabled={isVoiceMode}
                >
                  <Text className="text-blue-600 text-lg">📎</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    /* Handle image picker */
                  }}
                  className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-2"
                  disabled={isVoiceMode}
                >
                  <Text className="text-blue-600 text-lg">📷</Text>
                </TouchableOpacity>
              </View>

              {/* Mention Input */}
              <View className="flex-1 mr-3">
                {!isVoiceMode ? (
                  <MentionInput
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder={
                      editingMessage
                        ? 'Edit your message...'
                        : editingReply
                          ? 'Edit your reply...'
                          : replyingToReply
                            ? `Reply to ${replyingToReply.replyAuthor}...`
                            : replyingTo
                              ? 'Reply to message...'
                              : 'Type a message or hold mic to record...'
                    }
                    members={members}
                    onFocus={() => (inputScale.value = withSpring(1.02))}
                    onBlur={() => (inputScale.value = withSpring(1))}
                    multiline
                    maxHeight={120}
                  />
                ) : (
                  <View className="py-2">
                    <Text className="text-gray-500">
                      Voice recording mode active...
                    </Text>
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View className="flex-row items-center space-x-2">
                {/* Emoji Button */}
                <TouchableOpacity
                  onPress={() => setShowEmojiPicker(true)}
                  className="w-10 h-10 bg-yellow-100 rounded-full items-center justify-center"
                  disabled={isVoiceMode}
                >
                  <Text className="text-lg">😊</Text>
                </TouchableOpacity>

                {/* Voice/Send Button */}
                {inputText.trim() ? (
                  <TouchableOpacity
                    onPress={() => handleSendMessage(inputText)}
                    className="w-12 h-12 bg-blue-600 rounded-full items-center justify-center"
                    style={{
                      shadowColor: '#3B82F6',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 6,
                      elevation: 6,
                    }}
                  >
                    <Text className="text-white text-lg">🚀</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      setIsVoiceMode(!isVoiceMode);
                      if (!isVoiceMode) {
                        // Start voice recording simulation
                        setTimeout(() => {
                          const mockTranscript =
                            'This is a mock voice message transcript';
                          handleSendMessage(
                            mockTranscript,
                            'mock_audio_uri.m4a',
                            mockTranscript,
                          );
                          setIsVoiceMode(false);
                        }, 3000);
                      }
                    }}
                    className={`w-12 h-12 rounded-full items-center justify-center ${
                      isVoiceMode ? 'bg-red-500' : 'bg-blue-600'
                    }`}
                    style={{
                      shadowColor: isVoiceMode ? '#EF4444' : '#3B82F6',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 6,
                      elevation: 6,
                    }}
                  >
                    <Text className="text-white text-lg">
                      {isVoiceMode ? '📤' : '🎤'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Emoji Picker Modal */}
      <Modal
        visible={showEmojiPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEmojiPicker(false)}
      >
        <EmojiPicker
          onEmojiSelect={emoji => {
            setInputText(prev => prev + emoji);
            setShowEmojiPicker(false);
          }}
          onClose={() => setShowEmojiPicker(false)}
        />
      </Modal>

      {/* Emoji Reaction Picker Modal */}
      <Modal
        visible={!!showEmojiReactionPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEmojiReactionPicker(null)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => setShowEmojiReactionPicker(null)}
        >
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 20,
              margin: 20,
              minWidth: 300,
            }}
          >
            <Text className="text-lg font-semibold mb-4 text-center">
              React to this message
            </Text>
            <View className="flex-row flex-wrap justify-center">
              {[
                '😀',
                '😂',
                '😍',
                '😢',
                '😮',
                '😡',
                '👍',
                '👎',
                '❤️',
                '🔥',
                '👏',
                '🎉',
              ].map(emoji => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => {
                    if (showEmojiReactionPicker) {
                      handleReaction(showEmojiReactionPicker, emoji);
                    }
                  }}
                  className="p-3 m-1 bg-gray-100 rounded-full"
                >
                  <Text style={{ fontSize: 24 }}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => setShowEmojiReactionPicker(null)}
              className="mt-4 bg-gray-200 py-2 px-4 rounded-full self-center"
            >
              <Text className="text-gray-600 font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Reply Emoji Reaction Picker Modal */}
      <Modal
        visible={!!showReplyEmojiPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReplyEmojiPicker(null)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => setShowReplyEmojiPicker(null)}
        >
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 20,
              margin: 20,
              minWidth: 300,
            }}
          >
            <Text className="text-lg font-semibold mb-4 text-center">
              React to this reply
            </Text>
            <View className="flex-row flex-wrap justify-center">
              {[
                '😀',
                '😂',
                '😍',
                '😢',
                '😮',
                '😡',
                '👍',
                '👎',
                '❤️',
                '🔥',
                '👏',
                '🎉',
              ].map(emoji => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => {
                    if (showReplyEmojiPicker) {
                      handleReplyReaction(
                        showReplyEmojiPicker.messageId,
                        showReplyEmojiPicker.replyId,
                        emoji
                      );
                    }
                  }}
                  className="p-3 m-1 bg-gray-100 rounded-full"
                >
                  <Text style={{ fontSize: 24 }}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => setShowReplyEmojiPicker(null)}
              className="mt-4 bg-gray-200 py-2 px-4 rounded-full self-center"
            >
              <Text className="text-gray-600 font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Meeting Summary Modal */}
      <MeetingSummaryModal
        visible={showSummaryModal}
        summary={channelSummary}
        onClose={() => setShowSummaryModal(false)}
        onShare={() => {
          // Share summary functionality
          Alert.alert(
            'Summary Shared',
            'Meeting summary has been shared with all members',
          );
        }}
        onCreateTasks={() => {
          // Create tasks from action items
          Alert.alert(
            'Tasks Created',
            'Action items have been converted to tasks',
          );
        }}
      />

      {/* Key Points Modal */}
      <KeyPointsModal
        visible={showKeyPointsModal}
        messages={messages}
        onClose={() => setShowKeyPointsModal(false)}
        onCreateTask={taskData => {
          // Create task from key point
          console.log('Creating task:', taskData);
          Alert.alert(
            'Task Created',
            `Task "${taskData.title}" has been created`,
          );
        }}
      />
    </View>
    </GestureHandlerRootView>
  );
};
