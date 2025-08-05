import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../types/navigation.types';

type NavigationTestProps = NativeStackNavigationProp<MainStackParamList>;

/**
 * Test component to validate navigation context availability
 * This component uses the same pattern as TasksScreen to verify the fix
 */
export const NavigationTestComponent: React.FC = () => {
  const navigation = useNavigation<NavigationTestProps>();
  const isFocused = useIsFocused();
  const [navigationReady, setNavigationReady] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  // Check navigation readiness (same pattern as TasksScreen)
  useEffect(() => {
    if (navigation && isFocused) {
      setNavigationReady(true);
      setTestResults(prev => [...prev, '✅ Navigation context available']);
    } else {
      setTestResults(prev => [...prev, '⏳ Waiting for navigation context']);
    }
  }, [navigation, isFocused]);

  // Safe navigation handler (same pattern as TasksScreen)
  const handleTestNavigation = useCallback(
    (testId: string) => {
      if (navigationReady && navigation) {
        try {
          // Don't actually navigate, just test the context
          setTestResults(prev => [
            ...prev,
            `✅ Navigation test ${testId} - Context ready`,
          ]);
          return true;
        } catch (error) {
          setTestResults(prev => [
            ...prev,
            `❌ Navigation test ${testId} - Error: ${error}`,
          ]);
          return false;
        }
      } else {
        setTestResults(prev => [
          ...prev,
          `⚠️ Navigation test ${testId} - Context not ready`,
        ]);
        return false;
      }
    },
    [navigation, navigationReady],
  );

  const runTests = () => {
    setTestResults(['🧪 Running navigation tests...']);

    // Test 1: Basic navigation availability
    handleTestNavigation('1');

    // Test 2: Multiple rapid calls (simulating user interaction)
    setTimeout(() => handleTestNavigation('2'), 100);
    setTimeout(() => handleTestNavigation('3'), 200);
  };

  return (
    <View
      style={{
        padding: 20,
        backgroundColor: 'white',
        margin: 10,
        borderRadius: 8,
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        Navigation Context Test
      </Text>

      <Text style={{ marginBottom: 5 }}>
        Navigation Ready: {navigationReady ? '✅ Yes' : '❌ No'}
      </Text>

      <Text style={{ marginBottom: 5 }}>
        Is Focused: {isFocused ? '✅ Yes' : '❌ No'}
      </Text>

      <TouchableOpacity
        onPress={runTests}
        style={{
          backgroundColor: '#007AFF',
          padding: 10,
          borderRadius: 5,
          marginVertical: 10,
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          Run Navigation Tests
        </Text>
      </TouchableOpacity>

      <View style={{ marginTop: 10 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>
          Test Results:
        </Text>
        {testResults.map((result, index) => (
          <Text key={index} style={{ fontSize: 12, marginBottom: 2 }}>
            {result}
          </Text>
        ))}
      </View>
    </View>
  );
};
