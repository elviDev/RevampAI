import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { useNavigationState } from '@react-navigation/native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';
import { QuickActionsFAB } from '../components/common/QuickActionsFAB';

// Import screens
import { ActivityScreen } from '../screens/main/ActivityScreen';
import { TasksScreen } from '../screens/main/TasksScreen';
import { ProjectsScreen } from '../screens/main/ProjectsScreen';
import { AnalyticsScreen } from '../screens/main/AnalyticsScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import HomeScreen from '../screens/main/HomeScreen';

const Tab = createBottomTabNavigator();

interface TabIconProps {
  focused: boolean;
  color: string;
  size: number;
  name: string;
}

const AnimatedTabIcon: React.FC<TabIconProps> = ({ focused, name }) => {
  const { theme } = useTheme();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(focused ? 1.1 : 1, { damping: 15 }) },
    ],
  }));

  const getIcon = () => {
    const iconSize = 24;
    const color = focused ? theme.colors.primary : theme.colors.text.secondary;
    
    switch (name) {
      case 'Home':
        return <Feather name="home" size={iconSize} color={color} />;
      case 'Projects':
        return <MaterialIcon name="work" size={iconSize} color={color} />;
      case 'Tasks':
        return <Feather name="check-square" size={iconSize} color={color} />;
      case 'Activity':
        return <MaterialCommunityIcon name="timeline" size={iconSize} color={color} />;
      case 'Analytics':
        return <MaterialCommunityIcon name="chart-line" size={iconSize} color={color} />;
      case 'Channels':
        return <Feather name="message-circle" size={iconSize} color={color} />;
      case 'Profile':
        return <Feather name="user" size={iconSize} color={color} />;
      default:
        return <Feather name="star" size={iconSize} color={color} />;
    }
  };

  return (
    <View style={{ 
      alignItems: 'center', 
      justifyContent: 'center',
      minWidth: 60,
      paddingVertical: 8,
    }}>
      {focused ? (
        <LinearGradient
          colors={theme.colors.gradients.primary}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Animated.View style={animatedStyle}>
            {React.cloneElement(getIcon() as React.ReactElement<any>, {
              color: theme.colors.text.onPrimary,
            })}
          </Animated.View>
        </LinearGradient>
      ) : (
        <Animated.View 
          style={[
            animatedStyle,
            {
              width: 48,
              height: 48,
              borderRadius: 24,
              alignItems: 'center',
              justifyContent: 'center',
            }
          ]}
        >
          {getIcon()}
        </Animated.View>
      )}
      
      <Text
        numberOfLines={1}
        style={{
          fontSize: 11,
          fontWeight: focused ? '600' : '500',
          color: focused ? theme.colors.primary : theme.colors.text.secondary,
          textAlign: 'center',
          marginTop: 4,
          textTransform: 'capitalize',
        }}
      >
        {name}
      </Text>
    </View>
  );
};

export const TabNavigator: React.FC = () => {
  const { theme } = useTheme();
  
  // Get current route name from navigation state
  const routeName = useNavigationState(state => {
    if (!state) return 'Home';
    const route = state.routes[state.index];
    return route?.name || 'Home';
  });

  // Screens where FAB should be shown
  const fabScreens = ['Projects', 'Tasks'];
  const shouldShowFAB = fabScreens.includes(routeName);

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          height: 85,
          paddingBottom: 8,
          paddingTop: 8,
          paddingHorizontal: 8,
          shadowColor: theme.colors.shadows.neutral,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 12,
        },
        tabBarItemStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 2,
        },
        tabBarIcon: ({ focused, color, size }) => (
          <AnimatedTabIcon
            focused={focused}
            color={color}
            size={size}
            name={route.name}
          />
        ),
      })}
    >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Projects" component={ProjectsScreen} />
        <Tab.Screen name="Tasks" component={TasksScreen} />
        <Tab.Screen name="Activity" component={ActivityScreen} />
        <Tab.Screen name="Analytics" component={AnalyticsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
      
      {/* Quick Actions FAB - only show on specific screens */}
      {shouldShowFAB && <QuickActionsFAB />}
    </View>
  );
};
