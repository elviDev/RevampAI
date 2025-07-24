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
} from 'react-native-reanimated';
import { CurvedBackground } from '../../components/common/CurvedBackground/CurvedBackground';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Botton';
import { Colors } from '../../utils/colors';
import type { RegisterCredentials } from '../../types/auth';

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<RegisterCredentials>>({});
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
                paddingTop: 80,
              },
              animatedStyle,
            ]}
          >
            <View style={{ marginBottom: 40 }}>
              {/* Full Name Input */}
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={credentials.fullName}
                onChangeText={(fullName) =>
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

              {/* Confirm Password Input */}
              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={credentials.confirmPassword}
                onChangeText={(confirmPassword) =>
                  setCredentials(prev => ({ ...prev, confirmPassword }))
                }
                error={errors.confirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              {/* Register Button */}
              <Button
                title="Register"
                onPress={handleRegister}
                loading={isLoading}
                style={{ marginBottom: 16 }}
              />

              {/* Sign In Link */}
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                style={{ alignItems: 'center', marginTop: 24 }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: Colors.text.secondary,
                  }}
                >
                  Already have an account?{' '}
                  <Text style={{ color: Colors.primary, fontWeight: '600' }}>
                    Sign In
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