import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { CurvedBackground } from '../../components/common/CurvedBackground/CurvedBackground';
import { Button } from '../../components/common/Botton';
import { Colors } from '../../utils/colors';

interface WelcomeScreenProps {
  navigation: any;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
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
    // For now, redirect to login screen
    // TODO: Implement Google Sign-In integration with backend
    navigation.navigate('Login');
  };

  const handleVoiceCommand = () => {
    // Handle voice command
    console.log('Voice command activated');
  };

  return (
    <CurvedBackground customColor={Colors.primary} opacity={0.4}>
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
          <Image source={require('../../assets/icons/logo.png')} />
        </Animated.View>

        {/* Welcome Text */}
        <Animated.View style={[{ alignItems: 'center' }, textAnimatedStyle]}>
          <Text
            style={{
              fontSize: 12,
              color: Colors.text.secondary,
              marginBottom: 8,
              fontWeight: '500',
            }}
          >
            T&T AI Voice Command
          </Text>
          <Text
            style={{
              fontSize: 32,
              color: Colors.text.primary,
              fontWeight: '700',
              marginBottom: 16,
              textAlign: 'center',
            }}
          >
            Welcome.
          </Text>
          <Text
            style={{
              fontSize: 18,
              color: Colors.text.secondary,
              textAlign: 'center',
              lineHeight: 28,
              paddingHorizontal: 20,
            }}
          >
            I'm your smart assistant,{'\n'}
            here to help you work faster,{'\n'}
            think clearer,{'\n'}
            and stay in flow.
          </Text>
        </Animated.View>

        {/* Buttons */}
        <Animated.View
          className="mt-10"
          style={[
            { width: '100%', paddingHorizontal: 20 },
            buttonAnimatedStyle,
          ]}
        >
          <Button
            title="Sign In"
            onPress={() => navigation.navigate('Login')}
            variant="outline"
            style={{
              backgroundColor: Colors.surface,
              borderColor: Colors.gray[300],
              marginBottom: 16,
            }}
            textStyle={{ color: Colors.text.primary }}
          />

          <Button
            title="Sign In with Google"
            onPress={handleGoogleSignIn}
            loading={isLoading}
            style={{ marginBottom: 16 }}
            icon={
              <Image
                source={require('../../assets/icons/google.png')}
                style={{ width: 20, height: 20, marginRight: 8 }}
                resizeMode="contain"
              />
            }
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('BasicInfoStep')}
            style={{ alignItems: 'center', marginTop: 16 }}
          >
            <Text
              style={{
                fontSize: 14,
                color: Colors.text.secondary,
              }}
            >
              Don't have an account?{' '}
              <Text style={{ color: Colors.primary, fontWeight: '600' }}>
                Create account
              </Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </CurvedBackground>
  );
};
