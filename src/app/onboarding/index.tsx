import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, CycleRing, Icon, LogoMark } from '../../components';
import { color, layout, type } from '../../theme';

// A1 Welcome. The ring is an illustration of the app, not the user's data.
export default function Welcome() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) }]}>
      <View style={styles.top}>
        <View style={styles.logo}>
          <LogoMark size={40} />
          <Text style={[type('Headline', 'SemiBold'), { color: color['text/brand'] }]}>Period</Text>
        </View>
        <View style={styles.ring}>
          <CycleRing phase="Menstrual" progress={3 / 28} day="Day 3" />
        </View>
        <Text accessibilityRole="header" style={[type('Title/Large', 'Bold'), styles.title]}>Welcome to Period</Text>
        <Text style={[type('Body/Medium'), styles.body]}>
          Log your period in seconds, see what your cycle is doing and plan ahead.
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.privacy}>
          <Icon name="lock" size={16} color="text/secondary" />
          <Text style={[type('Caption'), { color: color['text/secondary'] }]}>Your logs stay on this phone.</Text>
        </View>
        <Button label="Get started" fullWidth onPress={() => router.push('/onboarding/goal')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color['bg/canvas'], justifyContent: 'space-between' },
  top: { alignItems: 'center', paddingHorizontal: layout.gutter },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  ring: { marginTop: 40 },
  title: { marginTop: 32, textAlign: 'center', color: color['text/primary'] },
  body: { marginTop: 12, textAlign: 'center', color: color['text/secondary'] },
  footer: { paddingHorizontal: 24, gap: 16 },
  privacy: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
});
