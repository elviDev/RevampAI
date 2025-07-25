import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { PromptInput } from '../../components/voice/PromptInput';
import Feather from 'react-native-vector-icons/Feather';
import IonIcon from 'react-native-vector-icons/Ionicons';
// Create animated components
const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.createAnimatedComponent(View);

interface Member {
  id: string;
  name: string;
  avatar: string;
  role: string;
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
  memberAvatars: string[];
  comments: number;
  files: number;
  onPress: () => void;
  index: number;
}

const ChannelCard: React.FC<ChannelCardProps> = ({
  title,
  description,
  category,
  memberAvatars,
  comments,
  files,
  onPress,
  index,
}) => {
  const scale = useSharedValue(1);
  const pressed = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(pressed.value ? 0.98 : scale.value, {
            damping: 15,
            stiffness: 200,
          }),
        },
      ],
    };
  });

  const handlePressIn = () => {
    pressed.value = true;
  };

  const handlePressOut = () => {
    pressed.value = false;
  };

  const handlePress = () => {
    // Add a subtle feedback animation before calling onPress
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 }),
    );

    // Delay the actual press action slightly for better UX
    setTimeout(() => {
      runOnJS(onPress)();
    }, 50);
  };

  return (
    <AnimatedTouchableOpacity
      entering={FadeInDown.delay(index * 150)
        .duration(600)
        .springify()
        .damping(12)
        .stiffness(100)}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle]}
      className="bg-white rounded-2xl p-4 mb-4 mx-4"
      activeOpacity={1}
    >
      <Animated.View
        style={{
          shadowColor: '#8B5CF6',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        {/* Category Tag */}
        <View className="flex-row justify-between items-start mb-3">
          <Animated.View
            entering={FadeInUp.delay(index * 150 + 200).duration(400)}
            className="bg-green-100 px-3 py-1 rounded-full"
          >
            <Text className="text-green-600 text-xs font-medium">
              {category}
            </Text>
          </Animated.View>
          <AnimatedTouchableOpacity
            entering={FadeInUp.delay(index * 150 + 250).duration(400)}
            className="p-1"
          >
            <Text className="text-gray-400 text-lg">•••</Text>
          </AnimatedTouchableOpacity>
        </View>

        {/* Title and Description */}
        <Animated.View
          entering={FadeInUp.delay(index * 150 + 300).duration(500)}
        >
          <Text className="text-gray-900 text-xl font-bold mb-2">{title}</Text>
          <Text className="text-gray-500 text-sm mb-4 leading-5">
            {description}
          </Text>
        </Animated.View>

        {/* Bottom Section */}
        <Animated.View
          entering={FadeInUp.delay(index * 150 + 400).duration(500)}
          className="flex-row items-center justify-between"
        >
          {/* Member Avatars */}
          <View className="flex-row -space-x-2">
            {memberAvatars.map((member, avatarIndex) => (
              <Animated.View
                key={avatarIndex}
                entering={FadeInUp.delay(index * 150 + 500 + avatarIndex * 100)
                  .duration(400)
                  .springify()}
                className="w-8 h-8 bg-purple-500 rounded-full border-2 border-white flex items-center justify-center"
                style={{ zIndex: memberAvatars.length - avatarIndex }}
              >
                <Text className="text-white text-xs font-semibold">
                  {member.charAt(0)}
                </Text>
              </Animated.View>
            ))}
          </View>

          {/* Stats */}
          <View className="flex-row items-center gap-2 space-x-4">
            <Animated.View
              entering={FadeInUp.delay(index * 150 + 600).duration(400)}
              className="flex-row items-center"
            >
              <IonIcon
                name="chatbox-ellipses-outline"
                size={24}
                color="#9E9E9E"
              />
              <Text className="text-gray-400 text-sm">{comments} comments</Text>
            </Animated.View>
            <Animated.View
              entering={FadeInUp.delay(index * 150 + 650).duration(400)}
              className="flex-row items-center"
            >
              <IonIcon name="folder-outline" size={24} color="#9E9E9E" />
              <Text className="text-gray-400 text-sm">{files} files</Text>
            </Animated.View>
          </View>
        </Animated.View>
      </Animated.View>
    </AnimatedTouchableOpacity>
  );
};

export const ChannelsScreen: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();

  // Debug navigation object
  React.useEffect(() => {
    console.log(
      'Navigation object available methods:',
      Object.keys(navigation),
    );
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
        { id: '1', name: 'John', avatar: 'J', role: 'Team Lead' },
        { id: '2', name: 'Sarah', avatar: 'S', role: 'Designer' },
        { id: '3', name: 'Mike', avatar: 'M', role: 'Developer' },
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
        { id: '1', name: 'John', avatar: 'J', role: 'Team Lead' },
        { id: '2', name: 'Sarah', avatar: 'S', role: 'Designer' },
        { id: '4', name: 'Mark', avatar: 'M', role: 'Researcher' },
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
        { id: '1', name: 'John', avatar: 'J', role: 'Team Lead' },
        { id: '3', name: 'Mike', avatar: 'M', role: 'Developer' },
        { id: '5', name: 'Lisa', avatar: 'L', role: 'UI Designer' },
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
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown navigation error';
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
      <Animated.View
        entering={FadeInDown.duration(800).springify().damping(15)}
        className="px-4 mb-4"
      >
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
      </Animated.View>

      {/* Header */}
      <Animated.View
        entering={FadeInUp.delay(200).duration(600).springify()}
        className="flex-row items-center justify-between px-4 mb-6"
      >
        <Animated.Text
          entering={FadeInUp.delay(400).duration(500)}
          className="text-purple-600 text-2xl font-bold"
        >
          Channels
        </Animated.Text>
        <Animated.View
          entering={FadeInUp.delay(500).duration(500)}
          className="flex-row items-center space-x-3"
        >
          <AnimatedTouchableOpacity
            entering={FadeInUp.delay(600).duration(400).springify()}
            className="p-2"
          >
            <IonIcon name="options-outline" size={26} color="#9E9E9E" />
          </AnimatedTouchableOpacity>
          <AnimatedTouchableOpacity
            entering={FadeInUp.delay(700).duration(400).springify()}
            className="w-8 h-8 bg-[#9f5fff7a] rounded-md items-center justify-center"
          >
            <Feather name="plus" size={22} color="#9f5fff" />
          </AnimatedTouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* Channels List */}
      <Animated.ScrollView
        entering={FadeInUp.delay(800).duration(600)}
        showsVerticalScrollIndicator={false}
      >
        {channels.map((channel, index) => (
          <ChannelCard
            key={channel.id}
            title={channel.title}
            description={channel.description}
            category={channel.category}
            memberAvatars={channel.memberAvatars}
            comments={channel.comments}
            files={channel.files}
            index={index}
            onPress={() => handleChannelPress(channel)}
          />
        ))}
      </Animated.ScrollView>
    </View>
  );
};
