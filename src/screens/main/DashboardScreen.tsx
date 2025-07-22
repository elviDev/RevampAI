import React, { useEffect } from 'react'
import { View, Text, TouchableOpacity, TextInput, Image } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
} from 'react-native-reanimated'
import Feather from 'react-native-vector-icons/Feather'

const DashboardScreen = () => {
  // Animation values
  const topIconsOpacity = useSharedValue(0);
  const topIconsTranslateY = useSharedValue(-50);
  const greetingOpacity = useSharedValue(0);
  const greetingScale = useSharedValue(0.8);
  const button1Opacity = useSharedValue(0);
  const button1TranslateX = useSharedValue(-100);
  const button2Opacity = useSharedValue(0);
  const button2TranslateX = useSharedValue(100);
  const button3Opacity = useSharedValue(0);
  const button3TranslateY = useSharedValue(100);
  const promptOpacity = useSharedValue(0);
  const promptScale = useSharedValue(0.9);
  const promptFloat = useSharedValue(0);

  // Trigger animations on mount
  useEffect(() => {
    // Top icons animation
    topIconsOpacity.value = withTiming(1, { duration: 800 });
    topIconsTranslateY.value = withSpring(0, { damping: 15 });

    // Greeting animation with delay
    greetingOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    greetingScale.value = withDelay(300, withSpring(1, { damping: 12 }));

    // Action buttons staggered animation
    button1Opacity.value = withDelay(600, withTiming(1, { duration: 500 }));
    button1TranslateX.value = withDelay(600, withSpring(0, { damping: 15 }));

    button2Opacity.value = withDelay(750, withTiming(1, { duration: 500 }));
    button2TranslateX.value = withDelay(750, withSpring(0, { damping: 15 }));

    button3Opacity.value = withDelay(900, withTiming(1, { duration: 500 }));
    button3TranslateY.value = withDelay(900, withSpring(0, { damping: 15 }));

    // Prompt animation with floating effect
    promptOpacity.value = withDelay(1200, withTiming(1, { duration: 600 }));
    promptScale.value = withDelay(1200, withSpring(1, { damping: 12 }));
    
    // Continuous floating animation
    const startFloating = () => {
      promptFloat.value = withSequence(
        withTiming(-3, { duration: 2000 }),
        withTiming(3, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      );
    };
    
    setTimeout(() => {
      startFloating();
      // Repeat floating animation
      setInterval(startFloating, 6000);
    }, 1800);
  }, []);

  // Animated styles
  const topIconsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: topIconsOpacity.value,
    transform: [{ translateY: topIconsTranslateY.value }],
  }));

  const greetingAnimatedStyle = useAnimatedStyle(() => ({
    opacity: greetingOpacity.value,
    transform: [{ scale: greetingScale.value }],
  }));

  const button1AnimatedStyle = useAnimatedStyle(() => ({
    opacity: button1Opacity.value,
    transform: [{ translateX: button1TranslateX.value }],
  }));

  const button2AnimatedStyle = useAnimatedStyle(() => ({
    opacity: button2Opacity.value,
    transform: [{ translateX: button2TranslateX.value }],
  }));

  const button3AnimatedStyle = useAnimatedStyle(() => ({
    opacity: button3Opacity.value,
    transform: [{ translateY: button3TranslateY.value }],
  }));

  const promptAnimatedStyle = useAnimatedStyle(() => ({
    opacity: promptOpacity.value,
    transform: [
      { scale: promptScale.value },
      { translateY: promptFloat.value }
    ],
  }));

  // Interactive button press animations
  const createButtonPressAnimation = () => {
    'worklet';
    return withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 15 })
    );
  };

  return (
    <View className="flex-1 bg-white justify-center px-6 pt-4">
      {/* Top Icons */}
      <Animated.View 
        className="absolute top-12 right-6 flex-row items-center space-x-4"
        style={topIconsAnimatedStyle}
      >
        {/* Refresh Icon */}
        <TouchableOpacity>
           <Image 
            source={require('../../assets/icons/history.png')}
            style={{ width: 50, height: 50, marginRight: 8 }}
            resizeMode="contain"
            />
        </TouchableOpacity>
        
        {/* User Avatar with Status */}
        <View className="relative">
          <View className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center">
            <Feather name="user" size={24} color="#666" />
          </View>
          <View className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white" />
        </View>
      </Animated.View>

      {/* Greeting */}
      <Animated.View 
        className='space-y-8 mb-4'
        style={greetingAnimatedStyle}
      >
         <Text className="text-4xl font-bold text-purple-700 mb-2">Hello Javier!</Text>
      <Text className="text-gray-400 tracking-wider mb-6 text-xl">
        Give any command from creating a document to scheduling a meeting.
      </Text>
      </Animated.View>

      {/* Action Buttons */}
      <View className="flex-row flex-wrap gap-8  mb-[3rem]">
        <Animated.View style={[{ width: '45%' }, button1AnimatedStyle]}>
          <TouchableOpacity 
            className="border border-purple-400 rounded-xl p-6 h-[7rem] items-center justify-center"
            onPress={() => {
              // Add haptic feedback here if needed
              console.log('Create Channel pressed');
            }}
          >
            <Text className="text-center text-gray-700 font-medium">Create a Channel</Text>
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.View style={[{ width: '45%' }, button2AnimatedStyle]}>
          <TouchableOpacity 
            className="border border-purple-400 rounded-xl p-6 h-[7rem] items-center justify-center"
            onPress={() => {
              console.log('Schedule Meeting pressed');
            }}
          >
            <Text className="text-center text-gray-700 font-medium">Schedule a Meeting</Text>
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.View style={[{ width: '45%' }, button3AnimatedStyle]}>
          <TouchableOpacity 
            className="border border-purple-400 rounded-xl p-6 h-[7rem] items-center justify-center"
            onPress={() => {
              console.log('Assign Task pressed');
            }}
          >
            <Text className="text-center text-gray-700 font-medium">Assign a Task</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Prompt */}
      <Animated.View 
        className="rounded-full border border-purple-400 bg-gray-100 px-4 py-2 flex-row items-center"
        style={promptAnimatedStyle}
      >
        <TextInput placeholder="Enter a prompt here" className="flex-1 text-gray-700" />
        <Feather name="mic" size={20} color="#aaa" />
      </Animated.View>
    </View>
  )
}

export default DashboardScreen