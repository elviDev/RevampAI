# Network Connectivity Troubleshooting Guide

## Issue Fixed ✅
The "Network request failed" error was caused by:
1. **Malformed .env variable**: `~API_BASE_URL` instead of `API_BASE_URL`
2. **Network unreachability**: Android emulator couldn't reach `10.0.2.2:3001`

## Solution Applied ✅
- ✅ Fixed the malformed environment variable
- ✅ Changed API_BASE_URL from `10.0.2.2:3001` to `10.226.34.181:3001` (your local IP)
- ✅ Backend is confirmed running and reachable on the new IP

## What to do next:

### 1. Restart your React Native app:
```bash
# Stop current Metro bundler (Ctrl+C)
# Then restart with cleared cache
npx react-native start --reset-cache

# In another terminal, rebuild the app
npx react-native run-android
```

### 2. If your IP address changes frequently:
You can set up automatic IP detection by updating your environment setup:

```typescript
// In src/config/apiConfig.ts (create this file)
export const getApiBaseUrl = () => {
  // Try environment variable first
  if (process.env.API_BASE_URL) {
    return process.env.API_BASE_URL;
  }
  
  // Fallback URLs for development
  const fallbackUrls = [
    'http://10.226.34.181:3001/api/v1',  // Current IP
    'http://10.0.2.2:3001/api/v1',       // Standard Android emulator
    'http://localhost:3001/api/v1',      // iOS simulator
  ];
  
  return fallbackUrls[0]; // Use first as default
};
```

### 3. For iOS simulator (if testing):
iOS simulator uses `localhost` instead of `10.0.2.2`:
```
API_BASE_URL=http://localhost:3001/api/v1
```

### 4. Network troubleshooting commands:
```bash
# Test backend connectivity
curl -I http://10.226.34.181:3001/api/v1/auth/me

# Check what's running on port 3001
lsof -i :3001

# Get your current IP address
ipconfig getifaddr en0
```

## Verification Steps:
1. ✅ Backend running on 0.0.0.0:3001
2. ✅ Reachable on local IP (10.226.34.181:3001) 
3. ✅ Environment variables fixed
4. 🔄 **Next**: Restart React Native app to test authentication

Your authentication should now work! The error should be resolved once you restart the app with the new configuration.