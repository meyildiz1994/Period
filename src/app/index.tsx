import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { AnimatedLogoMark } from '../components';
import { defineCopy, useCopy } from '../i18n';
import { color, type } from '../theme';
import { startReminders } from '../lib/notifications';
import { getOnboarding, useOnboarding } from '../state/onboarding';

// I1 Splash: the logo draws itself (the N like a path, then the dot), the name fades in, then
// A1 Welcome or Home once saved data is read. The native launch screen before it is the same
// colour with no image, so the drawing starts from a blank screen.
const HOLD_MS = 350;

const COPY = defineCopy({
  en: {
    tagline: 'Track · Understand · Manage',
    label: 'Nilemy. Track, understand, manage.',
  },
  tr: {
    tagline: 'Takip et · Anla · Yönet',
    label: 'Nilemy. Takip et, anla, yönet.',
  },
});

export default function Splash() {
  const { hydrated } = useOnboarding();
  const [drawn, setDrawn] = useState(false);
  const [name] = useState(() => new Animated.Value(0));
  const left = useRef(false);
  const c = useCopy(COPY);

  useEffect(() => {
    if (!drawn) return;
    Animated.timing(name, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, [drawn, name]);

  useEffect(() => {
    if (!hydrated || !drawn || left.current) return;
    const t = setTimeout(() => {
      left.current = true;
      router.replace(getOnboarding().done ? '/home' : '/onboarding');
      // After the first screen is in place, so a tapped notification can open its screen on top.
      startReminders();
    }, HOLD_MS);
    return () => clearTimeout(t);
  }, [hydrated, drawn]);

  return (
    <View style={styles.screen} accessible accessibilityLabel={c.label}>
      <StatusBar style="dark" />
      <AnimatedLogoMark size={168} onDone={() => setDrawn(true)} />
      <Animated.View style={{ opacity: name, alignItems: 'center' }}>
        <Animated.Text style={[type('Display', 'Bold'), styles.name]}>Nilemy</Animated.Text>
        <Animated.Text style={[type('Body/Medium'), styles.tagline]}>{c.tagline}</Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color['bg/canvas'] },
  name: { marginTop: 16, color: color['text/brand'] },
  tagline: { marginTop: 8, color: color['text/secondary'] },
});
