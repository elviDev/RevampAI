import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native';
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

interface VerificationScreenProps {
  navigation: any;
  route: {
    params?: {
      email?: string;
      phone?: string;
      type?: 'email' | 'phone';
    };
  };
}

const CODE_LENGTH = 6;

export const VerificationScreen: React.FC<VerificationScreenProps> = ({
  navigation,
  route,
}) => {
  const { theme } = useTheme();
  const { email, phone, type = 'email' } = route.params || {};
  const contactInfo = email || phone || '';

  const [code, setCode] = useState(Array(CODE_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  const logoScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const formOpacity = useSharedValue(0);
  const shakeX = useSharedValue(0);

  useEffect(() => {
    // Animate logo
    logoScale.value = withSpring(1, { damping: 15 });

    // Animate text with delay
    textOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));

    // Animate form with delay
    formOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateX: shakeX.value }],
  }));

  const handleCodeChange = (value: string, index: number) => {
    if (value.length > 1) return; // Prevent pasting multiple characters

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (
      value &&
      index === CODE_LENGTH - 1 &&
      newCode.every(digit => digit !== '')
    ) {
      handleVerifyCode(newCode.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('');

    if (codeToVerify.length !== CODE_LENGTH) {
      setError('Please enter the complete verification code');
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Navigate to success screen or main app
      navigation.navigate('Login'); // or wherever appropriate
    } catch (error) {
      console.error('Verification error:', error);
      setError('Invalid verification code. Please try again.');
      setCode(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();

      // Shake animation for error
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend || isResending) return;

    try {
      setIsResending(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setCanResend(false);
      setCountdown(30);
      setCode(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();

      // Restart countdown
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Resend error:', error);
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const formatContactInfo = (info: string) => {
    if (type === 'email') {
      return info;
    }
    // Format phone number
    return info.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
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
              variant="surface"
              borderWidth={3}
              enableRotation={true}
              rotationDuration={3500}
              imageSize={180}
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
              {type === 'email' ? 'Email Verification' : 'Phone Verification'}
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
              Enter Code
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
              We sent a verification{'\n'}
              code to{'\n'}
              <Text
                style={{
                  fontWeight: '600',
                  color: theme.colors.primary,
                }}
              >
                {formatContactInfo(contactInfo)}
              </Text>
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View
            style={[
              { width: '100%', paddingHorizontal: 20, marginTop: 40 },
              formAnimatedStyle,
            ]}
          >
            {/* Code Input Fields */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 24,
                paddingHorizontal: 8,
              }}
            >
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => {
                    inputRefs.current[index] = ref;
                  }}
                  style={{
                    width: 45,
                    height: 55,
                    borderRadius: 12,
                    backgroundColor: theme.colors.surface,
                    borderWidth: 2,
                    borderColor: digit
                      ? theme.colors.primary
                      : theme.colors.border,
                    textAlign: 'center',
                    fontSize: 20,
                    fontWeight: '700',
                    color: theme.colors.text.primary,
                    shadowColor: theme.colors.shadows.neutral,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                  value={digit}
                  onChangeText={value => handleCodeChange(value, index)}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(nativeEvent.key, index)
                  }
                  keyboardType="numeric"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            {error ? (
              <Text
                style={{
                  color: theme.colors.error,
                  fontSize: 14,
                  textAlign: 'center',
                  marginBottom: 16,
                  fontWeight: '500',
                }}
              >
                {error}
              </Text>
            ) : null}

            <Button
              title="Verify Code"
              onPress={() => handleVerifyCode()}
              loading={isLoading}
              disabled={isLoading || code.join('').length !== CODE_LENGTH}
              variant="primary"
              size="medium"
              fullWidth
              style={{ marginBottom: 16 }}
            />

            {/* Resend Code */}
            <View style={{ alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.text.secondary,
                  marginBottom: 12,
                }}
              >
                Didn't receive the code?
              </Text>

              <TouchableOpacity
                onPress={handleResendCode}
                disabled={!canResend || isResending}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  backgroundColor: canResend
                    ? theme.colors.surface + '40'
                    : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: canResend
                      ? theme.colors.primary
                      : theme.colors.text.secondary,
                    fontWeight: '600',
                    textAlign: 'center',
                  }}
                >
                  {isResending
                    ? 'Sending...'
                    : canResend
                      ? 'Resend Code'
                      : `Resend in ${countdown}s`}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{
                  marginTop: 24,
                  paddingVertical: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.colors.text.secondary,
                    textAlign: 'center',
                  }}
                >
                  Change {type === 'email' ? 'email' : 'phone number'}?{' '}
                  <Text
                    style={{
                      color: theme.colors.primary,
                      fontWeight: '600',
                    }}
                  >
                    Go Back
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
