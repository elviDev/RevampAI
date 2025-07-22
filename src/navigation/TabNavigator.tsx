import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import DashboardScreen  from '../screens/main/DashboardScreen';
import { ActivityScreen } from '../screens/main/ActivityScreen';
import { TasksScreen } from '../screens/main/TasksScreen';
import ChannelsScreen  from '../screens/main/ChannelsScreen';

const Tab = createBottomTabNavigator();

interface TabIconProps {
  focused: boolean;
  color: string;
  size: number;
  name: string;
}

const TabIcon: React.FC<TabIconProps> = ({ focused, name }) => {
  const getIcon = () => {
    switch (name) {
      case 'Home':
        return '🏠';
      case 'Activity':
        return '🔔';
      case 'Tasks':
        return '📋';
      case 'Channels':
        return '💬';
      default:
        return '⭐';
    }
  };

  return (
    <View className="items-center justify-center">
      <Text className={`text-2xl mb-1`}>
        {getIcon()}
      </Text>
      <Text 
        className={`text-xs font-medium ${
          focused ? 'text-blue-600' : 'text-gray-400'
        }`}
      >
        {name}
      </Text>
    </View>
  );
};

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          height: 90,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarIcon: ({ focused, color, size }) => (
          <TabIcon
            focused={focused}
            color={color}
            size={size}
            name={route.name}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Channels" component={ChannelsScreen} />
    </Tab.Navigator>
  );
};