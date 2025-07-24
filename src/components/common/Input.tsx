import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Colors } from '../../utils/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnimation = useSharedValue(0);

  const animatedBorderStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusAnimation.value,
      [0, 1],
      [Colors.primary, Colors.primary],
    );

    return {
      borderColor,
      borderWidth: withTiming(focusAnimation.value ? 2 : 1),
    };
  });

  const handleFocus = (e: any) => {
    setIsFocused(true);
    focusAnimation.value = withTiming(1);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    focusAnimation.value = withTiming(0);
    onBlur?.(e);
  };

  return (
    <View style={[{ marginBottom: 16 }, containerStyle]}>
      {label && (
        <Text
          style={[
            {
              fontSize: 14,
              color: Colors.text.secondary,
              marginBottom: 8,
              fontWeight: '500',
            },
            labelStyle,
          ]}
        >
          {label}
        </Text>
      )}
      <Animated.View
        style={[
          {
            borderRadius: 24,
            backgroundColor: Colors.gray[100],
            overflow: 'hidden',
          },
          animatedBorderStyle,
        ]}
      >
        <TextInput
          style={[
            {
              paddingHorizontal: 20,
              paddingVertical: 16,
              fontSize: 16,
              color: Colors.text.primary,
              backgroundColor: 'transparent',
            },
            inputStyle,
          ]}
          placeholderTextColor={Colors.text.tertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </Animated.View>
      {error && (
        <Text
          style={{
            fontSize: 12,
            color: Colors.error,
            marginTop: 4,
            marginLeft: 20,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
};
