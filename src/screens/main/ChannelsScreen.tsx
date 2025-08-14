import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput, Modal, ScrollView, FlatList } from 'react-native';
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
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
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
  tags: string[];
  members: Member[];
  memberAvatars: string[];
  comments: number;
  files: number;
  isPrivate: boolean;
  createdAt: Date;
}

interface Category {
  id: string;
  name: string;
  count: number;
  color: string;
  icon: string;
}

interface ChannelCardProps {
  title: string;
  description: string;
  category: string;
  tags: string[];
  memberAvatars: string[];
  comments: number;
  files: number;
  isPrivate: boolean;
  onPress: () => void;
  index: number;
}

const ChannelCard: React.FC<ChannelCardProps> = ({
  title,
  description,
  category,
  tags,
  memberAvatars,
  comments,
  files,
  isPrivate,
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
        {/* Header Row */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-row items-center space-x-2">
            <Animated.View
              entering={FadeInUp.delay(index * 150 + 200).duration(400)}
              className="bg-green-100 px-3 py-1 rounded-full"
            >
              <Text className="text-green-600 text-xs font-medium">
                {category}
              </Text>
            </Animated.View>
            {isPrivate && (
              <Animated.View
                entering={FadeInUp.delay(index * 150 + 220).duration(400)}
                className="bg-orange-100 px-2 py-1 rounded-full flex-row items-center"
              >
                <MaterialIcon name="lock" size={10} color="#F97316" />
                <Text className="text-orange-600 text-xs font-medium ml-1">Private</Text>
              </Animated.View>
            )}
          </View>
          <AnimatedTouchableOpacity
            entering={FadeInUp.delay(index * 150 + 250).duration(400)}
            className="p-1"
          >
            <MaterialIcon name="more-vert" size={20} color="#9CA3AF" />
          </AnimatedTouchableOpacity>
        </View>

        {/* Title and Description */}
        <Animated.View
          entering={FadeInUp.delay(index * 150 + 300).duration(500)}
        >
          <Text className="text-gray-900 text-xl font-bold mb-2">{title}</Text>
          <Text className="text-gray-500 text-sm mb-3 leading-5">
            {description}
          </Text>
          
          {/* Tags */}
          {tags && tags.length > 0 && (
            <View className="flex-row flex-wrap mb-3">
              {tags.map((tag, tagIndex) => (
                <View
                  key={tagIndex}
                  className="bg-purple-50 px-2 py-1 rounded-md mr-2 mb-1"
                >
                  <Text className="text-purple-600 text-xs font-medium">#{tag}</Text>
                </View>
              ))}
            </View>
          )}
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
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCreateChannel, setShowCreateChannel] = useState(false);

  // Channel creation form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    tags: [] as string[],
    isPrivate: false,
    members: [] as Member[],
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    category: '',
    members: '',
  });
  const [tagInput, setTagInput] = useState('');
  const [showMemberSelector, setShowMemberSelector] = useState(false);

  // Available members (in real app, this would come from API)
  const availableMembers: Member[] = [
    { id: 'current_user', name: 'You', avatar: 'Y', role: 'Current User' },
    { id: '1', name: 'John Smith', avatar: 'J', role: 'Team Lead' },
    { id: '2', name: 'Sarah Johnson', avatar: 'S', role: 'Designer' },
    { id: '3', name: 'Mike Wilson', avatar: 'M', role: 'Developer' },
    { id: '4', name: 'Emma Davis', avatar: 'E', role: 'UX Designer' },
    { id: '5', name: 'Alex Chen', avatar: 'A', role: 'Backend Dev' },
    { id: '6', name: 'Lisa Garcia', avatar: 'L', role: 'Product Manager' },
    { id: '7', name: 'Tom Anderson', avatar: 'T', role: 'Marketing' },
    { id: '8', name: 'David Kim', avatar: 'D', role: 'CEO' },
  ];

  // Initialize form with current user as member
  React.useEffect(() => {
    if (showCreateChannel && formData.members.length === 0) {
      setFormData(prev => ({
        ...prev,
        members: [availableMembers[0]] // Current user
      }));
    }
  }, [showCreateChannel]);

  // Categories
  const categories: Category[] = [
    { id: 'work', name: 'Work', count: 8, color: '#10B981', icon: 'work-outline' },
    { id: 'social', name: 'Social', count: 3, color: '#3B82F6', icon: 'people-outline' },
    { id: 'design', name: 'Design', count: 5, color: '#8B5CF6', icon: 'color-palette-outline' },
    { id: 'development', name: 'Development', count: 12, color: '#F59E0B', icon: 'code-slash-outline' },
    { id: 'general', name: 'General', count: 4, color: '#6B7280', icon: 'chatbubble-outline' },
  ];

  const channels: Channel[] = [
    {
      id: '1',
      title: 'Project Alpha',
      description: 'Strategic planning and brainstorming for our next major product launch.',
      category: 'work',
      tags: ['strategy', 'planning', 'launch'],
      members: [
        { id: '1', name: 'John', avatar: 'J', role: 'Team Lead' },
        { id: '2', name: 'Sarah', avatar: 'S', role: 'Designer' },
        { id: '3', name: 'Mike', avatar: 'M', role: 'Developer' },
      ],
      memberAvatars: ['J', 'S', 'M'],
      comments: 24,
      files: 8,
      isPrivate: false,
      createdAt: new Date(),
    },
    {
      id: '2',
      title: 'Design System',
      description: 'Building and maintaining our comprehensive design system and component library.',
      category: 'design',
      tags: ['ui', 'components', 'tokens'],
      members: [
        { id: '2', name: 'Sarah', avatar: 'S', role: 'Designer' },
        { id: '5', name: 'Lisa', avatar: 'L', role: 'UI Designer' },
        { id: '6', name: 'Emma', avatar: 'E', role: 'UX Designer' },
      ],
      memberAvatars: ['S', 'L', 'E'],
      comments: 18,
      files: 12,
      isPrivate: false,
      createdAt: new Date(),
    },
    {
      id: '3',
      title: 'API Development',
      description: 'Backend development discussions, API design, and technical implementation.',
      category: 'development',
      tags: ['backend', 'api', 'database'],
      members: [
        { id: '3', name: 'Mike', avatar: 'M', role: 'Developer' },
        { id: '7', name: 'Alex', avatar: 'A', role: 'Backend Dev' },
        { id: '8', name: 'Chris', avatar: 'C', role: 'DevOps' },
      ],
      memberAvatars: ['M', 'A', 'C'],
      comments: 31,
      files: 5,
      isPrivate: true,
      createdAt: new Date(),
    },
    {
      id: '4',
      title: 'Coffee Chat',
      description: 'Casual conversations, team bonding, and non-work related discussions.',
      category: 'social',
      tags: ['casual', 'bonding', 'fun'],
      members: [
        { id: '1', name: 'John', avatar: 'J', role: 'Team Lead' },
        { id: '2', name: 'Sarah', avatar: 'S', role: 'Designer' },
        { id: '3', name: 'Mike', avatar: 'M', role: 'Developer' },
        { id: '5', name: 'Lisa', avatar: 'L', role: 'UI Designer' },
        { id: '9', name: 'Tom', avatar: 'T', role: 'Marketing' },
      ],
      memberAvatars: ['J', 'S', 'M', 'L', 'T'],
      comments: 47,
      files: 2,
      isPrivate: false,
      createdAt: new Date(),
    },
    {
      id: '5',
      title: 'General Updates',
      description: 'Company-wide announcements, updates, and important information.',
      category: 'general',
      tags: ['announcements', 'updates', 'company'],
      members: [
        { id: '1', name: 'John', avatar: 'J', role: 'Team Lead' },
        { id: '10', name: 'David', avatar: 'D', role: 'CEO' },
      ],
      memberAvatars: ['J', 'D'],
      comments: 8,
      files: 3,
      isPrivate: false,
      createdAt: new Date(),
    },
  ];

  // Filter channels based on search query and selected categories
  const filteredChannels = useMemo(() => {
    let filtered = channels;

    // Filter by selected categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(channel =>
        selectedCategories.includes(channel.category)
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        channel =>
          channel.title.toLowerCase().includes(query) ||
          channel.category.toLowerCase().includes(query) ||
          channel.description.toLowerCase().includes(query) ||
          channel.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [channels, searchQuery, selectedCategories]);

  // Form validation
  const validateForm = () => {
    const errors = { name: '', category: '', members: '' };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Channel name is required';
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Channel name must be at least 2 characters';
      isValid = false;
    }

    if (!formData.category) {
      errors.category = 'Please select a category';
      isValid = false;
    }

    if (formData.members.length === 0) {
      errors.members = 'At least one member is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      tags: [],
      isPrivate: false,
      members: [availableMembers[0]], // Keep current user
    });
    setFormErrors({ name: '', category: '', members: '' });
    setTagInput('');
  };

  // Handle form submission
  const handleCreateChannel = () => {
    if (!validateForm()) {
      return;
    }

    // Create new channel
    const newChannel: Channel = {
      id: Date.now().toString(),
      title: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category,
      tags: formData.tags,
      members: formData.members,
      memberAvatars: formData.members.map(m => m.avatar),
      comments: 0,
      files: 0,
      isPrivate: formData.isPrivate,
      createdAt: new Date(),
    };

    // In real app, you would make API call here
    console.log('Creating channel:', newChannel);
    Alert.alert('Success', `Channel "${formData.name}" created successfully!`);
    
    resetForm();
    setShowCreateChannel(false);
  };

  // Add tag
  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Toggle member selection
  const toggleMember = (member: Member) => {
    // Don't allow removing current user
    if (member.id === 'current_user') return;

    setFormData(prev => ({
      ...prev,
      members: prev.members.some(m => m.id === member.id)
        ? prev.members.filter(m => m.id !== member.id)
        : [...prev.members, member]
    }));
  };

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
      {/* Header */}
      <Animated.View
        entering={FadeInUp.delay(200).duration(600).springify()}
        className="flex-row items-center justify-between px-4 py-4"
      >
        <Animated.Text
          entering={FadeInUp.delay(400).duration(500)}
          className="text-gray-900 text-3xl font-bold"
        >
          Channels
        </Animated.Text>
        <Animated.View
          entering={FadeInUp.delay(500).duration(500)}
          className="flex-row items-center space-x-3"
        >
          <AnimatedTouchableOpacity
            entering={FadeInUp.delay(600).duration(400).springify()}
            onPress={() => setShowCategoryFilter(true)}
            className="bg-white rounded-xl p-3 shadow-sm"
          >
            <IonIcon name="filter-outline" size={22} color="#6B7280" />
          </AnimatedTouchableOpacity>
          <AnimatedTouchableOpacity
            entering={FadeInUp.delay(700).duration(400).springify()}
            onPress={() => setShowCreateChannel(true)}
            className="bg-purple-600 rounded-xl p-3 shadow-lg"
          >
            <Feather name="plus" size={22} color="white" />
          </AnimatedTouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* Search Bar */}
      <Animated.View
        entering={FadeInDown.duration(800).springify().damping(15)}
        className="px-4 mb-4"
      >
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <View className="flex-row items-center px-4 py-3">
            <Feather
              name="search"
              size={20}
              color={isSearchFocused ? '#8B5CF6' : '#9CA3AF'}
              style={{ marginRight: 12 }}
            />
            <TextInput
              placeholder="Search channels, tags, or descriptions..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              style={{
                flex: 1,
                fontSize: 16,
                fontWeight: '400',
                color: '#1F2937',
              }}
              placeholderTextColor="#9CA3AF"
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                className="p-1"
              >
                <Feather name="x" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Active Filters */}
        {selectedCategories.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            className="mt-3"
          >
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row space-x-2 px-1">
                {selectedCategories.map((categoryId) => {
                  const category = categories.find(c => c.id === categoryId);
                  return (
                    <TouchableOpacity
                      key={categoryId}
                      onPress={() => setSelectedCategories(prev => 
                        prev.filter(id => id !== categoryId)
                      )}
                      className="bg-purple-100 rounded-full px-3 py-1 flex-row items-center"
                    >
                      <Text className="text-purple-700 text-sm font-medium mr-1">
                        {category?.name}
                      </Text>
                      <Feather name="x" size={14} color="#7C3AED" />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </Animated.View>
        )}

        {/* Search Results Info */}
        {(searchQuery.trim() || selectedCategories.length > 0) && (
          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            className="mt-3"
          >
            <Text className="text-gray-600 text-sm">
              {filteredChannels.length > 0
                ? `${filteredChannels.length} channel${filteredChannels.length === 1 ? '' : 's'} found`
                : 'No channels found'}
            </Text>
          </Animated.View>
        )}
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
              tags={channel.tags}
              memberAvatars={channel.memberAvatars}
              comments={channel.comments}
              files={channel.files}
              isPrivate={channel.isPrivate}
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

      {/* Category Filter Modal */}
      <Modal
        visible={showCategoryFilter}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryFilter(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
          onPress={() => setShowCategoryFilter(false)}
          activeOpacity={1}
        >
          <TouchableOpacity
            style={{ backgroundColor: 'white', borderRadius: 20, padding: 24, margin: 20, maxWidth: 350, width: '90%' }}
            activeOpacity={1}
          >
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">Filter by Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryFilter(false)}>
                <MaterialIcon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              {categories.map((category) => {
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => {
                      setSelectedCategories(prev =>
                        isSelected
                          ? prev.filter(id => id !== category.id)
                          : [...prev, category.id]
                      );
                    }}
                    className="flex-row items-center justify-between py-3 border-b border-gray-100"
                  >
                    <View className="flex-row items-center flex-1">
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: category.color + '20' }}
                      >
                        <IonIcon name={category.icon} size={20} color={category.color} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-900 font-medium">{category.name}</Text>
                        <Text className="text-gray-500 text-sm">{category.count} channels</Text>
                      </View>
                    </View>
                    <View
                      className={`w-6 h-6 rounded border-2 items-center justify-center ${
                        isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <Feather name="check" size={14} color="white" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View className="flex-row space-x-3 mt-6">
              <TouchableOpacity
                onPress={() => setSelectedCategories([])}
                className="flex-1 bg-gray-100 rounded-xl py-3"
              >
                <Text className="text-gray-700 font-medium text-center">Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowCategoryFilter(false)}
                className="flex-1 bg-purple-600 rounded-xl py-3"
              >
                <Text className="text-white font-medium text-center">Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Create Channel Modal */}
      <Modal
        visible={showCreateChannel}
        transparent
        animationType="slide"
        onRequestClose={() => {
          resetForm();
          setShowCreateChannel(false);
        }}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '90%' }}>
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-gray-900">Create Channel</Text>
              <TouchableOpacity onPress={() => {
                resetForm();
                setShowCreateChannel(false);
              }}>
                <MaterialIcon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Channel Name */}
              <View className="mb-6">
                <Text className="text-gray-700 font-medium mb-2">Channel Name *</Text>
                <View className={`bg-gray-50 rounded-xl px-4 py-3 border ${formErrors.name ? 'border-red-300' : 'border-gray-200'}`}>
                  <TextInput
                    placeholder="Enter channel name"
                    value={formData.name}
                    onChangeText={(text) => {
                      setFormData(prev => ({ ...prev, name: text }));
                      if (formErrors.name) setFormErrors(prev => ({ ...prev, name: '' }));
                    }}
                    className="text-gray-900 text-base"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                {formErrors.name ? (
                  <Text className="text-red-500 text-sm mt-1">{formErrors.name}</Text>
                ) : null}
              </View>

              {/* Description */}
              <View className="mb-6">
                <Text className="text-gray-700 font-medium mb-2">Description</Text>
                <View className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                  <TextInput
                    placeholder="What's this channel about?"
                    value={formData.description}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                    multiline
                    numberOfLines={3}
                    className="text-gray-900 text-base"
                    placeholderTextColor="#9CA3AF"
                    style={{ minHeight: 80, textAlignVertical: 'top' }}
                  />
                </View>
              </View>

              {/* Category */}
              <View className="mb-6">
                <Text className="text-gray-700 font-medium mb-2">Category *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row space-x-3">
                    {categories.map((category) => {
                      const isSelected = formData.category === category.id;
                      return (
                        <TouchableOpacity
                          key={category.id}
                          onPress={() => {
                            setFormData(prev => ({ ...prev, category: category.id }));
                            if (formErrors.category) setFormErrors(prev => ({ ...prev, category: '' }));
                          }}
                          className={`rounded-xl px-4 py-3 border flex-row items-center ${
                            isSelected 
                              ? 'bg-purple-100 border-purple-300' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <IonIcon name={category.icon} size={18} color={category.color} />
                          <Text className={`font-medium ml-2 ${
                            isSelected ? 'text-purple-700' : 'text-gray-700'
                          }`}>
                            {category.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
                {formErrors.category ? (
                  <Text className="text-red-500 text-sm mt-1">{formErrors.category}</Text>
                ) : null}
              </View>

              {/* Tags */}
              <View className="mb-6">
                <Text className="text-gray-700 font-medium mb-2">Tags</Text>
                
                {/* Current Tags */}
                {formData.tags.length > 0 && (
                  <View className="flex-row flex-wrap mb-3">
                    {formData.tags.map((tag, index) => (
                      <View key={index} className="bg-purple-100 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center">
                        <Text className="text-purple-700 text-sm">#{tag}</Text>
                        <TouchableOpacity onPress={() => removeTag(tag)} className="ml-2">
                          <Feather name="x" size={14} color="#7C3AED" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {/* Tag Input */}
                <View className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 flex-row items-center">
                  <TextInput
                    placeholder="Type a tag and press Enter"
                    value={tagInput}
                    onChangeText={setTagInput}
                    onSubmitEditing={addTag}
                    className="text-gray-900 text-base flex-1"
                    placeholderTextColor="#9CA3AF"
                    returnKeyType="done"
                  />
                  {tagInput.trim() && (
                    <TouchableOpacity onPress={addTag} className="ml-2">
                      <Feather name="plus" size={20} color="#8B5CF6" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Privacy */}
              <View className="mb-6">
                <Text className="text-gray-700 font-medium mb-2">Privacy</Text>
                <View className="space-y-3">
                  <TouchableOpacity 
                    onPress={() => setFormData(prev => ({ ...prev, isPrivate: false }))}
                    className="flex-row items-center p-3 bg-gray-50 rounded-xl"
                  >
                    <View className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
                      !formData.isPrivate ? 'border-purple-600 bg-purple-600' : 'border-gray-300'
                    }`}>
                      {!formData.isPrivate && <View className="w-2 h-2 rounded-full bg-white" />}
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-900 font-medium">Public</Text>
                      <Text className="text-gray-500 text-sm">Anyone in the workspace can join</Text>
                    </View>
                    <IonIcon name="globe-outline" size={20} color="#10B981" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => setFormData(prev => ({ ...prev, isPrivate: true }))}
                    className="flex-row items-center p-3 bg-gray-50 rounded-xl"
                  >
                    <View className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
                      formData.isPrivate ? 'border-purple-600 bg-purple-600' : 'border-gray-300'
                    }`}>
                      {formData.isPrivate && <View className="w-2 h-2 rounded-full bg-white" />}
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-900 font-medium">Private</Text>
                      <Text className="text-gray-500 text-sm">Only invited members can join</Text>
                    </View>
                    <MaterialIcon name="lock" size={20} color="#F59E0B" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Members */}
              <View className="mb-8">
                <Text className="text-gray-700 font-medium mb-2">Members ({formData.members.length})</Text>
                
                {/* Current Members */}
                {formData.members.length > 0 && (
                  <View className="mb-3">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View className="flex-row space-x-2">
                        {formData.members.map((member) => (
                          <View key={member.id} className="bg-purple-50 rounded-xl px-3 py-2 flex-row items-center">
                            <View className="w-6 h-6 bg-purple-600 rounded-full items-center justify-center mr-2">
                              <Text className="text-white text-xs font-bold">{member.avatar}</Text>
                            </View>
                            <Text className="text-purple-700 text-sm font-medium">{member.name}</Text>
                            {member.id !== 'current_user' && (
                              <TouchableOpacity onPress={() => toggleMember(member)} className="ml-2">
                                <Feather name="x" size={14} color="#7C3AED" />
                              </TouchableOpacity>
                            )}
                          </View>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                )}

                <TouchableOpacity 
                  onPress={() => setShowMemberSelector(true)}
                  className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 flex-row items-center"
                >
                  <Feather name="plus" size={20} color="#8B5CF6" />
                  <Text className="text-purple-600 font-medium ml-2">Add team members</Text>
                </TouchableOpacity>
                
                {formErrors.members ? (
                  <Text className="text-red-500 text-sm mt-1">{formErrors.members}</Text>
                ) : null}
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View className="flex-row space-x-3 pt-4 border-t border-gray-200">
              <TouchableOpacity
                onPress={() => {
                  resetForm();
                  setShowCreateChannel(false);
                }}
                className="flex-1 bg-gray-100 rounded-xl py-4"
              >
                <Text className="text-gray-700 font-medium text-center">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateChannel}
                className="flex-1 bg-purple-600 rounded-xl py-4"
              >
                <Text className="text-white font-medium text-center">Create Channel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Member Selector Modal */}
      <Modal
        visible={showMemberSelector}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMemberSelector(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
          onPress={() => setShowMemberSelector(false)}
          activeOpacity={1}
        >
          <TouchableOpacity
            style={{ backgroundColor: 'white', borderRadius: 20, padding: 24, margin: 20, maxWidth: 400, width: '90%' }}
            activeOpacity={1}
          >
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">Select Members</Text>
              <TouchableOpacity onPress={() => setShowMemberSelector(false)}>
                <MaterialIcon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              {availableMembers.map((member) => {
                const isSelected = formData.members.some(m => m.id === member.id);
                const isCurrentUser = member.id === 'current_user';
                return (
                  <TouchableOpacity
                    key={member.id}
                    onPress={() => !isCurrentUser && toggleMember(member)}
                    disabled={isCurrentUser}
                    className={`flex-row items-center justify-between py-3 border-b border-gray-100 ${
                      isCurrentUser ? 'opacity-50' : ''
                    }`}
                  >
                    <View className="flex-row items-center flex-1">
                      <View className="w-10 h-10 bg-purple-600 rounded-full items-center justify-center mr-3">
                        <Text className="text-white font-bold">{member.avatar}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-900 font-medium">
                          {member.name} {isCurrentUser && '(You)'}
                        </Text>
                        <Text className="text-gray-500 text-sm">{member.role}</Text>
                      </View>
                    </View>
                    <View
                      className={`w-6 h-6 rounded border-2 items-center justify-center ${
                        isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <Feather name="check" size={14} color="white" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowMemberSelector(false)}
              className="bg-purple-600 rounded-xl py-3 mt-6"
            >
              <Text className="text-white font-medium text-center">Done</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
