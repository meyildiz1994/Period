import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Icon } from '../components';
import { color, ICONS, layout, overline, radius, space, type, type IconName } from '../theme';

// Temporary start screen: shows the ported design tokens so they can be checked on a phone.
// Replaced by I1 Splash → A1 Welcome in the onboarding step.
const SWATCHES = [
  'surface/brand', 'surface/brand-soft', 'surface/deep', 'surface/accent',
  'surface/strong', 'surface/muted', 'surface/subtle', 'bg/canvas',
  'text/primary', 'text/secondary', 'text/tertiary', 'feedback/danger',
  'feedback/success', 'feedback/warning',
] as const;

export default function TokenPreview() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[overline(12), { color: color['text/brand'] }]}>Period · Design system</Text>
        <Text style={[type('Title/Large', 'Bold'), { color: color['text/primary'] }]}>Track. Understand. Manage.</Text>
        <Text style={[type('Body/Default'), { color: color['text/secondary'] }]}>
          Tokens, type and icons ported from Figma. Screens come next.
        </Text>
        <Button label="See components" size="Medium" iconRight="arrow-right" onPress={() => router.push('/gallery')} />

        <Text style={[overline(12), styles.section]}>Colour</Text>
        <View style={styles.grid}>
          {SWATCHES.map((t) => (
            <View key={t} style={styles.swatchCell}>
              <View style={[styles.swatch, { backgroundColor: color[t] }]} />
              <Text style={[type('Micro'), { color: color['text/tertiary'] }]}>{t}</Text>
            </View>
          ))}
        </View>

        <Text style={[overline(12), styles.section]}>Type</Text>
        <Text style={[type('Display', 'Bold'), { color: color['text/primary'] }]}>Day 3</Text>
        <Text style={[type('Headline', 'SemiBold'), { color: color['text/primary'] }]}>Period · estimate</Text>
        <Text style={[type('Body/Default'), { color: color['text/secondary'] }]}>Your next period may start in 2 days.</Text>
        <Text style={[type('Caption'), { color: color['text/tertiary'] }]}>Caption · 13</Text>

        <Text style={[overline(12), styles.section]}>Icons ({Object.keys(ICONS).length})</Text>
        <View style={styles.grid}>
          {(Object.keys(ICONS) as IconName[]).map((n) => (
            <View key={n} style={styles.iconCell}>
              <Icon name={n} color="text/brand" />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: color['bg/canvas'] },
  content: { padding: layout.gutter, gap: space[8] },
  section: { color: color['text/tertiary'], marginTop: space[24] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[12] },
  swatchCell: { width: 76, gap: space[4] },
  swatch: { height: 48, borderRadius: radius.md, borderWidth: 1, borderColor: color['border/subtle'] },
  iconCell: {
    width: layout.minTouch, height: layout.minTouch, alignItems: 'center', justifyContent: 'center',
    borderRadius: radius.sm, backgroundColor: color['surface/default'],
  },
});
