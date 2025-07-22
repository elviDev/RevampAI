import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { Colors } from '../../utils/colors';
interface QuickActionCardProps {
  title: string;
  onPress: () => void;
  delay?: number;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  onPress,
  delay = 0,
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 15 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 600 }));
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePress = () => {
    scale.value = withSpring(0.95, { damping: 20 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 15 });
      onPress();
    }, 100);
  };

  return (
    <Animated.View style={[animatedStyle]}>
      <TouchableOpacity
        onPress={handlePress}
        style={{
          width: '48%',
          aspectRatio: 1.2,
          backgroundColor: Colors.surface,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: Colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
          shadowColor: Colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
        activeOpacity={0.8}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: '500',
            color: Colors.text.secondary,
            textAlign: 'center',
            lineHeight: 24,
          }}
        >
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};
