# WebSocket Connection Fix for Android

If WebSocket connections continue to fail, you can temporarily disable them in development:

## Option 1: Disable WebSocket in Development

Add to your ActivityScreen.tsx and TasksScreen.tsx:

```typescript
// At the top of the component
useEffect(() => {
  // Disable WebSocket in development for Android
  if (__DEV__ && Platform.OS === 'android') {
    console.log('WebSocket disabled for Android development');
    return;
  }
  
  // Your existing WebSocket code here
}, []);
```

## Option 2: Use HTTP Polling Instead

Replace WebSocket with periodic HTTP requests:

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    // Reload data every 5 seconds instead of WebSocket
    loadActivities();
    loadTasks();
  }, 5000);

  return () => clearInterval(interval);
}, []);
```

## Option 3: Check WebSocket Server Settings

The backend WebSocket server might need additional CORS settings for Android emulator.