import React from 'react';
import { View, Text } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { PerformanceStat } from '../../utils/homeScreenUtils';

interface PerformanceStatsProps {
  statsOpacity: Animated.SharedValue<number>;
  stats: PerformanceStat[];
  title?: string;
}

export const PerformanceStats: React.FC<PerformanceStatsProps> = ({
  statsOpacity,
  stats,
  title = "Transformative Results",
}) => {
  const { theme } = useTheme();

  const statsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          paddingHorizontal: 24,
          marginBottom: 32,
        },
        statsAnimatedStyle,
      ]}
    >
      <Text
        style={{
          fontSize: 20,
          fontWeight: '700',
          color: theme.colors.text.primary,
          marginBottom: 16,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        {stats.map((stat, index) => (
          <View
            key={index}
            style={{
              flex: 1,
              backgroundColor: theme.colors.surface,
              borderRadius: 16,
              padding: 20,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.colors.border,
              shadowColor: theme.colors.shadows.neutral,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text
              style={{
                fontSize: 28,
                fontWeight: '900',
                color: stat.color,
                marginBottom: 8,
              }}
            >
              {stat.value}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: theme.colors.text.secondary,
                textAlign: 'center',
                fontWeight: '600',
                lineHeight: 16,
              }}
            >
              {stat.label}
            </Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
};