import React, { useEffect } from 'react';
import { View, Text, Dimensions, StatusBar } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  interpolate,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { CurvedBackground } from './CurvedBackground/CurvedBackground';
import { Logo } from './Logo';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onAnimationComplete: () => void;
}


export const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationComplete }) => {
  const { theme } = useTheme();
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const loadingProgress = useSharedValue(0);

  useEffect(() => {
    StatusBar.setHidden(true);

    // Logo animation sequence
    logoOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    logoScale.value = withDelay(
      300,
      withSequence(
        withSpring(1.2, { damping: 10, stiffness: 100 }),
        withSpring(1, { damping: 15, stiffness: 150 })
      )
    );

    // Text animation
    textOpacity.value = withDelay(900, withTiming(1, { duration: 800 }));

    // Loading progress
    loadingProgress.value = withDelay(
      1200,
      withTiming(1, { 
        duration: 1500, 
        easing: Easing.out(Easing.cubic)
      }, () => {
        runOnJS(onAnimationComplete)();
      })
    );

    return () => {
      StatusBar.setHidden(false);
    };
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [
      { 
        translateY: interpolate(
          textOpacity.value,
          [0, 1],
          [20, 0]
        ) 
      }
    ],
  }));

  const loadingAnimatedStyle = useAnimatedStyle(() => ({
    width: interpolate(loadingProgress.value, [0, 1], [0, width * 0.6]),
  }));

  return (
    <CurvedBackground customColor={theme.colors.primary} opacity={0.6}>

      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
      }}>
        {/* Logo */}
        <Animated.View style={[logoAnimatedStyle, { alignItems: 'center', marginBottom: 40 }]}>
          <Logo
            size={120}
            variant="primary"
            enableRotation={true}
            rotationDuration={3000}
            imageSize={80}
          />
        </Animated.View>

        {/* App name and tagline */}
        <Animated.View style={[textAnimatedStyle, { alignItems: 'center' }]}>
          <Text style={{
            fontSize: 36,
            fontWeight: '800',
            color: theme.colors.text.primary,
            marginBottom: 8,
            textAlign: 'center',
            letterSpacing: -1,
          }}>
            Javier AI
          </Text>
          <Text style={{
            fontSize: 16,
            fontWeight: '500',
            color: theme.colors.text.secondary,
            textAlign: 'center',
            lineHeight: 24,
            marginBottom: 60,
          }}>
            Your AI-Powered Project Manager
          </Text>
        </Animated.View>

        {/* Loading indicator */}
        <View style={{
          position: 'absolute',
          bottom: 100,
          width: width * 0.6,
          height: 4,
          backgroundColor: theme.colors.border + '40',
          borderRadius: 2,
          overflow: 'hidden',
        }}>
          <Animated.View
            style={[
              {
                height: '100%',
                backgroundColor: theme.colors.primary,
                borderRadius: 2,
              },
              loadingAnimatedStyle
            ]}
          />
        </View>

        {/* Loading text */}
        <Animated.View style={[textAnimatedStyle, { position: 'absolute', bottom: 60 }]}>
          <Text style={{
            fontSize: 14,
            fontWeight: '500',
            color: theme.colors.text.secondary,
            textAlign: 'center',
          }}>
            Initializing AI capabilities...
          </Text>
        </Animated.View>
      </View>
    </CurvedBackground>
  );
};