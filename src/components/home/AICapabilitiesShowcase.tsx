import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { AICapability, formatCapabilityColor } from '../../utils/homeScreenUtils';

interface AICapabilitiesShowcaseProps {
  capabilitiesOpacity: Animated.SharedValue<number>;
  capabilitiesTranslateY: Animated.SharedValue<number>;
  aiCapabilities: AICapability[];
  activeCapability: number;
  onCapabilityPress: (index: number) => void;
  title?: string;
}

export const AICapabilitiesShowcase: React.FC<AICapabilitiesShowcaseProps> = ({
  capabilitiesOpacity,
  capabilitiesTranslateY,
  aiCapabilities,
  activeCapability,
  onCapabilityPress,
  title = "AI-Powered Capabilities",
}) => {
  const { theme } = useTheme();

  const capabilitiesAnimatedStyle = useAnimatedStyle(() => ({
    opacity: capabilitiesOpacity.value,
    transform: [{ translateY: capabilitiesTranslateY.value }],
  }));

  const renderIcon = (capability: AICapability, size: number = 28) => {
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

  const currentCapability = aiCapabilities[activeCapability];

  return (
    <Animated.View
      style={[
        {
          paddingHorizontal: 24,
          marginBottom: 32,
        },
        capabilitiesAnimatedStyle,
      ]}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: '700',
          color: theme.colors.text.primary,
          marginBottom: 20,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>

      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 20,
          padding: 24,
          shadowColor: theme.colors.shadows.neutral,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 10,
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: formatCapabilityColor(currentCapability.color),
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 16,
            }}
          >
            {renderIcon(currentCapability, 28)}
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: theme.colors.text.primary,
                marginBottom: 4,
              }}
            >
              {currentCapability.title}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: theme.colors.text.secondary,
                lineHeight: 20,
              }}
            >
              {currentCapability.description}
            </Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: theme.colors.background,
            borderRadius: 12,
            padding: 16,
            borderLeftWidth: 4,
            borderLeftColor: currentCapability.color,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: theme.colors.text.secondary,
              marginBottom: 8,
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            VOICE COMMAND EXAMPLE
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: theme.colors.text.primary,
              fontStyle: 'italic',
              fontWeight: '500',
            }}
          >
            {currentCapability.voiceCommand}
          </Text>
        </View>
      </View>

      {/* Capability Dots */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: 16,
          gap: 8,
        }}
      >
        {aiCapabilities.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onCapabilityPress(index)}
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor:
                index === activeCapability
                  ? theme.colors.primary
                  : theme.colors.border,
            }}
          />
        ))}
      </View>
    </Animated.View>
  );
};