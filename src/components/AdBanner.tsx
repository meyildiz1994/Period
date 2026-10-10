import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

import { defineCopy, useCopy } from '../i18n';
import { AD_REQUEST, BANNER_UNIT } from '../lib/ads';
import { usePremium } from '../state/premium';
import { color, layout, radius, type } from '../theme';

const COPY = defineCopy({
  en: { ad: 'Ad', remove: 'Remove ads' },
  tr: { ad: 'Reklam', remove: 'Reklamları kaldır' },
});

// One banner at the end of a tab's content, in the free version only. It sits in the page (not
// pinned over the floating tab bar), is labelled as an ad and links to Premium. If no ad loads,
// nothing is shown.
export function AdBanner() {
  const { premium, adsReady } = usePremium();
  const { width } = useWindowDimensions();
  const [failed, setFailed] = useState(false);
  const c = useCopy(COPY);
  if (premium || !adsReady || failed) return null;

  return (
    <View style={styles.box}>
      <View style={styles.head}>
        <Text style={[type('Caption'), { color: color['text/tertiary'] }]}>{c.ad}</Text>
        <Pressable accessibilityRole="link" onPress={() => router.push('/premium')} hitSlop={8}>
          <Text style={[type('Caption', 'SemiBold'), { color: color['text/brand'] }]}>{c.remove}</Text>
        </Pressable>
      </View>
      <BannerAd
        unitId={BANNER_UNIT}
        size={BannerAdSize.INLINE_ADAPTIVE_BANNER}
        width={Math.floor(width - layout.gutter * 2)}
        maxHeight={120}
        requestOptions={AD_REQUEST}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: 6, marginTop: 8, borderRadius: radius.lg, overflow: 'hidden' },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
