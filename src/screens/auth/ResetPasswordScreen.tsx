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

interface ResetPasswordScreenProps {
  navigation: any;
  route: {
    params?: {
      token?: string;
      email?: string;
    };
  };
}

interface PasswordForm {
  newPassword: string;
  confirmPassword: string;
}

interface PasswordErrors {
  newPassword?: string;
  confirmPassword?: string;
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({
  navigation,
  route,
}) => {
  const { theme } = useTheme();
  const { token, email } = route.params || {};

  const [form, setForm] = useState<PasswordForm>({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

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

  const validatePassword = (password: string): string | undefined => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'Password must contain uppercase, lowercase, and number';
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: PasswordErrors = {};

    const passwordError = validatePassword(form.newPassword);
    if (passwordError) {
      newErrors.newPassword = passwordError;
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      setResetSuccess(true);
    } catch (error) {
      console.error('Reset password error:', error);
      setErrors({ newPassword: 'Failed to reset password. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  const updateForm = (field: keyof PasswordForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (resetSuccess) {
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
              Password Reset Complete
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
              All Set!
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
              Your password has been{'\n'}
              successfully reset. You can{'\n'}
              now sign in with your{'\n'}
              new password.
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              { width: '100%', paddingHorizontal: 20, marginTop: 40 },
              formAnimatedStyle,
            ]}
          >
            <Button
              title="Continue to Login"
              onPress={handleBackToLogin}
              variant="primary"
              size="medium"
              fullWidth
            />
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
              rotationDuration={5000}
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
              Password Security
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
              Reset Password
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
              Choose a strong password{'\n'}
              to keep your account{'\n'}
              secure.
              {email && (
                <Text
                  style={{
                    fontSize: 16,
                    color: theme.colors.primary,
                    fontWeight: '600',
                  }}
                >
                  {'\n\n'}for {email}
                </Text>
              )}
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View
            style={[
              { width: '100%', paddingHorizontal: 20, marginTop: 40 },
              formAnimatedStyle,
            ]}
          >
            {/* New Password Input */}
            <Input
              label="New Password"
              placeholder="Enter your new password"
              value={form.newPassword}
              onChangeText={text => updateForm('newPassword', text)}
              error={errors.newPassword}
              secureTextEntry
              autoCapitalize="none"
              autoFocus
            />

            {/* Password Requirements */}
            {form.newPassword && (
              <View
                style={{
                  marginBottom: 16,
                  paddingHorizontal: 4,
                  backgroundColor: theme.colors.surface + '20',
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.colors.text.secondary,
                    marginBottom: 8,
                    fontWeight: '500',
                  }}
                >
                  Password Requirements:
                </Text>
                {[
                  {
                    text: 'At least 8 characters',
                    met: form.newPassword.length >= 8,
                  },
                  {
                    text: 'Uppercase letter (A-Z)',
                    met: /[A-Z]/.test(form.newPassword),
                  },
                  {
                    text: 'Lowercase letter (a-z)',
                    met: /[a-z]/.test(form.newPassword),
                  },
                  { text: 'Number (0-9)', met: /\d/.test(form.newPassword) },
                ].map((req, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: req.met
                          ? theme.colors.success
                          : theme.colors.text.secondary,
                        marginRight: 8,
                        fontWeight: '600',
                      }}
                    >
                      {req.met ? '✓' : '○'}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: req.met
                          ? theme.colors.success
                          : theme.colors.text.secondary,
                      }}
                    >
                      {req.text}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Confirm Password Input */}
            <Input
              label="Confirm Password"
              placeholder="Confirm your new password"
              value={form.confirmPassword}
              onChangeText={text => updateForm('confirmPassword', text)}
              error={errors.confirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <Button
              title="Reset Password"
              onPress={handleResetPassword}
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
