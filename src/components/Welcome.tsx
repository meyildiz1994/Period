import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { color, fontFamily, palette, radius } from '../theme';
import { FlowerBuddy } from './Home';
import { Icon } from './Icon';
import { LogoFull } from './Logo';

/**
 * A1 Welcome hero: a plum gradient panel with rounded bottom corners, the logo (white wordmark)
 * and tagline on the left, and the smiling flower on a soft blob with a little calendar card
 * on the right. `top` is the safe-area inset so the gradient runs under the status bar.
 */
export function WelcomeHero({ tagline, top, corner }: { tagline: string; top: number; corner?: React.ReactNode }) {
  return (
    <View style={[styles.hero, { paddingTop: top + 8 }]}>
      <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none" viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="welcome-hero" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={palette['plum/900']} />
            <Stop offset="0.55" stopColor={palette['plum/700']} />
            <Stop offset="1" stopColor={palette['rose/500']} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill="url(#welcome-hero)" />
      </Svg>
      {corner ? <View style={styles.corner}>{corner}</View> : null}
      <View style={styles.row}>
        <View style={styles.brand}>
          <LogoFull width={104} wordmark={palette['neutral/0']} />
          <Text style={styles.tagline}>{tagline}</Text>
        </View>
        <HeroArt />
      </View>
    </View>
  );
}

/** Flower on a pale blob, a mini calendar card and a few sparkles; decorative only. */
function HeroArt() {
  return (
    <View style={styles.art} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={168} height={168} viewBox="0 0 168 168" style={StyleSheet.absoluteFill}>
        <Path d="M86 18c30-4 62 14 66 46 5 34-14 70-50 78-34 8-74-6-82-40-8-36 26-80 66-84z" fill={palette['pink/300']} opacity={0.9} />
        <Circle cx={24} cy={30} r={4} fill={palette['pink/200']} />
        <Circle cx={150} cy={140} r={6} fill={palette['pink/400']} opacity={0.8} />
        <Path d="M140 20 Q140 28 148 28 Q140 28 140 36 Q140 28 132 28 Q140 28 140 20 Z" fill={palette['neutral/0']} />
        <Path d="M18 120 Q18 125 23 125 Q18 125 18 130 Q18 125 13 125 Q18 125 18 120 Z" fill={palette['pink/200']} />
      </Svg>
      <View style={styles.flower}>
        <FlowerBuddy size={104} sparkles={2} phase="Luteal" />
      </View>
      <View style={styles.card}>
        <View style={styles.cardTop} />
        <Icon name="drop-fill" size={18} color="text/brand" />
      </View>
    </View>
  );
}

/** Google's four-colour "G" for the Google sign-in button. */
export function GoogleMark({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </Svg>
  );
}

/** White pill for a third-party sign-in (Google), matching the Apple button under it. */
export function ProviderButton({ label, onPress, disabled, children }: { label: string; onPress: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.provider, { backgroundColor: color[pressed ? 'surface/subtle' : 'surface/default'], opacity: disabled ? 0.6 : 1 }]}
    >
      {children}
      <Text numberOfLines={1} style={styles.providerLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: { borderBottomLeftRadius: radius['2xl'], borderBottomRightRadius: radius['2xl'], overflow: 'hidden', paddingHorizontal: 20, paddingBottom: 20 },
  corner: { alignItems: 'flex-end' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  brand: { flex: 1, gap: 12, paddingTop: 4 },
  tagline: { fontFamily: fontFamily.Medium, fontSize: 16, lineHeight: 22, color: color['text/softest'] },
  art: { width: 168, height: 168, alignItems: 'center', justifyContent: 'center' },
  flower: { marginTop: -6 },
  card: {
    position: 'absolute', left: 6, bottom: 18, width: 44, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'flex-end',
    paddingBottom: 8, backgroundColor: color['surface/default'], overflow: 'hidden', transform: [{ rotate: '-8deg' }],
  },
  cardTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 12, backgroundColor: color['surface/brand'] },
  provider: {
    height: 52, borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderWidth: 1, borderColor: color['border/subtle'],
  },
  providerLabel: { fontFamily: fontFamily.SemiBold, fontSize: 16, color: color['text/primary'] },
});
