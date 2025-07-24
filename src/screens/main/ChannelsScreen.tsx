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
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { PromptInput } from '../../components/voice/PromptInput';

interface Member {
  id: string;
  name: string;
  avatar: string;
  role: string;
  color: string;
}

interface Channel {
  id: string;
  title: string;
  description: string;
  category: string;
  members: Member[];
  memberAvatars: string[];
  comments: number;
  files: number;
}

interface ChannelCardProps {
  title: string;
  description: string;
  category: string;
  members: Member[];
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
          <MaterialIcons name="more-vert" size={20} color="#9CA3AF" />
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
        <View className="flex-row -space-x-3">
          {members.slice(0, 3).map((member, index) => (
            <View
              key={member.id}
              className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center`}
              style={{ 
                backgroundColor: member.color,
                zIndex: members.length - index 
              }}
            >
              <Text className="text-white text-xs font-semibold">
                {member.avatar}
              </Text>
            </View>
          ))}
        </View>

        {/* Stats */}
        <View className="flex-row items-center space-x-4">
          <View className="flex-row items-center">
            <Feather name="message-square" size={14} color="#9CA3AF" style={{ marginRight: 4 }} />
            <Text className="text-gray-400 text-sm">{comments} comments</Text>
          </View>
          <View className="flex-row items-center">
            <Feather name="file-text" size={14} color="#9CA3AF" style={{ marginRight: 4 }} />
            <Text className="text-gray-400 text-sm">{files} files</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const ChannelsScreen: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();

  // Debug navigation object
  React.useEffect(() => {
    console.log('Navigation object available methods:', Object.keys(navigation));
    console.log('Navigation state:', navigation.getState?.());
  }, [navigation]);

  const channels: Channel[] = [
    {
      id: '1',
      title: 'Brainstorming',
      description:
        "Brainstorming brings team members' diverse experience into play.",
      category: 'Work',
      members: [
        { id: '1', name: 'John', avatar: 'J', role: 'Team Lead', color: '#FF9500' },
        { id: '2', name: 'Sarah', avatar: 'S', role: 'Designer', color: '#007AFF' },
        { id: '3', name: 'Mike', avatar: 'M', role: 'Developer', color: '#34C759' },
      ],
      memberAvatars: ['J', 'S', 'M'],
      comments: 12,
      files: 3,
    },
    {
      id: '2',
      title: 'Research',
      description:
        "Researching brings team members' diverse experience into play.",
      category: 'Work',
      members: [
        { id: '1', name: 'John', avatar: 'J', role: 'Team Lead', color: '#FF9500' },
        { id: '2', name: 'Sarah', avatar: 'S', role: 'Designer', color: '#007AFF' },
        { id: '4', name: 'Mark', avatar: 'M', role: 'Researcher', color: '#AF52DE' },
      ],
      memberAvatars: ['J', 'S', 'M'],
      comments: 9,
      files: 1,
    },
    {
      id: '3',
      title: 'Mobile App',
      description:
        "Mobile app development brings team members' diverse experience into play.",
      category: 'Work',
      members: [
        { id: '1', name: 'John', avatar: 'J', role: 'Team Lead', color: '#FF9500' },
        { id: '3', name: 'Mike', avatar: 'M', role: 'Developer', color: '#34C759' },
        { id: '5', name: 'Lisa', avatar: 'L', role: 'UI Designer', color: '#FF2D92' },
      ],
      memberAvatars: ['J', 'M', 'L'],
      comments: 12,
      files: 0,
    },
  ];

  const handleChannelPress = (channel: Channel) => {
    console.log(
      'Navigating to channel:',
      channel.title,
      'with members:',
      channel.members,
    );
    
    try {
      // Alternative navigation methods to try if one doesn't work
      if (navigation.navigate) {
        navigation.navigate('ChannelDetailScreen', {
          channelId: channel.id,
          channelName: channel.title,
          members: channel.members,
        });
      } else if (navigation.push) {
        navigation.push('ChannelDetailScreen', {
          channelId: channel.id,
          channelName: channel.title,
          members: channel.members,
        });
      } else {
        throw new Error('Navigation method not available');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown navigation error';
      Alert.alert(
        'Navigation Error',
        `Unable to navigate to channel: ${errorMessage}. Please check navigation setup.`,
      );
    }
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
            <MaterialIcons name="more-vert" size={24} color="#9CA3AF" />
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
            onPress={() => handleChannelPress(channel)}
          />
        ))}
      </ScrollView>
    </View>
  );
};
