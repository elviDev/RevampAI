# React Native Frontend App

React Native mobile application for task management and team collaboration.

## Getting Started

> **Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

### Prerequisites
- Node.js 18+
- React Native development environment
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation

1. Install dependencies:
```bash
npm install
```

2. For iOS, install CocoaPods dependencies:
```bash
cd ios && pod install && cd ..
```

### Development

Start the Metro bundler:
```bash
npm start
```

Run on Android:
```bash
npm run android
```

Run on iOS:
```bash
npm run ios
```

### Test User Credentials

1. CEO:
   - Email: ceo@test.com
   - Password: test123
   - Role: CEO with full admin permissions

2. Manager:
   - Email: manager@test.com
   - Password: test123
   - Role: Manager with read/write permissions

3. Staff:
   - Email: staff@test.com
   - Password: test123
   - Role: Staff with read-only permissions

### Features

- **Authentication**: Login/register with role-based access
- **Task Management**: Create, assign, and track tasks
- **Team Collaboration**: Channel-based communication
- **Real-time Updates**: WebSocket integration for live updates
- **Voice Integration**: Voice-to-text functionality
- **Offline Support**: Works offline with sync when connected

### Project Structure

```
src/
├── components/        # Reusable UI components
├── screens/          # Screen components
├── navigation/       # Navigation setup
├── services/         # API and service integrations
├── store/           # Redux store and slices
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── assets/          # Images and static assets
```

### Scripts

- `npm start` - Start Metro bundler
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run build` - Build for production

### Building APK

To build an APK for distribution:

1. Generate a signed APK:
```bash
cd android
./gradlew assembleRelease
```

2. The APK will be located at:
```
android/app/build/outputs/apk/release/app-release.apk
```

### Configuration

The app connects to the backend API. Update the API URL in `src/config/apiKeys.ts` to point to your deployed backend.

### Deployment

This frontend can be built into an APK for Android or submitted to the App Store for iOS. Make sure to configure the backend API URL for production before building.