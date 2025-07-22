import React from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const ActivityScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <View 
      className="flex-1 bg-gray-50 items-center justify-center" 
      style={{ paddingTop: insets.top }}
    >
      <Text className="text-gray-900 text-2xl font-bold mb-4">Activity</Text>
      <Text className="text-gray-500 text-lg">Coming Soon</Text>
    </View>
  );
};