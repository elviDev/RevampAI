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
} from 'react-native-reanimated';
import { CurvedBackground } from '../../components/common/CurvedBackground/CurvedBackground';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Botton';
import { Colors } from '../../utils/colors';
import { loginSuccess, loginFailure } from '../../store/slices/authSlice';
import type { LoginCredentials } from '../../types/auth';
import type { AppDispatch } from '../../store/store';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginCredentials>>({});
  const [isLoading, setIsLoading] = useState(false);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
    translateY.value = withSpring(0, { damping: 15 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
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
      dispatch(loginSuccess({ 
        id: '1', 
        email: credentials.email, 
        fullName: 'Demo User',
        role: 'member' as const
      }));
    } catch (error) {
      console.error('Login error:', error);
      dispatch(loginFailure('Login failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      // Simulate Google sign in
      await new Promise(resolve => setTimeout(resolve, 1500));
      navigation.replace('Dashboard');
    } catch (error) {
      console.error('Google sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CurvedBackground customColor={Colors.primary} opacity={0.3}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              {
                flex: 1,
                paddingHorizontal: 24,
                justifyContent: 'center',
                paddingTop: 120,
              },
              animatedStyle,
            ]}
          >
            <View style={{ marginBottom: 40 }}>
              {/* Email Input */}
              <Input
                label="Email"
                placeholder="Enter your email"
                value={credentials.email}
                onChangeText={(email) =>
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
                onChangeText={(password) =>
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
                style={{ marginBottom: 16 }}
              />

              {/* Sign In with Google */}
              <Button
                title="Sign In with Google"
                onPress={handleGoogleSignIn}
                variant="outline"
                style={{
                  backgroundColor: Colors.surface,
                  borderColor: Colors.gray[300],
                }}
                textStyle={{ color: Colors.text.primary }}
                loading={isLoading}
              />

              {/* Create Account Link */}
              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                style={{ alignItems: 'center', marginTop: 24 }}
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
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </CurvedBackground>
  );
};