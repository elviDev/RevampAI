import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
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
import LinearGradient from 'react-native-linear-gradient';
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
          <View className="flex-row -space-x-3">
            {memberAvatars.slice(0, 4).map((member, avatarIndex) => (
              <Animated.View
                key={avatarIndex}
                entering={FadeInUp.delay(index * 150 + 500 + avatarIndex * 100)
                  .duration(400)
                  .springify()}
                style={{ zIndex: memberAvatars.length - avatarIndex }}
              >
                <LinearGradient
                  colors={avatarIndex % 2 === 0 ? ['#3933C6', '#A05FFF'] : ['#A05FFF', '#3933C6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    borderWidth: 2,
                    borderColor: 'white',
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                    elevation: 3,
                  }}
                >
                  <Text className="text-white text-xs font-bold">
                    {member.charAt(0)}
                  </Text>
                </LinearGradient>
              </Animated.View>
            ))}
            {memberAvatars.length > 4 && (
              <Animated.View
                entering={FadeInUp.delay(index * 150 + 500 + 4 * 100)
                  .duration(400)
                  .springify()}
                style={{ zIndex: 0 }}
              >
                <View className="w-9 h-9 bg-gray-400 rounded-full border-2 border-white flex items-center justify-center">
                  <Text className="text-white text-xs font-bold">
                    +{memberAvatars.length - 4}
                  </Text>
                </View>
              </Animated.View>
            )}
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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

  // Filter channels based on search query
  const filteredChannels = useMemo(() => {
    if (!searchQuery.trim()) {
      return channels;
    }

    const query = searchQuery.toLowerCase().trim();
    return channels.filter(
      channel =>
        channel.title.toLowerCase().includes(query) ||
        channel.category.toLowerCase().includes(query) ||
        channel.description.toLowerCase().includes(query)
    );
  }, [channels, searchQuery]);

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

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Search Input */}
      <Animated.View
        entering={FadeInDown.duration(800).springify().damping(15)}
        className="px-4 mb-4"
      >
        <LinearGradient
          colors={['#3933C6', '#A05FFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 24,
            padding: 2,
            shadowColor: '#A05FFF',
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 16,
            shadowOpacity: 0.15,
            elevation: 8,
          }}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 22,
              paddingHorizontal: 20,
              paddingVertical: 16,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#3933C6',
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 8,
              shadowOpacity: 0.08,
              elevation: 4,
            }}
          >
            <Feather
              name="search"
              size={20}
              color={isSearchFocused ? '#3933C6' : '#9CA3AF'}
              style={{ marginRight: 12 }}
            />
            <TextInput
              placeholder="Search channels by title or category..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              style={{
                flex: 1,
                fontSize: 16,
                fontWeight: '400',
                color: '#1F2937',
                letterSpacing: 0.3,
              }}
              placeholderTextColor="#9CA3AF"
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={{
                  marginLeft: 8,
                  padding: 4,
                }}
              >
                <Feather name="x" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* Search Results Info */}
        {searchQuery.trim() && (
          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            className="mt-3 px-2"
          >
            <Text className="text-gray-600 text-sm">
              {filteredChannels.length > 0
                ? `Found ${filteredChannels.length} channel${
                    filteredChannels.length === 1 ? '' : 's'
                  } for "${searchQuery}"`
                : `No channels found for "${searchQuery}"`}
            </Text>
          </Animated.View>
        )}
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
        {filteredChannels.length > 0 ? (
          filteredChannels.map((channel, index) => (
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
          ))
        ) : searchQuery.trim() ? (
          <Animated.View
            entering={FadeInUp.delay(400).duration(600)}
            className="flex-1 items-center justify-center py-12"
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#F3F4F6',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Feather name="search" size={32} color="#9CA3AF" />
            </View>
            <Text className="text-gray-500 text-lg font-medium mb-2">
              No channels found
            </Text>
            <Text className="text-gray-400 text-sm text-center px-8">
              Try searching with different keywords or check your spelling
            </Text>
          </Animated.View>
        ) : null}
      </Animated.ScrollView>
    </View>
  );
};
