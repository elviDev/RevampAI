import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { permissionService, PermissionStatus } from '../../services/permissionService';
import { notificationService } from '../../services/notificationService';

interface PermissionManagerProps {
  children: React.ReactNode;
  onPermissionsReady?: (allGranted: boolean) => void;
}

interface PermissionItem {
  type: 'camera' | 'microphone' | 'storage' | 'media_library';
  title: string;
  description: string;
  icon: string;
  required: boolean;
  status?: PermissionStatus;
}

const PERMISSIONS: PermissionItem[] = [
  {
    type: 'microphone',
    title: 'Microphone',
    description: 'Record voice commands and messages',
    icon: '🎤',
    required: true,
  },
  {
    type: 'camera',
    title: 'Camera',
    description: 'Take photos for tasks and messages',
    icon: '📸',
    required: false,
  },
  {
    type: 'media_library',
    title: 'Photo Library',
    description: 'Select images from your gallery',
    icon: '🖼️',
    required: false,
  },
  {
    type: 'storage',
    title: 'Storage',
    description: 'Access and save documents',
    icon: '📁',
    required: false,
  },
];

export const PermissionManager: React.FC<PermissionManagerProps> = ({
  children,
  onPermissionsReady,
}) => {
  const [showPermissionScreen, setShowPermissionScreen] = useState(false);
  const [permissions, setPermissions] = useState<PermissionItem[]>(PERMISSIONS);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);

  useEffect(() => {
    initializePermissions();
  }, []);

  const initializePermissions = async () => {
    try {
      setIsInitializing(true);
      
      // Check all permission statuses
      const permissionStatuses = await Promise.all(
        PERMISSIONS.map(async (permission) => {
          const status = await permissionService.checkPermissionStatus(permission.type);
          return { ...permission, status };
        })
      );

      setPermissions(permissionStatuses);

      // Check if all required permissions are granted
      const requiredPermissions = permissionStatuses.filter(p => p.required);
      const allRequiredGranted = requiredPermissions.every(p => p.status?.granted);

      // Show permission screen if required permissions are missing
      if (!allRequiredGranted) {
        setShowPermissionScreen(true);
      } else {
        // Initialize notifications if permissions are ready
        await initializeNotifications();
        onPermissionsReady?.(true);
      }
    } catch (error) {
      console.error('Failed to initialize permissions:', error);
      onPermissionsReady?.(false);
    } finally {
      setIsInitializing(false);
    }
  };

  const initializeNotifications = async () => {
    try {
      await notificationService.initialize();
    } catch (error) {
      console.warn('Failed to initialize notifications:', error);
    }
  };

  const requestPermission = async (permissionItem: PermissionItem) => {
    try {
      let status: PermissionStatus;

      switch (permissionItem.type) {
        case 'microphone':
          status = await permissionService.requestMicrophonePermission();
          break;
        case 'camera':
          status = await permissionService.requestCameraPermission();
          break;
        case 'media_library':
          status = await permissionService.requestMediaLibraryPermission();
          break;
        case 'storage':
          status = await permissionService.requestStoragePermission();
          break;
        default:
          return;
      }

      // Update permission status
      setPermissions(prev =>
        prev.map(p =>
          p.type === permissionItem.type ? { ...p, status } : p
        )
      );

      if (!status.granted && !status.canAskAgain) {
        Alert.alert(
          'Permission Required',
          `${permissionItem.description} requires permission. Please enable it in Settings.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => permissionService.showSettingsDialog({
              type: permissionItem.type,
              title: permissionItem.title,
              message: permissionItem.description,
              required: permissionItem.required
            }) }
          ]
        );
      }
    } catch (error) {
      console.error(`Failed to request ${permissionItem.type} permission:`, error);
    }
  };

  const requestAllPermissions = async () => {
    setIsRequestingPermissions(true);
    
    try {
      for (const permission of permissions) {
        if (!permission.status?.granted) {
          await requestPermission(permission);
        }
      }
    } catch (error) {
      console.error('Failed to request all permissions:', error);
    } finally {
      setIsRequestingPermissions(false);
    }
  };

  const continueWithCurrentPermissions = async () => {
    const requiredPermissions = permissions.filter(p => p.required);
    const allRequiredGranted = requiredPermissions.every(p => p.status?.granted);

    if (!allRequiredGranted) {
      Alert.alert(
        'Required Permissions Missing',
        'Some required permissions are missing. The app may not work correctly.',
        [
          { text: 'Grant Permissions', onPress: requestAllPermissions },
          { 
            text: 'Continue Anyway', 
            style: 'destructive',
            onPress: () => {
              setShowPermissionScreen(false);
              onPermissionsReady?.(false);
            }
          }
        ]
      );
      return;
    }

    setShowPermissionScreen(false);
    await initializeNotifications();
    onPermissionsReady?.(true);
  };

  const renderPermissionItem = (permission: PermissionItem) => {
    const isGranted = permission.status?.granted || false;
    const statusColor = isGranted ? 'text-green-600' : permission.required ? 'text-red-600' : 'text-yellow-600';
    const statusText = isGranted ? 'Granted' : permission.required ? 'Required' : 'Optional';

    return (
      <View key={permission.type} className="bg-white rounded-xl p-4 mb-3 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Text className="text-3xl mr-3">{permission.icon}</Text>
            <View className="flex-1">
              <Text className="text-gray-900 font-semibold text-base mb-1">
                {permission.title}
              </Text>
              <Text className="text-gray-500 text-sm">
                {permission.description}
              </Text>
            </View>
          </View>
          
          <View className="items-end">
            <Text className={`text-sm font-medium mb-2 ${statusColor}`}>
              {statusText}
            </Text>
            {!isGranted && (
              <TouchableOpacity
                onPress={() => requestPermission(permission)}
                className={`px-3 py-2 rounded-lg ${
                  permission.required ? 'bg-red-500' : 'bg-blue-500'
                }`}
                disabled={isRequestingPermissions}
              >
                <Text className="text-white text-sm font-medium">
                  {permission.status?.canAskAgain === false ? 'Settings' : 'Grant'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (isInitializing) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-2xl mb-2">🔐</Text>
        <Text className="text-gray-600 font-medium">Checking permissions...</Text>
      </View>
    );
  }

  if (showPermissionScreen) {
    return (
      <Modal
        visible={true}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {}}
      >
        <View className="flex-1 bg-gray-50">
          <View className="flex-1 p-6 pt-16">
            <View className="items-center mb-8">
              <Text className="text-4xl mb-4">🔐</Text>
              <Text className="text-gray-900 text-2xl font-bold mb-2 text-center">
                Permissions Setup
              </Text>
              <Text className="text-gray-500 text-center text-base">
                Grant permissions to enable all app features
              </Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {permissions.map(renderPermissionItem)}
            </ScrollView>

            <View className="pt-4">
              <TouchableOpacity
                onPress={requestAllPermissions}
                className="bg-blue-500 p-4 rounded-xl mb-3"
                disabled={isRequestingPermissions}
              >
                <Text className="text-white font-semibold text-center text-base">
                  {isRequestingPermissions ? 'Requesting Permissions...' : 'Grant All Permissions'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={continueWithCurrentPermissions}
                className="bg-gray-200 p-4 rounded-xl"
                disabled={isRequestingPermissions}
              >
                <Text className="text-gray-900 font-semibold text-center text-base">
                  Continue
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return <>{children}</>;
};