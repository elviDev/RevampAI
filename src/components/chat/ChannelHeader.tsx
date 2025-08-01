import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface ChannelHeaderProps {
  channelName: string;
  members: any[];
  onBack: () => void;
  onMembersPress: () => void;
}

export const ChannelHeader: React.FC<ChannelHeaderProps> = ({
  channelName,
  members,
  onBack,
  onMembersPress,
}) => {
  const backButtonScale = useSharedValue(1);

  const backButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backButtonScale.value }],
  }));

  const handleBackPress = () => {
    backButtonScale.value = withSpring(0.95, { damping: 10 }, () => {
      backButtonScale.value = withSpring(1, { damping: 10 });
    });
    onBack();
  };

  return (
    <View className="bg-white border-b border-gray-100 px-4 py-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <Animated.View style={backButtonAnimatedStyle}>
            <TouchableOpacity
              onPress={handleBackPress}
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3"
            >
              <Feather name="arrow-left" size={20} color="#6B7280" />
            </TouchableOpacity>
          </Animated.View>

          <View className="flex-1">
            <Text className="text-gray-900 text-lg font-bold" numberOfLines={1}>
              {channelName}
            </Text>
            <TouchableOpacity onPress={onMembersPress}>
              <Text className="text-gray-500 text-sm">
                {members.length} members • Tap to view
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Online Members Avatars */}
        <View className="flex-row -space-x-2">
          {members.slice(0, 4).map((member, index) => (
            <View
              key={member.id}
              className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white items-center justify-center"
              style={{ zIndex: members.length - index }}
            >
              <Text className="text-white text-xs font-semibold">
                {member.name.charAt(0)}
              </Text>
            </View>
          ))}
          {members.length > 4 && (
            <View className="w-8 h-8 bg-gray-400 rounded-full border-2 border-white items-center justify-center">
              <Text className="text-white text-xs font-semibold">
                +{members.length - 4}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};
