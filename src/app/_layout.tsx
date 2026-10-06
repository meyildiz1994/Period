import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LockGate } from '../components';
import { hydrate } from '../state/persist';
import { color, fontAssets } from '../theme';

export default function RootLayout() {
  const [loaded] = useFonts(fontAssets);
  // Read the saved, encrypted data while the fonts load; Splash waits for it.
  useEffect(() => {
    hydrate();
  }, []);
  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <LockGate>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color['bg/canvas'] } }} />
      </LockGate>
    </SafeAreaProvider>
  );
}
