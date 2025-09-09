import { Platform, Alert, Linking, PermissionsAndroid } from 'react-native';
import { PERMISSIONS, RESULTS, request, check, requestMultiple, Permission } from 'react-native-permissions';
import * as ImagePicker from 'expo-image-picker';

export interface PermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: 'undetermined' | 'denied' | 'granted' | 'blocked';
}

export interface PermissionRequest {
  type: 'camera' | 'microphone' | 'storage' | 'location' | 'notifications';
  title: string;
  message: string;
  required?: boolean;
}

/**
 * Centralized Permissions Service for Mobile Features
 * Handles all permission requests for camera, microphone, storage, etc.
 */
class PermissionService {
  private permissionCache = new Map<string, PermissionStatus>();
  
  constructor() {
    // Clear cache periodically
    setInterval(() => {
      this.permissionCache.clear();
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Request microphone permission for voice recording
   */
  async requestMicrophonePermission(): Promise<PermissionStatus> {
    const cacheKey = 'microphone';
    
    try {
      if (Platform.OS === 'android') {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs access to your microphone to record voice commands and messages.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        const status: PermissionStatus = {
          granted: result === PermissionsAndroid.RESULTS.GRANTED,
          canAskAgain: result !== PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
          status: result === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied'
        };

        this.permissionCache.set(cacheKey, status);
        return status;
      } else {
        // iOS - handled by react-native-voice library
        return {
          granted: true,
          canAskAgain: true,
          status: 'granted'
        };
      }
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      return {
        granted: false,
        canAskAgain: true,
        status: 'denied'
      };
    }
  }

  /**
   * Request camera permission for image capture
   */
  async requestCameraPermission(): Promise<PermissionStatus> {
    const cacheKey = 'camera';
    
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      const permissionStatus: PermissionStatus = {
        granted: status === 'granted',
        canAskAgain: status !== 'denied',
        status: status === 'granted' ? 'granted' : 'denied'
      };

      this.permissionCache.set(cacheKey, permissionStatus);
      return permissionStatus;
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return {
        granted: false,
        canAskAgain: true,
        status: 'denied'
      };
    }
  }

  /**
   * Request media library permission for image selection
   */
  async requestMediaLibraryPermission(): Promise<PermissionStatus> {
    const cacheKey = 'media_library';
    
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      const permissionStatus: PermissionStatus = {
        granted: status === 'granted',
        canAskAgain: status !== 'denied',
        status: status === 'granted' ? 'granted' : 'denied'
      };

      this.permissionCache.set(cacheKey, permissionStatus);
      return permissionStatus;
    } catch (error) {
      console.error('Error requesting media library permission:', error);
      return {
        granted: false,
        canAskAgain: true,
        status: 'denied'
      };
    }
  }

  /**
   * Request storage permission for file access (Android)
   */
  async requestStoragePermission(): Promise<PermissionStatus> {
    const cacheKey = 'storage';
    
    try {
      if (Platform.OS === 'android') {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'This app needs access to your storage to read and save files.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        const status: PermissionStatus = {
          granted: result === PermissionsAndroid.RESULTS.GRANTED,
          canAskAgain: result !== PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
          status: result === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied'
        };

        this.permissionCache.set(cacheKey, status);
        return status;
      } else {
        // iOS doesn't require explicit storage permission for document picker
        return {
          granted: true,
          canAskAgain: true,
          status: 'granted'
        };
      }
    } catch (error) {
      console.error('Error requesting storage permission:', error);
      return {
        granted: false,
        canAskAgain: true,
        status: 'denied'
      };
    }
  }

  /**
   * Check current permission status without requesting
   */
  async checkPermissionStatus(permission: 'camera' | 'microphone' | 'storage' | 'media_library'): Promise<PermissionStatus> {
    const cacheKey = permission;
    
    // Return cached result if available
    if (this.permissionCache.has(cacheKey)) {
      const cached = this.permissionCache.get(cacheKey)!;
      return cached;
    }

    try {
      switch (permission) {
        case 'microphone':
          if (Platform.OS === 'android') {
            const result = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
            return {
              granted: result,
              canAskAgain: true, // Can't determine without requesting
              status: result ? 'granted' : 'undetermined'
            };
          } else {
            return { granted: true, canAskAgain: true, status: 'granted' };
          }

        case 'camera':
          const cameraStatus = await ImagePicker.getCameraPermissionsAsync();
          return {
            granted: cameraStatus.granted,
            canAskAgain: cameraStatus.canAskAgain,
            status: cameraStatus.status === 'granted' ? 'granted' : cameraStatus.status === 'denied' ? 'denied' : 'undetermined'
          };

        case 'media_library':
          const libraryStatus = await ImagePicker.getMediaLibraryPermissionsAsync();
          return {
            granted: libraryStatus.granted,
            canAskAgain: libraryStatus.canAskAgain,
            status: libraryStatus.status === 'granted' ? 'granted' : libraryStatus.status === 'denied' ? 'denied' : 'undetermined'
          };

        case 'storage':
          if (Platform.OS === 'android') {
            const result = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
            return {
              granted: result,
              canAskAgain: true,
              status: result ? 'granted' : 'undetermined'
            };
          } else {
            return { granted: true, canAskAgain: true, status: 'granted' };
          }

        default:
          return { granted: false, canAskAgain: true, status: 'denied' };
      }
    } catch (error) {
      console.error(`Error checking ${permission} permission:`, error);
      return { granted: false, canAskAgain: true, status: 'denied' };
    }
  }

  /**
   * Request multiple permissions at once
   */
  async requestMultiplePermissions(permissions: ('camera' | 'microphone' | 'storage' | 'media_library')[]): Promise<Record<string, PermissionStatus>> {
    const results: Record<string, PermissionStatus> = {};
    
    for (const permission of permissions) {
      try {
        switch (permission) {
          case 'camera':
            results[permission] = await this.requestCameraPermission();
            break;
          case 'microphone':
            results[permission] = await this.requestMicrophonePermission();
            break;
          case 'storage':
            results[permission] = await this.requestStoragePermission();
            break;
          case 'media_library':
            results[permission] = await this.requestMediaLibraryPermission();
            break;
        }
      } catch (error) {
        console.error(`Error requesting ${permission} permission:`, error);
        results[permission] = { granted: false, canAskAgain: true, status: 'denied' };
      }
    }
    
    return results;
  }

  /**
   * Show permission rationale dialog
   */
  showPermissionRationale(permission: PermissionRequest): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        permission.title,
        permission.message,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Grant Permission',
            onPress: () => resolve(true),
          },
        ]
      );
    });
  }

  /**
   * Show settings dialog when permission is permanently denied
   */
  showSettingsDialog(permission: PermissionRequest): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        'Permission Required',
        `${permission.message}\n\nPlease enable this permission in your device settings to use this feature.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Open Settings',
            onPress: () => {
              Linking.openSettings();
              resolve(true);
            },
          },
        ]
      );
    });
  }

  /**
   * Handle permission request with proper fallbacks
   */
  async handlePermissionRequest(
    permissionType: 'camera' | 'microphone' | 'storage' | 'media_library',
    request: PermissionRequest
  ): Promise<PermissionStatus> {
    // Check current status
    const currentStatus = await this.checkPermissionStatus(permissionType);
    
    if (currentStatus.granted) {
      return currentStatus;
    }

    // If permission is blocked, show settings dialog
    if (currentStatus.status === 'blocked' || !currentStatus.canAskAgain) {
      const userWantsToOpenSettings = await this.showSettingsDialog(request);
      if (userWantsToOpenSettings) {
        // Return current status - user needs to manually enable in settings
        return currentStatus;
      } else {
        return currentStatus;
      }
    }

    // Show rationale if needed
    if (request.required) {
      const userAccepted = await this.showPermissionRationale(request);
      if (!userAccepted) {
        return { granted: false, canAskAgain: true, status: 'denied' };
      }
    }

    // Request permission
    switch (permissionType) {
      case 'camera':
        return await this.requestCameraPermission();
      case 'microphone':
        return await this.requestMicrophonePermission();
      case 'storage':
        return await this.requestStoragePermission();
      case 'media_library':
        return await this.requestMediaLibraryPermission();
      default:
        return { granted: false, canAskAgain: true, status: 'denied' };
    }
  }

  /**
   * Get all permissions needed for voice features
   */
  async ensureVoicePermissions(): Promise<boolean> {
    const micPermission = await this.handlePermissionRequest('microphone', {
      type: 'microphone',
      title: 'Microphone Access',
      message: 'This app needs microphone access to record voice commands and messages.',
      required: true
    });

    return micPermission.granted;
  }

  /**
   * Get all permissions needed for file features
   */
  async ensureFilePermissions(): Promise<{ camera: boolean; library: boolean; storage: boolean }> {
    const results = await this.requestMultiplePermissions(['camera', 'media_library', 'storage']);
    
    return {
      camera: results.camera?.granted || false,
      library: results.media_library?.granted || false,
      storage: results.storage?.granted || false
    };
  }

  /**
   * Clear permission cache
   */
  clearCache(): void {
    this.permissionCache.clear();
  }

  /**
   * Get readable permission status for debugging
   */
  async getPermissionSummary(): Promise<Record<string, PermissionStatus>> {
    const permissions = ['camera', 'microphone', 'storage', 'media_library'] as const;
    const summary: Record<string, PermissionStatus> = {};
    
    for (const permission of permissions) {
      summary[permission] = await this.checkPermissionStatus(permission);
    }
    
    return summary;
  }
}

export const permissionService = new PermissionService();