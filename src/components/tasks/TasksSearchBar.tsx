import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface TasksSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (focused: boolean) => void;
  onFilterPress: () => void;
  onSortPress: () => void;
  filterButtonScale: any;
}

export const TasksSearchBar: React.FC<TasksSearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  isSearchFocused,
  setIsSearchFocused,
  onFilterPress,
  onSortPress,
  filterButtonScale,
}) => {
  const animatedFilterButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: filterButtonScale.value }],
  }));

  return (
    <Animated.View className="px-4 pb-4">
      <View className="flex-row items-center space-x-2">
        <View className="flex-1">
          <LinearGradient
            colors={
              isSearchFocused
                ? ['#E0F2FE', '#F0F9FF']
                : ['#F8FAFC', '#F1F5F9']
            }
            className="rounded-xl border"
            style={{
              borderColor: isSearchFocused ? '#0EA5E9' : '#E2E8F0',
              borderWidth: isSearchFocused ? 2 : 1,
            }}
          >
            <View className="flex-row items-center px-4 py-3">
              <Feather
                name="search"
                size={18}
                color={isSearchFocused ? '#0EA5E9' : '#64748B'}
              />
              <TextInput
                placeholder="Search tasks..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="flex-1 ml-3 text-gray-900"
                placeholderTextColor="#9CA3AF"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Feather name="x" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </View>

        <AnimatedTouchableOpacity
          style={animatedFilterButtonStyle}
          onPress={onFilterPress}
          className="bg-white rounded-xl p-3"
        >
          <Feather name="filter" size={20} color="#6B7280" />
        </AnimatedTouchableOpacity>

        <TouchableOpacity
          onPress={onSortPress}
          className="bg-white rounded-xl p-3"
        >
          <Feather name="refresh-cw" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};