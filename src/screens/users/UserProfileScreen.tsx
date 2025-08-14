import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import type { MainStackParamList } from '../../navigation/MainNavigator';

type UserProfileScreenProps = NativeStackScreenProps<MainStackParamList, 'UserProfile'>;

export const UserProfileScreen: React.FC<UserProfileScreenProps> = ({
  navigation,
  route,
}) => {
  const { userId } = route.params;
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          className="mr-3 p-1"
        >
          <MaterialIcon name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold">User Profile</Text>
      </View>

      {/* Content */}
      <View className="flex-1 justify-center items-center px-4">
        <Text className="text-lg text-gray-800 mb-2">User Profile</Text>
        <Text className="text-gray-600 text-center">
          Profile for user ID: {userId}
        </Text>
        <Text className="text-gray-500 text-center mt-4">
          This is a placeholder screen. In a real app, this would show detailed user information, 
          status, contact options, and shared content.
        </Text>
      </View>
    </View>
  );
};