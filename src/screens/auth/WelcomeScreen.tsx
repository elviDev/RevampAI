import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useDispatch } from 'react-redux';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { CurvedBackground } from '../../components/common/CurvedBackground/CurvedBackground';
import { Button } from '../../components/common/Button';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { Logo } from '../../components/common/Logo';
import { loginSuccess, loginFailure } from '../../store/slices/authSlice';
import type { AppDispatch } from '../../store/store';

interface WelcomeScreenProps {
  navigation: any;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);

  const logoScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const voiceButtonScale = useSharedValue(0);

  React.useEffect(() => {
    // Animate logo
    logoScale.value = withSpring(1, { damping: 15 });

    // Animate text with delay
    textOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));

    // Animate buttons with delay
    buttonOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));

    // Animate voice button with bounce
    voiceButtonScale.value = withDelay(
      900,
      withSequence(
        withSpring(1.2, { damping: 8 }),
        withSpring(1, { damping: 12 }),
      ),
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  const voiceButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: voiceButtonScale.value }],
  }));

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      // Simulate Google sign in
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Dispatch login success action
      dispatch(
        loginSuccess({
          id: '1',
          email: 'user@gmail.com',
          fullName: 'Google User',
          role: 'member' as const,
        }),
      );
    } catch (error) {
      console.error('Google sign in error:', error);
      dispatch(loginFailure('Google sign in failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceCommand = () => {
    // Handle voice command
    console.log('Voice command activated');
  };

  return (
    <CurvedBackground customColor={theme.colors.primary} opacity={0.4}>
      {/* Theme Toggle */}
      <View
        style={{
          position: 'absolute',
          top: 60,
          right: 24,
          zIndex: 1000,
        }}
      >
        <ThemeToggle size="medium" />
      </View>

      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Logo */}
        <Animated.View style={[logoAnimatedStyle]}>
          <Logo
            size={120}
            variant="primary"
            enableRotation={true}
            rotationDuration={6000}
            imageSize={180}
          />
        </Animated.View>

        {/* Welcome Text */}
        <Animated.View
          style={[{ alignItems: 'center', marginTop: 40 }, textAnimatedStyle]}
        >
          <Text
            style={{
              fontSize: 12,
              color: theme.colors.text.secondary,
              marginBottom: 8,
              fontWeight: '500',
            }}
          >
            Javier AI Platform
          </Text>
          <Text
            style={{
              fontSize: 32,
              color: theme.colors.text.primary,
              fontWeight: '700',
              marginBottom: 16,
              textAlign: 'center',
            }}
          >
            Welcome
          </Text>
          <Text
            style={{
              fontSize: 18,
              color: theme.colors.text.secondary,
              textAlign: 'center',
              lineHeight: 28,
              paddingHorizontal: 20,
            }}
          >
            Your smart assistant to boost speed, clarity, and focus.
          </Text>
        </Animated.View>

        {/* Buttons */}
        <Animated.View
          style={[
            {
              width: '100%',
              paddingHorizontal: 20,
              marginTop: 40,
            },
            buttonAnimatedStyle,
          ]}
        >
          <Button
            title="Sign In"
            onPress={() => navigation.navigate('Login')}
            variant="outline"
            size="medium"
            fullWidth
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              marginBottom: 16,
            }}
            textStyle={{ color: theme.colors.text.primary }}
          />

          <Button
            title="Sign In with Google"
            onPress={handleGoogleSignIn}
            loading={isLoading}
            variant="primary"
            size="medium"
            fullWidth
            style={{ marginBottom: 16 }}
            icon={
              <Image
                source={require('../../assets/icons/google.png')}
                style={{ width: 20, height: 20 }}
                resizeMode="contain"
              />
            }
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={{ alignItems: 'center', marginTop: 16 }}
          >
            <Text
              style={{
                fontSize: 14,
                color: theme.colors.text.secondary,
              }}
            >
              Don't have an account?{' '}
              <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
                Create account
              </Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </CurvedBackground>
  );
};
