import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '../components';
import { color, type } from '../theme';
import { getOnboarding } from '../state/onboarding';

// I1 Splash: brand mark on surface/brand, then A1 Welcome after 0.8 s (Home once onboarding is done).
export default function Splash() {
  useEffect(() => {
    const t = setTimeout(() => router.replace(getOnboarding().done ? '/home' : '/onboarding'), 800);
    return () => clearTimeout(t);
  }, []);

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
