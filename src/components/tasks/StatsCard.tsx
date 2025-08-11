import { View, Text } from 'react-native';
import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, { FadeInRight } from 'react-native-reanimated';

const StatsCard = ({ taskStats }: { taskStats: any }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-4"
    >
      {[
        { label: 'Total', value: taskStats.total, color: '#6B7280' },
        { label: 'Pending', value: taskStats.pending, color: '#F59E0B' },
        {
          label: 'In Progress',
          value: taskStats.inProgress,
          color: '#3B82F6',
        },
        {
          label: 'Completed',
          value: taskStats.completed,
          color: '#22C55E',
        },
        { label: 'Overdue', value: taskStats.overdue, color: '#EF4444' },
        {
          label: 'Unassigned',
          value: taskStats.unassigned,
          color: '#9CA3AF',
        },
      ].map((stat, index) => (
        <Animated.View
          key={stat.label}
          entering={FadeInRight.delay(index * 100).duration(600)}
          className="bg-white rounded-xl p-4 mr-3 min-w-[80px] items-center"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <Text
            className="text-2xl font-bold mb-1"
            style={{ color: stat.color }}
          >
            {stat.value}
          </Text>
          <Text className="text-gray-600 text-xs text-center">
            {stat.label}
          </Text>
        </Animated.View>
      ))}
    </ScrollView>
  );
};

export default StatsCard;
