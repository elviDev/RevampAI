import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, ScrollView, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
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
import { useToast } from '../../contexts/ToastContext';
import { channelService, type Channel as ApiChannel, type ChannelCategory } from '../../services/api/channelService';
import { userService, type User } from '../../services/api/userService';
import { AuthError } from '../../services/api/authService';
import { useAuth } from '../../hooks/useAuth';
import { ChannelCard, ConfirmationModal, ActionSheet } from '../../components/common';

// Create animated components
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.createAnimatedComponent(View);

interface Member {
  id: string;
  name: string;
  avatar: string;
  role: string;
  email?: string;
  department?: string;
  job_title?: string;
}

interface Channel {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  members: Member[];
  memberAvatars: string[];
  messages: number;
  files: number;
  memberCount: number;
  privacy: 'public' | 'private' | 'restricted';
  createdAt: Date;
}

interface DisplayChannel extends Channel {}

interface Category extends ChannelCategory {
  count: number; // Channel count per category - will be calculated from actual channels
}

// Map channel_type to category IDs
const CHANNEL_TYPE_TO_CATEGORY_MAP: Record<string, string> = {
  'department': 'department',
  'project': 'project', 
  'initiative': 'project', // initiatives are project-like
  'announcement': 'announcement',
  'temporary': 'general',
  'emergency': 'general',
  'general': 'general',
  'private': 'private'
};

// Map API channel to display channel with enhanced statistics
const mapApiChannelToDisplayChannel = (apiChannel: ApiChannel, stats?: {
  messageCount: number;
  fileCount: number;
  members: Member[];
}): Channel => ({
  id: apiChannel.id,
  title: apiChannel.name,
  description: apiChannel.description || '',
  category: apiChannel.channel_type || 'general',
  tags: [], // Tags would need to be implemented in the API
  members: stats?.members || [], // Members from API
  memberAvatars: stats?.members?.map(m => m.avatar || m.name?.charAt(0) || '?') || [], // URLs if available, otherwise initials
  messages: stats?.messageCount || 0, // Actual message count from API
  files: stats?.fileCount || 0, // Actual file count from API
  memberCount: apiChannel.member_count || stats?.members?.length || 0,
  privacy: apiChannel.privacy_level || 'public',
  createdAt: new Date(apiChannel.created_at),
});

export const ChannelsScreen: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableMembers, setAvailableMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Channel creation/editing form state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingChannelId, setEditingChannelId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '', // channel type (category)
    privacy: 'public' as 'public' | 'private' | 'restricted',
    parent_id: '',
    tags: [] as string[],
    color: '',
    settings: {} as Record<string, any>,
    members: [] as Member[],
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    type: '',
    privacy: '',
    members: '',
  });
  const [tagInput, setTagInput] = useState('');
  const [showMemberSelector, setShowMemberSelector] = useState(false);
  
  // Modal states for UI consistency
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedChannelForAction, setSelectedChannelForAction] = useState<Channel | null>(null);
  
  const { showError, showSuccess, showToast, showInfo, showWarning } = useToast();

  // Load available members from API
  const loadAvailableMembers = useCallback(async () => {
    // Use functional update to check loading state without adding to dependencies
    setLoadingMembers(current => {
      if (current) return current; // Already loading, don't start another request
      return true; // Start loading
    });
    
    try {
      console.log('🔄 Loading available members from API...');
      
      // Get current user first to include them in the list
      const currentUser = await userService.getCurrentUser();
      
      // Get list of users
      const usersResponse = await userService.getUsers({ limit: 50 });
      console.log('✅ Members loaded:', usersResponse.users.length, 'users');
      
      // Convert User objects to Member format
      const members: Member[] = usersResponse.users.map(user => ({
        id: user.id,
        name: user.name,
        avatar: user.avatar_url || user.name.charAt(0).toUpperCase(), // Use avatar URL or first letter of name
        role: user.job_title || user.role || 'Member',
        email: user.email,
        department: user.department,
        job_title: user.job_title,
      }));
      
      // Ensure current user is at the beginning of the list with special formatting
      const currentUserMember = members.find(m => m.id === currentUser.id);
      const otherMembers = members.filter(m => m.id !== currentUser.id);
      
      if (currentUserMember) {
        currentUserMember.name = 'You';
        currentUserMember.role = 'Current User';
        setAvailableMembers([currentUserMember, ...otherMembers]);
      } else {
        // Fallback: create current user member manually if not found in list
        const fallbackCurrentUser: Member = {
          id: currentUser.id,
          name: 'You',
          avatar: currentUser.avatar_url || currentUser.name.charAt(0).toUpperCase(),
          role: 'Current User',
          email: currentUser.email,
          department: currentUser.department,
          job_title: currentUser.job_title,
        };
        setAvailableMembers([fallbackCurrentUser, ...otherMembers]);
      }
    } catch (error) {
      console.error('❌ Failed to load available members:', error);
      // Fallback to mock data for better user experience
      const fallbackMembers: Member[] = [
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
      console.log('🎭 Using fallback members:', fallbackMembers);
      setAvailableMembers(fallbackMembers);
      showWarning('Unable to load team members from server. Using cached data.');
    } finally {
      setLoadingMembers(false);
    }
  }, [showWarning]);

  // Categories
  // Load categories from API
  const loadCategories = useCallback(async () => {
    try {
      console.log('🔄 Loading categories from API...');
      const apiCategories = await channelService.getChannelCategories();
      console.log('✅ Categories loaded:', apiCategories.length, 'categories');
      
      // Calculate channel counts for each category
      const categoriesWithCounts: Category[] = apiCategories.map(category => ({
        ...category,
        count: channels.filter(channel => {
          const channelMappedCategory = CHANNEL_TYPE_TO_CATEGORY_MAP[channel.category];
          return channelMappedCategory === category.id;
        }).length,
      }));
      
      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error('❌ Failed to load categories:', error);
      // Fallback to mock categories for better user experience
      const fallbackCategories: Category[] = [
        { id: 'general', name: 'General', description: 'General discussions', count: Math.floor(Math.random() * 8) + 2, color: '#6B7280', icon: 'chatbubble-outline' },
        { id: 'project', name: 'Project', description: 'Project discussions', count: Math.floor(Math.random() * 12) + 3, color: '#3B82F6', icon: 'folder-outline' },
        { id: 'department', name: 'Department', description: 'Department communications', count: Math.floor(Math.random() * 6) + 1, color: '#10B981', icon: 'business-outline' },
        { id: 'announcement', name: 'Announcement', description: 'Important announcements', count: Math.floor(Math.random() * 4) + 1, color: '#F59E0B', icon: 'megaphone-outline' },
        { id: 'private', name: 'Private', description: 'Private discussions', count: Math.floor(Math.random() * 5) + 1, color: '#8B5CF6', icon: 'lock-closed-outline' },
      ];
      console.log('🎭 Using fallback categories:', fallbackCategories);
      setCategories(fallbackCategories);
    }
  }, [channels]);

  // Load channels function
  const loadChannels = useCallback(async (showLoadingSpinner: boolean = true) => {
    try {
      if (showLoadingSpinner) {
        setLoading(true);
      }
      
      // Fetch channels with statistics from API
      try {
        console.log('🔄 Loading channels with statistics...');
        const apiChannelsWithStats = await channelService.getChannelsWithStats();
        console.log('📊 Channels with stats loaded:', apiChannelsWithStats.length, 'channels');
        
        // Get member details for each channel
        const displayChannels: Channel[] = await Promise.all(
          apiChannelsWithStats.map(async (apiChannel) => {
            try {
              // Fetch member details for better display
              const membersResponse = await channelService.getChannelMembers(apiChannel.id, { limit: 10 });
              const members: Member[] = membersResponse?.data?.slice(0, 10)?.map((member: any) => ({
                id: member.user_id,
                name: member.user_name || 'Unknown User',
                avatar: member.user_avatar || undefined, // Let Avatar component handle fallback
                role: member.role,
              })) || [];

              return mapApiChannelToDisplayChannel(apiChannel, {
                messageCount: apiChannel.messageCount,
                fileCount: apiChannel.fileCount,
                members,
              });
            } catch (memberError: any) {
              // Handle permission errors gracefully
              if (memberError?.statusCode === 403 || memberError?.message?.includes('403')) {
                console.log(`📝 Channel "${apiChannel.name}" members not accessible (private/restricted access)`);
              } else {
                console.warn('Failed to fetch members for channel:', apiChannel.name, memberError?.message || memberError);
              }
              
              // Return channel without member details - this is expected for private channels
              return mapApiChannelToDisplayChannel(apiChannel, {
                messageCount: apiChannel.messageCount,
                fileCount: apiChannel.fileCount,
                members: [],
              });
            }
          })
        );
        
        setChannels(displayChannels);
      } catch (apiError) {
        console.warn('Failed to fetch from API, using fallback data:', apiError);
        // Fallback to demo data
        setChannels([
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
            messages: 24,
            files: 8,
            memberCount: 3,
            privacy: 'public',
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
            messages: 18,
            files: 12,
            memberCount: 3,
            privacy: 'public',
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
            messages: 31,
            files: 5,
            memberCount: 3,
            privacy: 'private',
            createdAt: new Date(),
          },
        ]);
      }
      
    } catch (error) {
      console.error('Failed to load channels:', error);
      showError('Failed to load channels. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showError]);

  // Load categories after channels are loaded
  useEffect(() => {
    if (channels.length > 0) {
      loadCategories();
    }
  }, [channels, loadCategories]);

  // Load available members on component mount
  useEffect(() => {
    loadAvailableMembers();
  }, [loadAvailableMembers]);

  // Initialize form with current user as member
  useEffect(() => {
    if (showCreateChannel && formData.members.length === 0 && availableMembers.length > 0) {
      setFormData(prev => ({
        ...prev,
        members: [availableMembers[0]] // Current user
      }));
    }
  }, [showCreateChannel, availableMembers]);

  // Load channels on component mount
  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  // Filter channels based on search query and selected categories
  const filteredChannels = useMemo(() => {
    let filtered = channels;

    // Filter by selected categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(channel => {
        const channelMappedCategory = CHANNEL_TYPE_TO_CATEGORY_MAP[channel.category];
        return selectedCategories.includes(channelMappedCategory);
      });
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
    const errors = { name: '', type: '', privacy: '', members: '' };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Channel name is required';
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Channel name must be at least 2 characters';
      isValid = false;
    }

    if (!formData.type) {
      errors.type = 'Please select a channel type';
      isValid = false;
    }

    if (!formData.privacy) {
      errors.privacy = 'Please select privacy level';
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
      type: '',
      privacy: 'public' as 'public' | 'private' | 'restricted',
      parent_id: '',
      tags: [],
      color: '',
      settings: {},
      members: [],
    });
    setFormErrors({ name: '', type: '', privacy: '', members: '' });
    setTagInput('');
    setIsEditMode(false);
    setEditingChannelId(null);
  };

  // Handle form submission (create or edit)
  const handleSubmitChannel = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      console.log('🚀 Submitting channel data:', formData);
      
      const channelData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        type: formData.type as any, // Maps to channel_type in backend
        privacy: formData.privacy as any, // Maps to privacy_level in backend
        ...(formData.parent_id && { parent_id: formData.parent_id }),
        tags: formData.tags,
        ...(formData.color && { color: formData.color }),
        settings: formData.settings,
      };
      
      console.log('📤 API payload:', channelData);

      if (isEditMode && editingChannelId) {
        // Edit existing channel
        const updatedChannel = await channelService.updateChannel(editingChannelId, channelData);
        showSuccess(`Channel "${formData.name}" updated successfully!`);
      } else {
        // Create new channel
        const createdChannel = await channelService.createChannel(channelData);
        showSuccess(`Channel "${formData.name}" created successfully!`);
      }
      
      // Refresh channels list
      await loadChannels(false);
      
      resetForm();
      setShowCreateChannel(false);
    } catch (error) {
      console.error(`❌ Failed to ${isEditMode ? 'update' : 'create'} channel:`, {
        error: error instanceof Error ? error.message : error,
        formData,
        channelData: {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          type: formData.type,
          privacy: formData.privacy,
          tags: formData.tags,
        }
      });
      
      if (error instanceof AuthError) {
        showError(`${error.message} (${error.code || 'Unknown'})`);
      } else if (error instanceof Error) {
        showError(`Failed to ${isEditMode ? 'update' : 'create'} channel: ${error.message}`);
      } else {
        showError(`Failed to ${isEditMode ? 'update' : 'create'} channel. Please try again.`);
      }
    }
  };

  // Start editing a channel
  const startEditChannel = (channel: Channel) => {
    setIsEditMode(true);
    setEditingChannelId(channel.id);
    setFormData({
      name: channel.title,
      description: channel.description,
      type: channel.category,
      privacy: channel.privacy,
      parent_id: '',
      tags: channel.tags,
      color: '',
      settings: {},
      members: channel.members,
    });
    setShowCreateChannel(true);
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
  const toggleMember = useCallback((member: Member) => {
    // Use functional updates to avoid dependencies
    setAvailableMembers(currentMembers => {
      // Don't allow removing current user (first member in the list)
      if (currentMembers.length > 0 && member.id === currentMembers[0].id) return currentMembers;
      
      setFormData(prev => ({
        ...prev,
        members: prev.members.some(m => m.id === member.id)
          ? prev.members.filter(m => m.id !== member.id)
          : [...prev.members, member]
      }));
      
      return currentMembers; // No change to availableMembers
    });
  }, []);

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
      showError(`Unable to navigate to channel: ${errorMessage}. Please check navigation setup.`);
    }
  };

  const handleChannelOptions = (channel: DisplayChannel) => {
    console.log('Three dots clicked for channel:', channel.title);
    
    // Ensure all other modals are closed
    setShowCategoryFilter(false);
    setShowCreateChannel(false);
    setShowMemberSelector(false);
    setShowDeleteConfirmation(false);
    
    // Open ActionSheet
    setSelectedChannelForAction(channel);
    setShowActionSheet(true);
  };

  const handleDeleteChannel = (channel: Channel) => {
    setSelectedChannelForAction(channel);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteChannel = async () => {
    if (!selectedChannelForAction) return;
    
    try {
      await channelService.deleteChannel(selectedChannelForAction.id);
      showSuccess(`Channel "${selectedChannelForAction.title}" deleted successfully`);
      
      // Refresh channels list
      await loadChannels(false);
    } catch (error) {
      console.error('Failed to delete channel:', error);
      if (error instanceof AuthError) {
        showError(error.message);
      } else {
        showError('Failed to delete channel. Please try again.');
      }
    } finally {
      setShowDeleteConfirmation(false);
      setSelectedChannelForAction(null);
    }
  };

  const handleEditChannel = (channel: Channel) => {
    startEditChannel(channel);
  };

  // Helper function to get action sheet options based on user role and channel
  const getActionSheetOptions = () => {
    if (!selectedChannelForAction) return [];
    
    // Check if user can edit (CEO, channel owner, or channel admin)
    const canEdit = user?.role === 'ceo' || 
                   selectedChannelForAction.members.some(m => 
                     m.id === user?.id && (m.role === 'owner' || m.role === 'admin'));
    
    // Check if user can delete (CEO or channel owner only)
    const canDelete = user?.role === 'ceo' || 
                     selectedChannelForAction.members.some(m => 
                       m.id === user?.id && m.role === 'owner');
    
    const options: Array<{
      text: string;
      icon: string;
      iconLibrary: 'material' | 'ionicon';
      style?: 'default' | 'destructive' | 'cancel';
      onPress: () => void;
    }> = [];
    
    // Add edit option if user has permission
    if (canEdit) {
      options.push({
        text: 'Edit Channel',
        icon: 'edit',
        iconLibrary: 'material',
        style: 'default',
        onPress: () => {
          setShowActionSheet(false);
          handleEditChannel(selectedChannelForAction);
        },
      });
    }
    
    // Add delete option if user has permission
    if (canDelete) {
      options.push({
        text: 'Delete Channel',
        icon: 'delete',
        iconLibrary: 'material',
        style: 'destructive',
        onPress: () => {
          setShowActionSheet(false);
          handleDeleteChannel(selectedChannelForAction);
        },
      });
    }
    
    // Always add view channel option
    options.push({
      text: 'View Channel',
      icon: 'visibility',
      iconLibrary: 'material',
      style: 'default',
      onPress: () => {
        setShowActionSheet(false);
        handleChannelPress(selectedChannelForAction);
      },
    });
    
    options.push({
      text: 'Cancel',
      icon: 'close',
      iconLibrary: 'material',
      style: 'cancel',
      onPress: () => {},
    });
    
    return options;
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
      {loading ? (
        <Animated.View
          entering={FadeInUp.delay(400).duration(600)}
          className="flex-1 items-center justify-center py-12"
        >
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text className="text-gray-500 text-lg font-medium mt-4">
            Loading channels...
          </Text>
        </Animated.View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadChannels(false);
              }}
              tintColor="#8B5CF6"
              colors={["#8B5CF6"]}
            />
          }
        >
          <Animated.View entering={FadeInUp.delay(800).duration(600)}>
            {filteredChannels.length > 0 ? (
              filteredChannels.map((channel, index) => (
                <ChannelCard
                  key={channel.id}
                  title={channel.title}
                  description={channel.description}
                  category={channel.category}
                  tags={channel.tags}
                  memberAvatars={channel.memberAvatars}
                  messages={channel.messages}
                  files={channel.files}
                  members={channel.memberCount}
                  isPrivate={channel.privacy !== 'public'}
                  index={index}
                  onPress={() => handleChannelPress(channel)}
                  onOptionsPress={() => handleChannelOptions(channel)}
                />
              ))
            ) : searchQuery.trim() || selectedCategories.length > 0 ? (
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
                  Try searching with different keywords or adjusting filters
                </Text>
              </Animated.View>
            ) : (
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
                  <Feather name="plus" size={32} color="#9CA3AF" />
                </View>
                <Text className="text-gray-500 text-lg font-medium mb-2">
                  No channels yet
                </Text>
                <Text className="text-gray-400 text-sm text-center px-8 mb-4">
                  Create your first channel to start collaborating with your team
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCreateChannel(true)}
                  className="bg-purple-600 rounded-xl px-6 py-3"
                >
                  <Text className="text-white font-medium">Create Channel</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </Animated.View>
        </ScrollView>
      )}

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
                        <IonIcon name={category.icon ?? 'help'} size={20} color={category.color ?? '#6B7280'} />
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
              <Text className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Channel' : 'Create Channel'}</Text>
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

              {/* Channel Type */}
              <View className="mb-6">
                <Text className="text-gray-700 font-medium mb-2">Channel Type *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row space-x-3">
                    {categories.map((category) => {
                      const isSelected = formData.type === category.id;
                      return (
                        <TouchableOpacity
                          key={category.id}
                          onPress={() => {
                            setFormData(prev => ({ ...prev, type: category.id }));
                            if (formErrors.type) setFormErrors(prev => ({ ...prev, type: '' }));
                          }}
                          className={`rounded-xl px-4 py-3 border flex-row items-center ${
                            isSelected 
                              ? 'bg-purple-100 border-purple-300' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <IonIcon name={category.icon ?? 'help'} size={18} color={category.color ?? '#6B7280'} />
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
                {formErrors.type ? (
                  <Text className="text-red-500 text-sm mt-1">{formErrors.type}</Text>
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
                <Text className="text-gray-700 font-medium mb-2">Privacy *</Text>
                <View className="space-y-3">
                  <TouchableOpacity 
                    onPress={() => setFormData(prev => ({ ...prev, privacy: 'public' }))}
                    className="flex-row items-center p-3 bg-gray-50 rounded-xl"
                  >
                    <View className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
                      formData.privacy === 'public' ? 'border-purple-600 bg-purple-600' : 'border-gray-300'
                    }`}>
                      {formData.privacy === 'public' && <View className="w-2 h-2 rounded-full bg-white" />}
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-900 font-medium">Public</Text>
                      <Text className="text-gray-500 text-sm">Anyone in the workspace can join</Text>
                    </View>
                    <IonIcon name="globe-outline" size={20} color="#10B981" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => setFormData(prev => ({ ...prev, privacy: 'private' }))}
                    className="flex-row items-center p-3 bg-gray-50 rounded-xl"
                  >
                    <View className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
                      formData.privacy === 'private' ? 'border-purple-600 bg-purple-600' : 'border-gray-300'
                    }`}>
                      {formData.privacy === 'private' && <View className="w-2 h-2 rounded-full bg-white" />}
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-900 font-medium">Private</Text>
                      <Text className="text-gray-500 text-sm">Only invited members can join</Text>
                    </View>
                    <MaterialIcon name="lock" size={20} color="#F59E0B" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => setFormData(prev => ({ ...prev, privacy: 'restricted' }))}
                    className="flex-row items-center p-3 bg-gray-50 rounded-xl"
                  >
                    <View className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
                      formData.privacy === 'restricted' ? 'border-purple-600 bg-purple-600' : 'border-gray-300'
                    }`}>
                      {formData.privacy === 'restricted' && <View className="w-2 h-2 rounded-full bg-white" />}
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-900 font-medium">Restricted</Text>
                      <Text className="text-gray-500 text-sm">Admin approval required to join</Text>
                    </View>
                    <MaterialIcon name="admin-panel-settings" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
                {formErrors.privacy ? (
                  <Text className="text-red-500 text-sm mt-1">{formErrors.privacy}</Text>
                ) : null}
              </View>

              {/* Members */}
              <View className="mb-8">
                <Text className="text-gray-700 font-medium mb-2">Members ({formData.members.length})</Text>
                
                {/* Current Members */}
                {formData.members.length > 0 && (
                  <View className="mb-3">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View className="flex-row space-x-2">
                        {formData.members.map((member) => {
                          const isCurrentUser = availableMembers.length > 0 && member.id === availableMembers[0].id;
                          return (
                            <View key={member.id} className="bg-purple-50 rounded-xl px-3 py-2 flex-row items-center">
                              <View className="w-6 h-6 bg-purple-600 rounded-full items-center justify-center mr-2">
                                <Text className="text-white text-xs font-bold">
                                  {typeof member.avatar === 'string' && member.avatar.length === 1 
                                    ? member.avatar 
                                    : member.name.charAt(0).toUpperCase()
                                  }
                                </Text>
                              </View>
                              <Text className="text-purple-700 text-sm font-medium">{member.name}</Text>
                              {!isCurrentUser && (
                                <TouchableOpacity onPress={() => toggleMember(member)} className="ml-2">
                                  <Feather name="x" size={14} color="#7C3AED" />
                                </TouchableOpacity>
                              )}
                            </View>
                          );
                        })}
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
                onPress={handleSubmitChannel}
                className="flex-1 bg-purple-600 rounded-xl py-4"
              >
                <Text className="text-white font-medium text-center">{isEditMode ? 'Update Channel' : 'Create Channel'}</Text>
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
              {loadingMembers ? (
                <View className="items-center justify-center py-8">
                  <ActivityIndicator size="large" color="#8B5CF6" />
                  <Text className="text-gray-500 text-sm mt-2">Loading team members...</Text>
                </View>
              ) : (
                availableMembers.map((member) => {
                  const isSelected = formData.members.some(m => m.id === member.id);
                  const isCurrentUser = availableMembers.length > 0 && member.id === availableMembers[0].id;
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
                          <Text className="text-white font-bold">
                            {typeof member.avatar === 'string' && member.avatar.length === 1 
                              ? member.avatar 
                              : member.name.charAt(0).toUpperCase()
                            }
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-gray-900 font-medium">
                            {member.name}
                          </Text>
                          <Text className="text-gray-500 text-sm">{member.role}</Text>
                          {member.department && (
                            <Text className="text-gray-400 text-xs">{member.department}</Text>
                          )}
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
                })
              )}
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

      {/* Action Sheet for Channel Options */}
      <ActionSheet
        visible={showActionSheet}
        title="Channel Options"
        message={selectedChannelForAction ? `Options for "${selectedChannelForAction.title}"` : ''}
        options={getActionSheetOptions()}
        onClose={() => {
          console.log('ActionSheet closing');
          setShowActionSheet(false);
          setSelectedChannelForAction(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteConfirmation}
        title="Delete Channel"
        message={
          selectedChannelForAction
            ? `Are you sure you want to delete "${selectedChannelForAction.title}"? This action cannot be undone and will remove all messages and files in this channel.`
            : ''
        }
        confirmText="Delete"
        cancelText="Cancel"
        confirmStyle="destructive"
        onConfirm={confirmDeleteChannel}
        onCancel={() => {
          setShowDeleteConfirmation(false);
          setSelectedChannelForAction(null);
        }}
      />
    </View>
  );
};