import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../../contexts/ThemeContext';
import { Logo } from '../common/Logo';
import { ThemeToggle } from '../common/ThemeToggle';

interface HomeHeaderProps {
  headerOpacity: Animated.SharedValue<number>;
  headerTranslateY: Animated.SharedValue<number>;
  logoAnimatedStyle: any;
  onUserPress?: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  headerOpacity,
  headerTranslateY,
  logoAnimatedStyle,
  onUserPress,
}) => {
  const { theme } = useTheme();

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingVertical: 16,
        },
        headerAnimatedStyle,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Animated.View style={logoAnimatedStyle}>
          <Logo
            size={100}
            variant="primary"
            enableRotation={false}
            imageSize={50}
          />
        </Animated.View>
        <View style={{ marginLeft: 16 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '800',
              color: theme.colors.text.primary,
            }}
          >
            Javier AI
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: theme.colors.text.secondary,
              fontWeight: '500',
            }}
          >
            Advanced Project Intelligence
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <ThemeToggle size="small" />
        <TouchableOpacity onPress={onUserPress}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: theme.colors.surface,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: theme.colors.primary,
            }}
          >
            <Feather name="user" size={20} color={theme.colors.primary} />
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};