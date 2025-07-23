import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PromptInput } from '../../components/voice/PromptInput';

interface ChannelCardProps {
  title: string;
  description: string;
  category: string;
  members: string[];
  comments: number;
  files: number;
  onPress: () => void;
}

const ChannelCard: React.FC<ChannelCardProps> = ({
  title,
  description,
  category,
  members,
  comments,
  files,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl p-4 mb-4 mx-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Category Tag */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="bg-green-100 px-3 py-1 rounded-full">
          <Text className="text-green-600 text-xs font-medium">{category}</Text>
        </View>
        <TouchableOpacity className="p-1">
          <Text className="text-gray-400 text-lg">•••</Text>
        </TouchableOpacity>
      </View>

      {/* Title and Description */}
      <Text className="text-gray-900 text-xl font-bold mb-2">{title}</Text>
      <Text className="text-gray-500 text-sm mb-4 leading-5">
        {description}
      </Text>

      {/* Bottom Section */}
      <View className="flex-row items-center justify-between">
        {/* Member Avatars */}
        <View className="flex-row -space-x-2">
          {members.map((member, index) => (
            <View
              key={index}
              className="w-8 h-8 bg-purple-500 rounded-full border-2 border-white flex items-center justify-center"
              style={{ zIndex: members.length - index }}
            >
              <Text className="text-white text-xs font-semibold">
                {member.charAt(0)}
              </Text>
            </View>
          ))}
        </View>

        {/* Stats */}
        <View className="flex-row items-center space-x-4">
          <View className="flex-row items-center">
            <Text className="text-gray-400 mr-1">💬</Text>
            <Text className="text-gray-400 text-sm">{comments} comments</Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-gray-400 mr-1">📁</Text>
            <Text className="text-gray-400 text-sm">{files} files</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const ChannelsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  const channels = [
    {
      id: '1',
      title: 'Brainstorming',
      description:
        "Brainstorming brings team members' diverse experience into play.",
      category: 'Work',
      members: ['J', 'S', 'M'],
      comments: 12,
      files: 3,
    },
    {
      id: '2',
      title: 'Research',
      description:
        "Researching brings team members' diverse experience into play.",
      category: 'Work',
      members: ['J', 'S', 'M'],
      comments: 9,
      files: 1,
    },
    {
      id: '3',
      title: 'Mobile App',
      description:
        "Brainstorming brings team members' diverse experience into play.",
      category: 'Work',
      members: ['J', 'S', 'M'],
      comments: 12,
      files: 0,
    },
  ];

  const handleChannelPress = () => {
    // Navigation to channel detail would go here
    console.log('Channel pressed - Coming soon');
  };

  const handleSendMessage = (text: string) => {
    console.log('Sending text message:', text);
    // Handle text message
  };

  const handleSendRecording = (audioUri: string, transcript?: string) => {
    console.log('Sending audio recording:', audioUri);
    console.log('Voice transcript:', transcript);
    // Handle audio message with transcript
  };

  const handleAttachFile = (file: any) => {
    console.log('File attached:', file);
    Alert.alert('File Attached', `${file.name} has been attached`);
  };

  const handleAttachImage = (image: any) => {
    console.log('Image attached:', image);
    Alert.alert('Image Attached', `Image has been attached`);
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Search Bar */}
      <View className="px-4 mb-4">
        {/* Prompt */}
        <PromptInput
          onSendMessage={handleSendMessage}
          onSendRecording={handleSendRecording}
          onAttachFile={handleAttachFile}
          onAttachImage={handleAttachImage}
          placeholder="Enter a prompt here..."
          maxLines={6}
          disabled={false}
        />
      </View>

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 mb-6">
        <Text className="text-purple-600 text-2xl font-bold">Channels</Text>
        <View className="flex-row space-x-3">
          <TouchableOpacity className="p-2">
            <Text className="text-gray-400 text-lg">⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center">
            <Text className="text-white text-lg font-bold">+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Channels List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {channels.map(channel => (
          <ChannelCard
            key={channel.id}
            title={channel.title}
            description={channel.description}
            category={channel.category}
            members={channel.members}
            comments={channel.comments}
            files={channel.files}
            onPress={handleChannelPress}
          />
        ))}
      </ScrollView>
    </View>
  );
};
