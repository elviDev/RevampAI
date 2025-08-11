import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useDispatch } from 'react-redux';
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
import { loginSuccess, loginFailure } from '../../store/slices/authSlice';
import type { LoginCredentials } from '../../types/auth';
import type { AppDispatch } from '../../store/store';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginCredentials>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginCredentials> = {};

    if (!credentials.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!credentials.password) {
      newErrors.password = 'Password is required';
    } else if (credentials.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Dispatch login success action instead of navigating manually
      dispatch(
        loginSuccess({
          id: '1',
          email: credentials.email,
          fullName: 'Demo User',
          role: 'member' as const,
        }),
      );
    } catch (error) {
      console.error('Login error:', error);
      dispatch(loginFailure('Login failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      // Simulate Google sign in
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Dispatch login success action instead of navigating manually
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
      setIsGoogleLoading(false);
    }
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
              variant="primary"
              enableRotation={true}
              rotationDuration={5000}
              imageSize={180}
            />
          </Animated.View>

          {/* Header Text */}
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
              Welcome Back
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
              Sign in to continue{'\n'}
              your journey with{'\n'}
              intelligent assistance.
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View
            style={[
              { width: '100%', paddingHorizontal: 20, marginTop: 40 },
              formAnimatedStyle,
            ]}
          >
            {/* Email Input */}
            <Input
              label="Email"
              placeholder="Enter your email"
              value={credentials.email}
              onChangeText={email =>
                setCredentials(prev => ({ ...prev, email }))
              }
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Password Input */}
            <Input
              label="Password"
              placeholder="Enter your password"
              value={credentials.password}
              onChangeText={password =>
                setCredentials(prev => ({ ...prev, password }))
              }
              error={errors.password}
              secureTextEntry
              autoCapitalize="none"
            />

            {/* Sign In Button */}
            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading || isGoogleLoading}
              variant="primary"
              size="medium"
              fullWidth
              style={{ marginTop: 16 }}
            />

            {/* Forgot Password Link */}
            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={{
                alignItems: 'center',
                marginTop: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.text.secondary,
                  textAlign: 'center',
                }}
              >
                Forgot Password?{' '}
                <Text
                  style={{
                    color: theme.colors.primary,
                    fontWeight: '600',
                  }}
                >
                  Reset it
                </Text>
              </Text>
            </TouchableOpacity>

            {/* Create Account Link */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              style={{
                alignItems: 'center',
                marginTop: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.text.secondary,
                }}
              >
                Don't have an account?{' '}
                <Text
                  style={{
                    color: theme.colors.primary,
                    fontWeight: '600',
                  }}
                >
                  Create one
                </Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </CurvedBackground>
  );
};
