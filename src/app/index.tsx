import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '../components';
import { color, type } from '../theme';
import { getOnboarding, useOnboarding } from '../state/onboarding';

// I1 Splash: brand mark on surface/brand for 0.8 s, then A1 Welcome or Home once saved data is read.
export default function Splash() {
  const { hydrated } = useOnboarding();
  const [shownAt] = useState(() => Date.now());
  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => router.replace(getOnboarding().done ? '/home' : '/onboarding'), Math.max(0, 800 - (Date.now() - shownAt)));
    return () => clearTimeout(t);
  }, [hydrated, shownAt]);

  return (
    <View style={styles.screen} accessible accessibilityLabel="Period. Track, understand, manage.">
      <StatusBar style="light" />
      <View style={styles.mark}>
        <Icon name="drop-fill" size={40} color="text/on-brand" />
      </View>
      <Text style={[type('Display', 'Bold'), styles.name]}>Period</Text>
      <Text style={[type('Body/Medium'), styles.tagline]}>Track · Understand · Manage</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color['surface/brand'] },
  mark: { width: 88, height: 88, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.15)' },
  name: { marginTop: 24, color: color['text/on-brand'] },
  tagline: { marginTop: 12, color: color['text/on-brand'] },
});
