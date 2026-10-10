import { getAppIconName, setAlternateAppIcon, supportsAlternateIcons } from 'expo-alternate-app-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import { Banner, Icon, Page } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { usePremium } from '../../state/premium';
import { color, radius, type } from '../../theme';

// Names match the expo-alternate-app-icons entries in app.json; null is the default icon.
const ICONS: { name: string | null; source: ImageSourcePropType }[] = [
  { name: null, source: require('../../../assets/icon.png') },
  { name: 'Plum', source: require('../../../assets/icons/icon-plum.png') },
  { name: 'Night', source: require('../../../assets/icons/icon-night.png') },
  { name: 'White', source: require('../../../assets/icons/icon-white.png') },
];

const COPY = defineCopy({
  en: {
    title: 'App icon',
    names: { default: 'Blush', Plum: 'Plum', Night: 'Night', White: 'White' } as Record<string, string>,
    premium: 'Other icons are part of Premium.',
    seePremium: 'See Premium',
    unsupported: 'This phone doesn’t support changing the app icon.',
    failed: 'The icon couldn’t be changed. Please try again.',
  },
  tr: {
    title: 'Uygulama ikonu',
    names: { default: 'Pembe', Plum: 'Bordo', Night: 'Gece', White: 'Beyaz' },
    premium: 'Diğer ikonlar Premium’a dahil.',
    seePremium: 'Premium’a göz at',
    unsupported: 'Bu telefon uygulama ikonunun değiştirilmesini desteklemiyor.',
    failed: 'İkon değiştirilemedi. Lütfen tekrar dene.',
  },
});

// Premium: alternate home screen icons (the default stays free).
export default function AppIcon() {
  const c = useCopy(COPY);
  const { premium } = usePremium();
  const [current, setCurrent] = useState(() => (supportsAlternateIcons ? getAppIconName() : null));
  const [failed, setFailed] = useState(false);

  const pick = async (name: string | null) => {
    if (name && !premium) return router.push('/premium');
    setFailed(false);
    try {
      await setAlternateAppIcon(name);
      setCurrent(name);
    } catch {
      setFailed(true);
    }
  };

  return (
    <Page title={c.title} onBack={router.back}>
      {!supportsAlternateIcons ? <Banner kind="Warning" message={c.unsupported} /> : null}
      {failed ? <Banner kind="Error" message={c.failed} /> : null}
      {!premium ? <Banner message={c.premium} action={c.seePremium} onAction={() => router.push('/premium')} /> : null}
      <View style={styles.grid} accessibilityRole="radiogroup">
        {ICONS.map((icon) => {
          const selected = current === icon.name;
          const locked = !!icon.name && !premium;
          const label = c.names[icon.name ?? 'default'];
          return (
            <Pressable
              key={label}
              accessibilityRole="radio"
              accessibilityState={{ selected, disabled: !supportsAlternateIcons }}
              accessibilityLabel={label}
              disabled={!supportsAlternateIcons}
              onPress={() => pick(icon.name)}
              style={styles.option}
            >
              <View style={[styles.frame, selected && styles.selected]}>
                <Image source={icon.source} style={styles.image} />
                {locked ? (
                  <View style={styles.lock}>
                    <Icon name="lock" size={14} color="text/on-brand" />
                  </View>
                ) : null}
              </View>
              <Text style={[type('Body/Small', selected ? 'SemiBold' : 'Regular'), { color: color[selected ? 'text/brand' : 'text/secondary'] }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 20 },
  option: { width: '50%', alignItems: 'center', gap: 8 },
  frame: { padding: 4, borderRadius: radius['2xl'], borderWidth: 2, borderColor: 'transparent' },
  selected: { borderColor: color['border/focus'] },
  image: { width: 96, height: 96, borderRadius: 22 },
  lock: { position: 'absolute', right: 8, bottom: 8, width: 26, height: 26, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: color['surface/brand'] },
});
