import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface TaskTagsCardProps {
  tags: string[];
}

export const TaskTagsCard: React.FC<TaskTagsCardProps> = ({ tags }) => {
  if (tags.length === 0) return null;

  return (
    <Animated.View
      entering={FadeInUp.delay(700).duration(600)}
      className="bg-white mx-6 mt-4 mb-6 rounded-2xl p-6"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <Text className="text-lg font-bold text-gray-900 mb-4">Tags</Text>
      <View className="flex-row flex-wrap gap-2">
        {tags.map((tag, index) => (
          <View
            key={index}
            className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-100"
          >
            <Text className="text-blue-700 text-sm font-medium">#{tag}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
};