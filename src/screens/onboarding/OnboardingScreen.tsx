import React from 'react';
import { View, Text, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

// TODO: Replace with your actual logo asset
const LOGO = require('@/assets/icons/logo.png');

const OnboardingScreen: React.FC = () => {
  return (
    <LinearGradient
      colors={['#3933C6', '#A05FFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    >
      {/* Company Logo */}
      <View style={{ alignItems: 'center' }}>
        <Image
          source={LOGO}
          style={{
            width: 180,
            height: 180,
            borderRadius: 32,
            marginBottom: 28,
          }}
          resizeMode="contain"
        />
        <Text
          style={{
            color: '#fff',
            fontSize: 36,
            fontWeight: 'bold',
            letterSpacing: 1,
            marginBottom: 10,
          }}
        >
          Javier
        </Text>
        <Text
          style={{
            color: '#E0E7FF',
            fontSize: 18,
            textAlign: 'center',
            maxWidth: 280,
          }}
        >
          AI-First Project Management
        </Text>
      </View>
    </LinearGradient>
  );
};

export default OnboardingScreen;
