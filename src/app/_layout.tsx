import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LockGate } from '../components';
import { startAds } from '../lib/ads';
import { useLock } from '../state/lock';
import { useOnboarding } from '../state/onboarding';
import { hydrate } from '../state/persist';
import { color, fontAssets } from '../theme';

export default function RootLayout() {
  const [loaded] = useFonts(fontAssets);
  // Read the saved, encrypted data while the fonts load; Splash waits for it.
  useEffect(() => {
    hydrate();
  }, []);
  // Free version: ad consent and ads start once onboarding is done and the app is unlocked, so
  // Google's consent form never covers onboarding or the lock screen.
  const { hydrated, done } = useOnboarding();
  const lock = useLock();
  const ready = hydrated && done && !(lock.enabled && lock.locked);
  useEffect(() => {
    if (ready) startAds();
  }, [ready]);
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
