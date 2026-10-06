import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, CycleRing, Icon } from '../../components';
import { color, layout, type } from '../../theme';

// A1 Welcome. The ring is an illustration of the app, not the user's data.
export default function Welcome() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) }]}>
      <View style={styles.top}>
        <View style={styles.logo}>
          <View style={styles.logoMark}>
            <Icon name="drop-fill" size={20} color="text/brand" />
          </View>
          <Text style={[type('Headline', 'SemiBold'), { color: color['text/brand'] }]}>Period</Text>
        </View>
        <View style={styles.ring}>
          <CycleRing phase="Menstrual" progress={3 / 28} label="Today" day="Day 3" caption="Next period in 26 days" />
        </View>
        <Text accessibilityRole="header" style={[type('Title/Large', 'Bold'), styles.title]}>Welcome to Period</Text>
        <Text style={[type('Body/Medium'), styles.body]}>
          Log your period in seconds, see what your cycle is doing and plan ahead.
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.privacy}>
          <Icon name="lock" size={16} color="text/secondary" />
          <Text style={[type('Caption'), { color: color['text/secondary'] }]}>No account needed. Your logs stay on this phone.</Text>
        </View>
        <Button label="Get started" fullWidth onPress={() => router.push('/onboarding/goal')} />
        <View style={styles.signIn}>
          <Text style={[type('Body/Medium'), { color: color['text/secondary'] }]}>Already backed up?</Text>
          {/* F3 Sign in arrives with the account screens in step 8. */}
          <Pressable accessibilityRole="button" onPress={() => {}} hitSlop={12} style={styles.link}>
            <Text style={[type('Body/Medium', 'SemiBold'), { color: color['text/brand'] }]}>Sign in</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color['bg/canvas'], justifyContent: 'space-between' },
  top: { alignItems: 'center', paddingHorizontal: layout.gutter },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  logoMark: { width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: color['surface/muted'] },
  ring: { marginTop: 40 },
  title: { marginTop: 32, textAlign: 'center', color: color['text/primary'] },
  body: { marginTop: 12, textAlign: 'center', color: color['text/secondary'] },
  footer: { paddingHorizontal: 24, gap: 16 },
  privacy: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  signIn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 36 },
  link: { paddingHorizontal: 12, minHeight: 44, justifyContent: 'center' },
});
