import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { CurvedBackground } from '../../components/common/CurvedBackground/CurvedBackground';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { Logo } from '../../components/common/Logo';

interface ForgotPasswordScreenProps {
  navigation: any;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const logoScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const formOpacity = useSharedValue(0);

  React.useEffect(() => {
    // Animate logo
    logoScale.value = withSpring(1, { damping: 15 });

    // Animate text with delay
    textOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));

    // Animate form with delay
    formOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
  }));

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendResetLink = async () => {
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      setEmailSent(true);
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  if (emailSent) {
    return (
      <CurvedBackground customColor={theme.colors.success} opacity={0.4}>
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
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 24,
          }}
        >
          <Animated.View style={[logoAnimatedStyle]}>
            <Logo
              size={120}
              variant="success"
              enableRotation={true}
              rotationDuration={4000}
              imageSize={180}
            />
          </Animated.View>

          <Animated.View
            style={[{ alignItems: 'center', marginTop: 10 }, textAnimatedStyle]}
          >
            <Text
              style={{
                fontSize: 12,
                color: theme.colors.text.secondary,
                marginBottom: 8,
                fontWeight: '500',
              }}
            >
              Reset Link Sent
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
              Check Your Email
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
              We've sent a password{'\n'}
              reset link to{'\n'}
              <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
                {email}
              </Text>
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              { width: '100%', paddingHorizontal: 20, marginTop: 40 },
              formAnimatedStyle,
            ]}
          >
            <Button
              title="Back to Login"
              onPress={handleBackToLogin}
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

            <TouchableOpacity
              onPress={() => {
                setEmailSent(false);
                setEmail('');
              }}
              style={{ alignItems: 'center', marginTop: 16 }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.text.secondary,
                }}
              >
                Didn't receive the email?{' '}
                <Text
                  style={{ color: theme.colors.primary, fontWeight: '600' }}
                >
                  Try again
                </Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </CurvedBackground>
    );
  }

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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 24,
            paddingTop: 100,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <Animated.View style={[logoAnimatedStyle, { alignItems: 'center' }]}>
            <Logo
              size={120}
              variant="surface"
              borderWidth={3}
              enableRotation={true}
              rotationDuration={5500}
              imageSize={80}
            />
          </Animated.View>

          {/* Header Text */}
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
              Password Recovery
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
              Forgot Password?
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
              No worries! Enter your email{'\n'}
              and we'll send you{'\n'}a reset link.
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View
            style={[
              { width: '100%', paddingHorizontal: 20, marginTop: 40 },
              formAnimatedStyle,
            ]}
          >
            <Input
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={text => {
                setEmail(text);
                setError('');
              }}
              error={error}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />

            <Button
              title="Send Reset Link"
              onPress={handleSendResetLink}
              loading={isLoading}
              disabled={isLoading}
              variant="primary"
              size="medium"
              fullWidth
              style={{ marginTop: 16 }}
            />

            <TouchableOpacity
              onPress={handleBackToLogin}
              style={{ alignItems: 'center', marginTop: 16 }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.text.secondary,
                }}
              >
                Remember your password?{' '}
                <Text
                  style={{ color: theme.colors.primary, fontWeight: '600' }}
                >
                  Sign In
                </Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </CurvedBackground>
  );
};
