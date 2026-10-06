import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LockGate } from '../components';
import { color, fontAssets } from '../theme';

export default function RootLayout() {
  const [loaded] = useFonts(fontAssets);
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
