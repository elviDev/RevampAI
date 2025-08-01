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
  KeyboardAvoidingView,
  Platform,
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
import {
  PanGestureHandler,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { ChannelHeader } from '../../components/chat/ChannelHeader';
import { MeetingSummaryModal } from '../../components/chat/MeetingSummaryModal';
import { KeyPointsModal } from '../../components/chat/KeyPointsModal';
import { MentionInput } from '../../components/chat/MentionInput';
import { EmojiPicker } from '../../components/chat/EmojiPicker';
import { PromptInput } from '../../components/voice/PromptInput';
import type { Message, ChannelSummary } from '../../types/chat';
import Feather from 'react-native-vector-icons/Feather';
import IonIcon from 'react-native-vector-icons/Ionicons';

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
  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [showAttachmentPicker, setShowAttachmentPicker] = useState(false);
  const [isAiEnhancing, setIsAiEnhancing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);
  const [collapsedReplies, setCollapsedReplies] = useState<Set<string>>(
    new Set(),
  );
  const [mentionCursorPosition, setMentionCursorPosition] = useState<
    number | null
  >(null);
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
            replies: [
              {
                id: 'r1-1',
                content: '@Sarah Exactly! And it integrates well with Node.js',
                sender: { id: '2', name: 'Mike (Engineering Lead)' },
                timestamp: new Date(Date.now() - 75 * 60 * 1000),
                mentions: ['Sarah'],
                replies: [
                  {
                    id: 'r1-1-1',
                    content: '@Mike True, the ecosystem is mature now',
                    sender: { id: '4', name: 'Alex (Backend Dev)' },
                    timestamp: new Date(Date.now() - 70 * 60 * 1000),
                    mentions: ['Mike'],
                    replies: [],
                  },
                ],
              },
              {
                id: 'r1-2',
                content:
                  '@Sarah Should we also consider PostgreSQL as an alternative?',
                sender: { id: '4', name: 'Alex (Backend Dev)' },
                timestamp: new Date(Date.now() - 78 * 60 * 1000),
                mentions: ['Sarah'],
                replies: [],
              },
            ],
          } as any,
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
      {
        id: '5',
        type: 'text',
        content:
          'What about deployment strategy? Should we consider Docker containers?',
        sender: {
          id: '4',
          name: 'Alex (Backend Dev)',
          role: 'Backend Developer',
        },
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        reactions: [{ emoji: '🤔', users: ['1', '2'], count: 2 }],
        replies: [],
        mentions: [],
        isEdited: false,
      },
      {
        id: '6',
        type: 'text',
        content:
          'Testing strategy is also important. We need unit tests, integration tests, and E2E tests.',
        sender: { id: '5', name: 'Emma (QA Lead)', role: 'QA Lead' },
        timestamp: new Date(Date.now() - 50 * 60 * 1000),
        reactions: [{ emoji: '✅', users: ['1', '2', '3'], count: 3 }],
        replies: [
          {
            id: 'r2',
            content: 'I can help with setting up the testing framework',
            sender: { id: '2', name: 'Mike (Engineering Lead)' },
            timestamp: new Date(Date.now() - 45 * 60 * 1000),
            replies: [],
          } as any,
        ],
        mentions: [],
        isEdited: false,
      },
      {
        id: '7',
        type: 'text',
        content: 'Timeline looks good. When do we start the sprint?',
        sender: { id: '1', name: 'Sarah (PM)', role: 'Project Manager' },
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        reactions: [],
        replies: [],
        mentions: [],
        isEdited: false,
      },
      {
        id: '8',
        type: 'text',
        content: 'Let me know if you need any design assets or mockups.',
        sender: {
          id: '3',
          name: 'Lisa (Lead Designer)',
          role: 'Lead Designer',
        },
        timestamp: new Date(Date.now() - 20 * 60 * 1000),
        reactions: [{ emoji: '🎨', users: ['1'], count: 1 }],
        replies: [],
        mentions: [],
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
    if (!text.trim() && !voiceUri && !selectedFile) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: selectedFile ? 'text' : voiceUri ? 'voice' : 'text',
      content: text || (selectedFile ? `📎 ${selectedFile.name}` : ''),
      voiceTranscript: transcript,
      audioUri: voiceUri,
      sender: { id: 'current_user', name: 'You', role: 'Member' },
      timestamp: new Date(),
      reactions: [],
      replies: [],
      mentions: extractMentions(text),
      isEdited: false,
    } as any;

    // Add file attachment properties if file is selected
    if (selectedFile) {
      (newMessage as any).fileUri = selectedFile.uri;
      (newMessage as any).fileName = selectedFile.name;
      (newMessage as any).fileType = selectedFile.type;
    }

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
      // Update existing reply (supports nested replies)
      setMessages(prev =>
        prev.map(msg => {
          if (msg.id === editingReply.messageId) {
            const updateNestedReply = (replies: any[]): any[] => {
              return replies.map(reply => {
                if (reply.id === editingReply.replyId) {
                  return { ...reply, content: text, isEdited: true };
                } else if (reply.replies && reply.replies.length > 0) {
                  return {
                    ...reply,
                    replies: updateNestedReply(reply.replies),
                  };
                }
                return reply;
              });
            };

            return {
              ...msg,
              replies: updateNestedReply(msg.replies),
            };
          }
          return msg;
        }),
      );
      setEditingReply(null);
    } else if (replyingToReply) {
      // Add as nested reply to a specific reply
      setMessages(prev =>
        prev.map(msg => {
          if (msg.id === replyingToReply.messageId) {
            const addNestedReply = (replies: any[]): any[] => {
              return replies.map(reply => {
                if (reply.id === replyingToReply.replyId) {
                  // Add as child to this reply
                  return {
                    ...reply,
                    replies: [
                      ...(reply.replies || []),
                      {
                        id: newMessage.id,
                        content: `@${replyingToReply.replyAuthor} ${text}`,
                        sender: { id: 'current_user', name: 'You' },
                        timestamp: new Date(),
                        mentions: [
                          replyingToReply.replyAuthor,
                          ...extractMentions(text),
                        ],
                        replies: [],
                        ...(selectedFile && {
                          fileUri: selectedFile.uri,
                          fileName: selectedFile.name,
                          fileType: selectedFile.type,
                        }),
                      } as any,
                    ],
                  };
                } else if (reply.replies && reply.replies.length > 0) {
                  // Recursively search in nested replies
                  return {
                    ...reply,
                    replies: addNestedReply(reply.replies),
                  };
                }
                return reply;
              });
            };

            return {
              ...msg,
              replies: addNestedReply(msg.replies),
            };
          }
          return msg;
        }),
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
                    content:
                      text || (selectedFile ? `📎 ${selectedFile.name}` : ''),
                    sender: { id: 'current_user', name: 'You' },
                    timestamp: new Date(),
                    mentions: extractMentions(text),
                    ...(selectedFile && {
                      fileUri: selectedFile.uri,
                      fileName: selectedFile.name,
                      fileType: selectedFile.type,
                    }),
                  } as any,
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
    setSelectedFile(null); // Clear selected file
    setSelectedMessage(null); // Clear message selection after sending

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

  const handleFilePicker = () => {
    // Mock file picker - in real app, use react-native-document-picker
    const mockFile = {
      uri: 'file://mock-document.pdf',
      name: 'project-document.pdf',
      type: 'application/pdf',
    };
    setSelectedFile(mockFile);
    setShowAttachmentPicker(false);
  };

  const handleImagePicker = () => {
    // Mock image picker - in real app, use react-native-image-picker
    const mockImage = {
      uri: 'file://mock-image.jpg',
      name: 'screenshot.jpg',
      type: 'image/jpeg',
    };
    setSelectedFile(mockImage);
    setShowAttachmentPicker(false);
  };

  const handleAudioPicker = () => {
    // Mock audio picker - in real app, use react-native-audio-picker
    const mockAudio = {
      uri: 'file://mock-audio.mp3',
      name: 'voice-note.mp3',
      type: 'audio/mpeg',
    };
    setSelectedFile(mockAudio);
    setShowAttachmentPicker(false);
  };

  const handleAiEnhancement = async () => {
    if (!inputText.trim()) return;

    setIsAiEnhancing(true);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock AI enhancement - in real app, call AI service
    const enhancedText = `${inputText.trim()} (Enhanced with AI: made more professional and clear)`;
    setInputText(enhancedText);

    setIsAiEnhancing(false);
  };

  const insertMention = (memberName: string) => {
    if (mentionCursorPosition !== null) {
      const beforeCursor = inputText.substring(0, mentionCursorPosition - 1); // -1 to remove @
      const afterCursor = inputText.substring(mentionCursorPosition);
      setInputText(`${beforeCursor}@${memberName} ${afterCursor}`);
    } else {
      setInputText(prev => prev + `@${memberName} `);
    }
    setShowMentionPicker(false);
    setMentionCursorPosition(null);
  };

  const handleTextChange = (text: string) => {
    setInputText(text);

    // Check for @ mention trigger
    const lastAtIndex = text.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const textAfterAt = text.substring(lastAtIndex + 1);
      // Show mention picker if @ is followed by word characters or is at the end
      if (textAfterAt.length === 0 || /^\w*$/.test(textAfterAt)) {
        setMentionCursorPosition(lastAtIndex + 1 + textAfterAt.length);
        setShowMentionPicker(true);
      } else {
        setShowMentionPicker(false);
        setMentionCursorPosition(null);
      }
    } else {
      setShowMentionPicker(false);
      setMentionCursorPosition(null);
    }
  };

  const toggleRepliesCollapse = (messageId: string) => {
    setCollapsedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  // Function to count all nested replies recursively
  const countAllReplies = (replies: any[]): number => {
    if (!replies || replies.length === 0) return 0;

    let totalCount = replies.length;
    for (const reply of replies) {
      if (reply.replies && reply.replies.length > 0) {
        totalCount += countAllReplies(reply.replies);
      }
    }
    return totalCount;
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages(prev =>
      prev.map(msg => {
        if (msg.id === messageId) {
          const updatedMsg = { ...msg };
          const existingReaction = updatedMsg.reactions.find(
            r => r.emoji === emoji,
          );

          if (existingReaction) {
            if (existingReaction.users.includes('current_user')) {
              // Remove reaction
              const updatedUsers = existingReaction.users.filter(
                u => u !== 'current_user',
              );
              const updatedCount = updatedUsers.length;

              if (updatedCount === 0) {
                updatedMsg.reactions = updatedMsg.reactions.filter(
                  r => r.emoji !== emoji,
                );
              } else {
                updatedMsg.reactions = updatedMsg.reactions.map(r =>
                  r.emoji === emoji
                    ? { ...r, users: updatedUsers, count: updatedCount }
                    : r,
                );
              }
            } else {
              // Add reaction
              updatedMsg.reactions = updatedMsg.reactions.map(r =>
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
            updatedMsg.reactions = [
              ...updatedMsg.reactions,
              {
                emoji,
                users: ['current_user'],
                count: 1,
              },
            ];
          }
          return updatedMsg;
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

  // Handle editing nested replies recursively
  const findAndEditReply = (
    messageId: string,
    replyId: string,
    content: string,
  ) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      const findReplyContent = (replies: any[]): string | null => {
        for (const reply of replies) {
          if (reply.id === replyId) {
            return reply.content;
          }
          if (reply.replies && reply.replies.length > 0) {
            const found = findReplyContent(reply.replies);
            if (found) return found;
          }
        }
        return null;
      };

      const foundContent = findReplyContent(message.replies);
      if (foundContent) {
        setEditingReply({ messageId, replyId, content: foundContent });
        setInputText(foundContent);
        inputRef.current?.focus();
      }
    }
  };

  const handleMessageSelect = (messageId: string) => {
    setSelectedMessage(messageId === selectedMessage ? null : messageId);
  };

  const handleReplyReaction = (
    messageId: string,
    replyId: string,
    emoji: string,
  ) => {
    setMessages(prev =>
      prev.map(msg => {
        if (msg.id === messageId) {
          const updateReplyReactions = (replies: any[]): any[] => {
            return replies.map(reply => {
              if (reply.id === replyId) {
                const updatedReply = { ...reply };

                // Ensure reactions array exists
                if (!updatedReply.reactions) {
                  updatedReply.reactions = [];
                }

                const existingReaction = updatedReply.reactions.find(
                  (r: any) => r.emoji === emoji,
                );

                if (existingReaction) {
                  if (existingReaction.users.includes('current_user')) {
                    const updatedUsers = existingReaction.users.filter(
                      (u: string) => u !== 'current_user',
                    );
                    const updatedCount = updatedUsers.length;

                    if (updatedCount === 0) {
                      updatedReply.reactions = updatedReply.reactions.filter(
                        (r: any) => r.emoji !== emoji,
                      );
                    } else {
                      updatedReply.reactions = updatedReply.reactions.map(
                        (r: any) =>
                          r.emoji === emoji
                            ? { ...r, users: updatedUsers, count: updatedCount }
                            : r,
                      );
                    }
                  } else {
                    updatedReply.reactions = updatedReply.reactions.map(
                      (r: any) =>
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
                  updatedReply.reactions = [
                    ...updatedReply.reactions,
                    {
                      emoji,
                      users: ['current_user'],
                      count: 1,
                    },
                  ];
                }
                return updatedReply;
              } else if (reply.replies && reply.replies.length > 0) {
                return {
                  ...reply,
                  replies: updateReplyReactions(reply.replies),
                };
              }
              return reply;
            });
          };

          return {
            ...msg,
            replies: updateReplyReactions(msg.replies),
          };
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
      setSelectedMessage(null); // Clear selection when starting reply
      inputRef.current?.focus();
    }
  };

  // Recursive Reply Component
  const RenderReply = ({
    reply,
    messageId,
    depth = 0,
    parentReplyId = null,
  }: {
    reply: any;
    messageId: string;
    depth?: number;
    parentReplyId?: string | null;
  }) => {
    const replyKey = `${messageId}-${reply.id}`;
    const isCollapsed = collapsedReplies.has(replyKey);
    const hasChildren = reply.replies && reply.replies.length > 0;

    return (
      <View key={reply.id} style={{ marginLeft: depth * 16 }}>
        <View className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-300 mb-2">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              {/* Reply Header with Collapse/Expand */}
              <View className="flex-row items-center justify-between">
                <Text className="font-medium text-sm text-purple-600">
                  {reply.sender.name}
                </Text>
                {hasChildren && (
                  <TouchableOpacity
                    onPress={() => toggleRepliesCollapse(replyKey)}
                    className="bg-purple-200 rounded-full px-2 py-1"
                  >
                    <Text className="text-xs text-purple-700 font-medium">
                      {isCollapsed ? '▶' : '▼'}{' '}
                      {countAllReplies(reply.replies)}{' '}
                      {countAllReplies(reply.replies) === 1
                        ? 'reply'
                        : 'replies'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text className="text-gray-700 mt-1">{reply.content}</Text>

              {/* File Attachment */}
              {(reply as any).fileUri && (
                <View className="mt-2 p-2 bg-gray-100 rounded border">
                  <Text className="text-blue-600 text-sm font-medium">
                    📎 {(reply as any).fileName || 'File attachment'}
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    {(reply as any).fileType || 'Unknown type'}
                  </Text>
                </View>
              )}

              {/* Mentions */}
              {(reply as any).mentions &&
                (reply as any).mentions.length > 0 && (
                  <View className="flex-row flex-wrap mt-1">
                    {(reply as any).mentions.map(
                      (mention: string, idx: number) => (
                        <Text key={idx} className="text-blue-500 text-xs mr-1">
                          @{mention}
                        </Text>
                      ),
                    )}
                  </View>
                )}

              <Text className="text-xs text-gray-500 mt-1">
                {reply.timestamp.toLocaleTimeString()}
              </Text>

              {/* Reply Reactions */}
              {(reply as any).reactions &&
                (reply as any).reactions.length > 0 && (
                  <View className="flex-row mt-2">
                    {(reply as any).reactions.map(
                      (reaction: any, idx: number) => (
                        <TouchableOpacity
                          key={idx}
                          onPress={() =>
                            handleReplyReaction(
                              messageId,
                              reply.id,
                              reaction.emoji,
                            )
                          }
                          className="bg-white rounded-full px-2 py-1 mr-1 border border-gray-200"
                        >
                          <Text className="text-xs">
                            {reaction.emoji} {reaction.count}
                          </Text>
                        </TouchableOpacity>
                      ),
                    )}
                  </View>
                )}
            </View>

            {/* Reply Actions */}
            <View className="flex-row space-x-1">
              <TouchableOpacity
                onPress={() =>
                  setShowReplyEmojiPicker({
                    messageId: messageId,
                    replyId: reply.id,
                  })
                }
                className="bg-purple-200 rounded-full p-1"
              >
                <Text style={{ fontSize: 12 }}>😊</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  setReplyingToReply({
                    messageId: messageId,
                    replyId: reply.id,
                    replyAuthor: reply.sender.name,
                  })
                }
                className="bg-purple-100 rounded-full px-2 py-1"
              >
                <Text className="text-purple-600 text-xs">Reply</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Edit Reply Button for own replies */}
          {reply.sender?.id === 'current_user' && (
            <TouchableOpacity
              onPress={() =>
                handleReplyEdit(messageId, reply.id, reply.content)
              }
              className="bg-purple-200 px-3 py-1 rounded-full mt-2 self-start"
            >
              <Text className="text-purple-600 text-xs">Edit Reply</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Nested Replies */}
        {hasChildren && !isCollapsed && (
          <View className="ml-4">
            {reply.replies.map((nestedReply: any) => (
              <RenderReply
                key={nestedReply.id}
                reply={nestedReply}
                messageId={messageId}
                depth={depth + 1}
                parentReplyId={reply.id}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  // Swipeable Message Component
  const SwipeableMessage = ({
    message,
    children,
  }: {
    message: any;
    children: React.ReactNode;
  }) => {
    const translateX = useSharedValue(0);
    const opacity = useSharedValue(0);
    const [showSwipeAction, setShowSwipeAction] = useState(false);

    const gestureHandler = useAnimatedGestureHandler({
      onStart: () => {
        opacity.value = withTiming(1);
      },
      onActive: event => {
        translateX.value = Math.min(event.translationX, 100);
        if (event.translationX > 30) {
          runOnJS(setShowSwipeAction)(true);
        }
      },
      onEnd: event => {
        if (event.translationX > 80) {
          runOnJS(handleSwipeReply)(message.id);
          runOnJS(setShowSwipeAction)(false);
        } else if (event.translationX > 30) {
          // Keep the swipe action visible for user to decide
          translateX.value = withSpring(60);
          return;
        }
        translateX.value = withSpring(0);
        opacity.value = withTiming(0);
        runOnJS(setShowSwipeAction)(false);
      },
    });

    const cancelSwipeReply = () => {
      translateX.value = withSpring(0);
      opacity.value = withTiming(0);
      setShowSwipeAction(false);
    };

    const confirmSwipeReply = () => {
      handleSwipeReply(message.id);
      cancelSwipeReply();
    };

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }],
    }));

    const replyIconStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [
        { scale: interpolate(translateX.value, [0, 50], [0.8, 1.2]) },
      ],
    }));

    return (
      <View style={{ position: 'relative' }}>
        {/* Reply Icon */}
        <Animated.View
          style={[
            replyIconStyle,
            {
              position: 'absolute',
              left: 10,
              top: '50%',
              zIndex: 1,
              backgroundColor: '#8B5CF6',
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

        {/* Swipe Action Buttons */}
        {showSwipeAction && (
          <View
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              zIndex: 2,
              flexDirection: 'row',
              gap: 8,
            }}
          >
            <TouchableOpacity
              onPress={cancelSwipeReply}
              style={{
                backgroundColor: '#EF4444',
                borderRadius: 15,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <Text style={{ color: 'white', fontSize: 12 }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={confirmSwipeReply}
              style={{
                backgroundColor: '#10B981',
                borderRadius: 15,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <Text style={{ color: 'white', fontSize: 12 }}>Reply</Text>
            </TouchableOpacity>
          </View>
        )}

        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={animatedStyle}>{children}</Animated.View>
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
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
            <Animated.View
              style={summaryButtonAnimatedStyle}
              className="flex-1"
            >
              <TouchableOpacity
                onPress={generateMeetingSummary}
                disabled={isGeneratingSummary}
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
                  {isGeneratingSummary ? '⏳' : '📝'}
                </Text>
                <Text className="text-white text-sm font-semibold">
                  {isGeneratingSummary ? 'Generating...' : 'Meeting Summary'}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={keyPointsButtonAnimatedStyle}
              className="flex-1"
            >
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
            style={{ flex: 1 }}
            className="px-4"
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{
              paddingBottom: 100, // More padding for better scrolling
              paddingTop: 10,
            }}
            keyboardShouldPersistTaps="handled"
            bounces={true}
            alwaysBounceVertical={true}
            scrollEnabled={true}
          >
            {messages.map((message, index) => (
              <View key={message.id} style={{ marginBottom: 16 }}>
                {/* Swipeable Message Bubble */}
                <SwipeableMessage message={message}>
                  <TouchableOpacity
                    onPress={() => handleMessageSelect(message.id)}
                    onLongPress={() => setShowEmojiReactionPicker(message.id)}
                    style={{
                      backgroundColor:
                        selectedMessage === message.id
                          ? '#F3E8FF'
                          : 'transparent',
                      borderRadius: 8,
                      padding: 4,
                      marginVertical: 2,
                      borderWidth: selectedMessage === message.id ? 2 : 0,
                      borderColor:
                        selectedMessage === message.id
                          ? '#8B5CF6'
                          : 'transparent',
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
                      <Text style={{ fontSize: 12, color: '#6B7280' }}>
                        Reply
                      </Text>
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
                      className="bg-purple-500 px-4 py-2 rounded-full"
                    >
                      <Text className="text-white text-sm font-medium">
                        Reply
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setShowEmojiReactionPicker(message.id)}
                      className="bg-yellow-500 px-4 py-2 rounded-full"
                    >
                      <Text className="text-white text-sm font-medium">
                        React
                      </Text>
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
                        <Text className="text-white text-sm font-medium">
                          Edit
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Enhanced Replies Section */}
                {message.replies && message.replies.length > 0 && (
                  <View className="ml-8 mt-2">
                    {/* Replies Header */}
                    <TouchableOpacity
                      onPress={() => toggleRepliesCollapse(message.id)}
                      className="flex-row items-center mb-2"
                    >
                      <Text className="text-purple-600 font-medium text-sm mr-2">
                        {collapsedReplies.has(message.id) ? '▶' : '▼'}
                        {countAllReplies(message.replies)}{' '}
                        {countAllReplies(message.replies) === 1
                          ? 'reply'
                          : 'replies'}
                      </Text>
                    </TouchableOpacity>

                    {/* Render Replies if not collapsed */}
                    {!collapsedReplies.has(message.id) && (
                      <View>
                        {message.replies.map((reply: any) => (
                          <RenderReply
                            key={reply.id}
                            reply={reply}
                            messageId={message.id}
                            depth={0}
                          />
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))}
          </Animated.ScrollView>

          {/* Reply Preview */}
          {replyingTo && (
            <View className="bg-purple-50 border-l-4 border-purple-500 px-4 py-2 mx-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-purple-600 text-sm font-medium">
                  Replying to {replyingTo.sender.name}
                </Text>
                <TouchableOpacity onPress={() => setReplyingTo(null)}>
                  <Text className="text-purple-600 text-lg">×</Text>
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

          {/* File Attachment Preview */}
          {selectedFile && (
            <View className="bg-green-50 border-l-4 border-green-500 px-4 py-2 mx-4">
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-green-600 text-sm font-medium">
                    File attached: {selectedFile.name}
                  </Text>
                  <Text className="text-gray-600 text-xs">
                    {selectedFile.type}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedFile(null)}>
                  <Text className="text-green-600 text-lg">×</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Voice Input */}
          <Animated.View style={inputAnimatedStyle}>
            <View className="px-4 py-2 bg-white">
              {/* AI Enhancement Status */}
              {isAiEnhancing && (
                <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                  <View className="flex-row items-center justify-center">
                    <View className="w-3 h-3 bg-blue-500 rounded-full mr-2 animate-pulse" />
                    <Text className="text-blue-600 font-medium">
                      AI is enhancing your message...
                    </Text>
                  </View>
                </View>
              )}

              {/* Voice Input Container */}
              <PromptInput
                onSendMessage={(text) => handleSendMessage(text)}
                onSendRecording={(audioUri, transcript) => {
                  handleSendMessage(transcript || '', audioUri, transcript);
                }}
                onAttachFile={(file) => {
                  setSelectedFile(file);
                  setShowAttachmentPicker(false);
                }}
                onAttachImage={(image) => {
                  setSelectedFile(image);
                  setShowAttachmentPicker(false);
                }}
                placeholder={
                  editingMessage
                    ? 'Edit your message...'
                    : editingReply
                      ? 'Edit your reply...'
                      : replyingToReply
                        ? `Reply to ${replyingToReply.replyAuthor}...`
                        : replyingTo
                          ? 'Reply to message...'
                          : 'Type your message here...'
                }
                disabled={false}
              />
            </View>
          </Animated.View>

          {/* Mention Picker Modal - positioned above input */}
          {showMentionPicker && (
            <View
              style={{
                position: 'absolute',
                bottom: 120, // Position above input
                left: 20,
                right: 20,
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 16,
                maxHeight: 200,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 8,
                borderWidth: 1,
                borderColor: '#E5E7EB',
              }}
            >
              <Text className="text-lg font-semibold mb-3 text-center text-gray-800">
                Select someone to mention
              </Text>
              <ScrollView style={{ maxHeight: 150 }}>
                {members.map((member: any, index: number) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() =>
                      insertMention(member.name || `User${index + 1}`)
                    }
                    className="flex-row items-center py-2 border-b border-gray-100"
                  >
                    <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center mr-3">
                      <Text className="text-purple-600 font-semibold text-sm">
                        {(member.name || `U${index + 1}`)
                          .charAt(0)
                          .toUpperCase()}
                      </Text>
                    </View>
                    <Text className="text-gray-900 font-medium">
                      {member.name || `User ${index + 1}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Attachment Picker Modal */}
          <Modal
            visible={showAttachmentPicker}
            transparent
            animationType="fade"
            onRequestClose={() => setShowAttachmentPicker(false)}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.5)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => setShowAttachmentPicker(false)}
            >
              <View
                style={{
                  backgroundColor: 'white',
                  borderRadius: 16,
                  padding: 24,
                  margin: 20,
                  minWidth: 280,
                }}
              >
                <Text className="text-xl font-bold mb-6 text-center text-gray-800">
                  Add Attachment
                </Text>

                <View className="space-y-4">
                  {/* Document Option */}
                  <TouchableOpacity
                    onPress={handleFilePicker}
                    className="flex-row items-center py-4 px-4 bg-purple-50 rounded-xl"
                  >
                    <View className="w-12 h-12 bg-purple-500 rounded-full items-center justify-center mr-4">
                      <Text className="text-white text-xl">📄</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-gray-800">
                        Document
                      </Text>
                      <Text className="text-sm text-gray-600">
                        PDF, Word, Excel files
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Image Option */}
                  <TouchableOpacity
                    onPress={handleImagePicker}
                    className="flex-row items-center py-4 px-4 bg-green-50 rounded-xl"
                  >
                    <View className="w-12 h-12 bg-green-500 rounded-full items-center justify-center mr-4">
                      <Text className="text-white text-xl">🖼️</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-gray-800">
                        Photo
                      </Text>
                      <Text className="text-sm text-gray-600">
                        Camera or gallery
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Audio Option */}
                  <TouchableOpacity
                    onPress={handleAudioPicker}
                    className="flex-row items-center py-4 px-4 bg-orange-50 rounded-xl"
                  >
                    <View className="w-12 h-12 bg-orange-500 rounded-full items-center justify-center mr-4">
                      <Text className="text-white text-xl">🎵</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-gray-800">
                        Audio
                      </Text>
                      <Text className="text-sm text-gray-600">
                        Music or voice files
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => setShowAttachmentPicker(false)}
                  className="mt-6 bg-gray-200 py-3 px-6 rounded-full self-center"
                >
                  <Text className="text-gray-700 font-medium">Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>

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
                            emoji,
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
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
};
