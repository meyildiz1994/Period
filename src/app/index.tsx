import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { color, type } from '../theme';
import { startReminders } from '../lib/notifications';
import { getOnboarding, useOnboarding } from '../state/onboarding';

// I1 Splash: brand mark on surface/brand for 0.8 s, then A1 Welcome or Home once saved data is read.
export default function Splash() {
  const { hydrated } = useOnboarding();
  const [shownAt] = useState(() => Date.now());
  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => {
      router.replace(getOnboarding().done ? '/home' : '/onboarding');
      // After the first screen is in place, so a tapped notification can open its screen on top.
      startReminders();
    }, Math.max(0, 800 - (Date.now() - shownAt)));
    return () => clearTimeout(t);
  }, [hydrated, shownAt]);

  return (
    <View style={styles.screen} accessible accessibilityLabel="Period. Track, understand, manage.">
      <StatusBar style="light" />
      {/* Same image as the native launch screen, so the hand-off doesn't jump. */}
      <Image source={require('../../assets/splash-icon.png')} style={styles.mark} accessibilityIgnoresInvertColors />
      <Text style={[type('Display', 'Bold'), styles.name]}>Period</Text>
      <Text style={[type('Body/Medium'), styles.tagline]}>Track · Understand · Manage</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color['surface/brand'] },
  mark: { width: 88, height: 88 },
  name: { marginTop: 24, color: color['text/on-brand'] },
  tagline: { marginTop: 12, color: color['text/on-brand'] },
});
