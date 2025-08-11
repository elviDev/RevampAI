import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp, FadeInRight } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../contexts/ThemeContext';
import { useQuickActions } from '../../contexts/QuickActionsContext';
import { NavigationService } from '../../services/NavigationService';

interface ProfileStat {
  label: string;
  value: string;
  icon: string;
  color: string;
}

interface SettingItem {
  title: string;
  description?: string;
  icon: string;
  type: 'toggle' | 'navigation' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  color?: string;
}

const PROFILE_STATS: ProfileStat[] = [
  { label: 'Projects', value: '12', icon: 'folder', color: '#6366F1' },
  { label: 'Completed', value: '89', icon: 'check-circle', color: '#10B981' },
  { label: 'Team Size', value: '8', icon: 'users', color: '#F59E0B' },
  { label: 'Rating', value: '4.9', icon: 'star', color: '#EC4899' },
];

export const ProfileScreen: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { showNotification } = useQuickActions();
  const insets = useSafeAreaInsets();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const settingsItems: SettingItem[] = [
    {
      title: 'Dark Mode',
      description: 'Toggle between light and dark themes',
      icon: 'moon',
      type: 'toggle',
      value: theme.isDark,
      onToggle: toggleTheme,
    },
    {
      title: 'Notifications',
      description: 'Receive push notifications',
      icon: 'bell',
      type: 'toggle',
      value: notificationsEnabled,
      onToggle: setNotificationsEnabled,
    },
    {
      title: 'Auto Sync',
      description: 'Automatically sync data',
      icon: 'refresh-cw',
      type: 'toggle',
      value: autoSyncEnabled,
      onToggle: setAutoSyncEnabled,
    },
    {
      title: 'Biometric Login',
      description: 'Use fingerprint or face ID',
      icon: 'lock',
      type: 'toggle',
      value: biometricEnabled,
      onToggle: setBiometricEnabled,
    },
    {
      title: 'Account Settings',
      description: 'Manage your account',
      icon: 'settings',
      type: 'navigation',
      onPress: () => showNotification('Account settings coming soon!', 'info'),
    },
    {
      title: 'Privacy Policy',
      icon: 'shield',
      type: 'navigation',
      onPress: () => showNotification('Privacy policy opened', 'info'),
    },
    {
      title: 'Help & Support',
      icon: 'help-circle',
      type: 'navigation',
      onPress: () => showNotification('Help & support center coming soon!', 'info'),
    },
    {
      title: 'View Analytics',
      icon: 'bar-chart-2',
      type: 'navigation',
      onPress: () => NavigationService.navigateToAnalytics(),
    },
    {
      title: 'My Tasks',
      icon: 'check-square',
      type: 'navigation',
      onPress: () => NavigationService.navigateToTasks(),
    },
    {
      title: 'Sign Out',
      icon: 'log-out',
      type: 'action',
      color: '#EF4444',
      onPress: () => showNotification('Sign out functionality coming soon!', 'info'),
    },
  ];

  const StatCard: React.FC<{ stat: ProfileStat; index: number }> = ({ stat, index }) => (
    <Animated.View
      entering={FadeInUp.delay(200 + index * 50)}
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: theme.colors.border,
        shadowColor: theme.colors.shadows.neutral,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: stat.color + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
      }}>
        <Icon name={stat.icon} size={20} color={stat.color} />
      </View>
      <Text style={{
        fontSize: 20,
        fontWeight: '800',
        color: theme.colors.text.primary,
        marginBottom: 2,
      }}>
        {stat.value}
      </Text>
      <Text style={{
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.text.secondary,
        textAlign: 'center',
      }}>
        {stat.label}
      </Text>
    </Animated.View>
  );

  const SettingRow: React.FC<{ item: SettingItem; index: number }> = ({ item, index }) => (
    <Animated.View
      entering={FadeInRight.delay(400 + index * 50)}
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
        shadowColor: theme.colors.shadows.neutral,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <TouchableOpacity
        onPress={item.onPress}
        disabled={item.type === 'toggle'}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: (item.color || theme.colors.primary) + '20',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 16,
        }}>
          <Icon 
            name={item.icon} 
            size={20} 
            color={item.color || theme.colors.primary} 
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: item.color || theme.colors.text.primary,
            marginBottom: 2,
          }}>
            {item.title}
          </Text>
          {item.description && (
            <Text style={{
              fontSize: 14,
              color: theme.colors.text.secondary,
            }}>
              {item.description}
            </Text>
          )}
        </View>

        {item.type === 'toggle' && (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ 
              false: theme.colors.border, 
              true: theme.colors.primary + '40' 
            }}
            thumbColor={item.value ? theme.colors.primary : theme.colors.text.secondary}
          />
        )}

        {item.type === 'navigation' && (
          <Icon name="chevron-right" size={20} color={theme.colors.text.secondary} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={{
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: insets.top,
    }}>
      {/* Header with Profile */}
      <Animated.View
        entering={FadeInDown.delay(50)}
        style={{
          paddingHorizontal: 24,
          paddingVertical: 20,
          alignItems: 'center',
        }}
      >
        {/* Profile Avatar */}
        <View style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          marginBottom: 16,
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 8,
        }}>
          <LinearGradient
            colors={theme.colors.gradients.primary}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 50,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{
              fontSize: 36,
              fontWeight: '800',
              color: theme.colors.text.onPrimary,
            }}>
              JD
            </Text>
          </LinearGradient>
        </View>

        <Text style={{
          fontSize: 24,
          fontWeight: '800',
          color: theme.colors.text.primary,
          marginBottom: 4,
        }}>
          John Doe
        </Text>
        
        <Text style={{
          fontSize: 16,
          color: theme.colors.text.secondary,
          marginBottom: 8,
        }}>
          Project Manager
        </Text>

        <View style={{
          backgroundColor: theme.colors.success + '20',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 8,
          marginBottom: 24,
        }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.success,
          }}>
            Premium Member
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={{
          flexDirection: 'row',
          width: '100%',
          marginHorizontal: -4,
        }}>
          {PROFILE_STATS.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </View>
      </Animated.View>

      {/* Settings */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 100,
        }}
      >
        <Animated.View
          entering={FadeInDown.delay(300)}
          style={{ marginBottom: 20 }}
        >
          <Text style={{
            fontSize: 20,
            fontWeight: '700',
            color: theme.colors.text.primary,
            marginBottom: 16,
          }}>
            Settings
          </Text>

          {settingsItems.map((item, index) => (
            <SettingRow key={item.title} item={item} index={index} />
          ))}
        </Animated.View>

        {/* App Info */}
        <Animated.View
          entering={FadeInUp.delay(800)}
          style={{
            alignItems: 'center',
            marginTop: 20,
          }}
        >
          <Text style={{
            fontSize: 14,
            color: theme.colors.text.secondary,
            marginBottom: 8,
          }}>
            Javier AI Assistant
          </Text>
          <Text style={{
            fontSize: 12,
            color: theme.colors.text.secondary,
          }}>
            Version 1.0.0 • Build 2024.08.10
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
};