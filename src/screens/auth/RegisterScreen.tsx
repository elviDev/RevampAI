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
import type { RegisterCredentials } from '../../types/auth';

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<RegisterCredentials>>({});
  const [isLoading, setIsLoading] = useState(false);

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
    const newErrors: Partial<RegisterCredentials> = {};

    if (!credentials.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

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

    if (!credentials.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (credentials.password !== credentials.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Navigate to welcome screen on success
      navigation.replace('Welcome');
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
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
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <Animated.View style={[logoAnimatedStyle, { alignItems: 'center' }]}>
            <Logo
              noBackground
              size={120}
              variant="primary"
              borderWidth={3}
              enableRotation={true}
              rotationDuration={4500}
              imageSize={180}
            />
          </Animated.View>

          {/* Header Text */}
          <Animated.View
            style={[{ alignItems: 'center', marginTop: 10 }, textAnimatedStyle]}
          >
            <Text
              style={{
                fontSize: 32,
                color: theme.colors.text.primary,
                fontWeight: '700',
                marginBottom: 16,
                textAlign: 'center',
              }}
            >
              Create Account
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View
            style={[
              { width: '100%', paddingHorizontal: 20, marginTop: 20 },
              formAnimatedStyle,
            ]}
          >
            {/* Full Name Input */}
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={credentials.fullName}
              onChangeText={fullName =>
                setCredentials(prev => ({ ...prev, fullName }))
              }
              error={errors.fullName}
              autoCapitalize="words"
              autoCorrect={false}
            />

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

            {/* Confirm Password Input */}
            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={credentials.confirmPassword}
              onChangeText={confirmPassword =>
                setCredentials(prev => ({ ...prev, confirmPassword }))
              }
              error={errors.confirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            {/* Register Button */}
            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              variant="primary"
              size="medium"
              fullWidth
              style={{ marginTop: 16 }}
            />

            {/* Sign In Link */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={{ alignItems: 'center', marginTop: 16 }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.text.secondary,
                }}
              >
                Already have an account?{' '}
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
