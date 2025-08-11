import React from 'react';
import { View } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  interpolate 
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { AICapability, getOrbitalIconPosition } from '../../utils/homeScreenUtils';

interface AIBrainVisualizationProps {
  aiPulse: Animated.SharedValue<number>;
  aiCapabilities: AICapability[];
}

export const AIBrainVisualization: React.FC<AIBrainVisualizationProps> = ({
  aiPulse,
  aiCapabilities,
}) => {
  const { theme } = useTheme();

  const aiPulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(aiPulse.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(aiPulse.value, [0, 1], [1, 1.05]) }],
  }));

  const renderIcon = (capability: AICapability, size: number = 20) => {
    const IconComponent = 
      capability.iconFamily === 'Feather'
        ? Feather
        : capability.iconFamily === 'MaterialIcons'
          ? MaterialIcon
          : MaterialCommunityIcon;

    return (
      <IconComponent
        name={capability.icon}
        size={size}
        color={capability.color}
      />
    );
  };

  return (
    <View
      style={{
        alignItems: 'center',
        paddingVertical: 32,
        position: 'relative',
      }}
    >
      <Animated.View
        style={[
          {
            width: 200,
            height: 200,
            borderRadius: 100,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          },
          aiPulseStyle,
        ]}
      >
        <LinearGradient
          colors={theme.colors.gradients.primary}
          style={{
            width: 180,
            height: 180,
            borderRadius: 90,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <MaterialCommunityIcon
            name="brain"
            size={80}
            color={theme.colors.text.onPrimary}
          />
        </LinearGradient>

        {/* Orbiting Icons */}
        {[0, 1, 2, 3].map((index) => (
          <Animated.View
            key={index}
            style={[
              {
                position: 'absolute',
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: theme.colors.surface,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: theme.colors.shadows.neutral,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              },
              getOrbitalIconPosition(index),
            ]}
          >
            {renderIcon(aiCapabilities[index], 20)}
          </Animated.View>
        ))}
      </Animated.View>
    </View>
  );
};