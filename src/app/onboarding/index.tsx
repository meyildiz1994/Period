import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Icon, LogoFull } from '../../components';
import { color, layout, type } from '../../theme';

// A1 Welcome: "Welcome to" over the full logo (mark and wordmark), then the intro line.
export default function Welcome() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) }]}>
      <View style={styles.top}>
        <Text accessibilityRole="header" accessibilityLabel="Welcome to Nilemy" style={[type('Title/Large', 'Bold'), styles.title]}>Welcome to</Text>
        <View style={styles.logo}>
          <LogoFull width={220} />
        </View>
        <Text style={[type('Body/Medium'), styles.body]}>
          Log your period in seconds, see what your cycle is doing and plan ahead.
        </Text>
        <View style={styles.cta}>
          <Button label="Get started" fullWidth onPress={() => router.push('/onboarding/goal')} />
        </View>
      </View>

      <View style={styles.privacy}>
        <Icon name="lock" size={16} color="text/secondary" />
        <Text style={[type('Caption'), { color: color['text/secondary'] }]}>Your logs stay on this phone.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color['bg/canvas'], justifyContent: 'space-between' },
  top: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: layout.gutter },
  logo: { marginTop: 24 },
  title: { textAlign: 'center', color: color['text/primary'] },
  body: { marginTop: 32, textAlign: 'center', color: color['text/secondary'], maxWidth: 300 },
  // 50 pt under the intro line (user's call), so the button sits with the welcome, not the bottom edge.
  cta: { marginTop: 50, alignSelf: 'stretch', paddingHorizontal: 24 - layout.gutter },
  privacy: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingBottom: 8 },
});
