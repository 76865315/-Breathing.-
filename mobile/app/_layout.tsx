import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/context/AuthContext';
import { ProgressProvider } from '../src/context/ProgressContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ProgressProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="session/[id]"
            options={{
              presentation: 'fullScreenModal',
              animation: 'fade'
            }}
          />
          <Stack.Screen
            name="technique/[id]"
            options={{
              presentation: 'card',
              animation: 'slide_from_right'
            }}
          />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="onboarding" />
        </Stack>
      </ProgressProvider>
    </AuthProvider>
  );
}
