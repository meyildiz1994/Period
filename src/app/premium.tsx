import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Icon, IconBadge, Page, Toast } from '../components';
import { defineCopy, useCopy } from '../i18n';
import { buyPremium, restorePremium, startStore } from '../lib/store';
import { usePremium } from '../state/premium';
import { color, radius, type } from '../theme';
import type { IconName } from '../theme/icons';

const COPY = defineCopy({
  en: {
    title: 'Nilemy Premium',
    heading: 'Support Nilemy, go ad-free',
    intro: 'One purchase, yours for good. No subscription and no account.',
    perks: [
      ['ban', 'No ads', 'Every screen stays clean.'],
      ['heart', 'Support Nilemy', 'Your purchase keeps Nilemy growing, with new features on the way.'],
      ['shield-check', 'Same privacy', 'Your logs stay encrypted on this phone, with or without Premium.'],
    ] as [IconName, string, string][],
    buy: (price: string | null) => (price ? `Get Premium · ${price}` : 'Get Premium'),
    restore: 'Restore purchase',
    owned: 'You have Premium. Thank you!',
    done: 'Done',
    failed: 'The purchase didn’t go through. Please try again.',
    notFound: 'No earlier purchase was found for this store account.',
    note: 'Payment is handled by the App Store or Google Play. Nilemy never sees your payment details.',
  },
  tr: {
    title: 'Nilemy Premium',
    heading: 'Nilemy’yi destekle, reklamsız kullan',
    intro: 'Tek seferlik satın alma, kalıcı olarak senin. Abonelik ya da hesap yok.',
    perks: [
      ['ban', 'Reklam yok', 'Hiçbir ekranda reklam görmezsin.'],
      ['heart', 'Nilemy’yi destekle', 'Satın alman Nilemy’nin gelişmesine ve yeni özelliklere destek olur.'],
      ['shield-check', 'Aynı gizlilik', 'Kayıtların Premium olsa da olmasa da bu telefonda şifreli kalır.'],
    ],
    buy: (price: string | null) => (price ? `Premium’u al · ${price}` : 'Premium’u al'),
    restore: 'Satın alımı geri yükle',
    owned: 'Premium sende. Teşekkürler!',
    done: 'Tamam',
    failed: 'Satın alma tamamlanamadı. Lütfen tekrar dene.',
    notFound: 'Bu mağaza hesabında daha önceki bir satın alma bulunamadı.',
    note: 'Ödemeyi App Store ya da Google Play alır. Nilemy ödeme bilgilerini hiç görmez.',
  },
});

// Premium: removes ads; later Premium-only features use <PremiumOnly>. One non-consumable purchase.
export default function Premium() {
  const c = useCopy(COPY);
  const { premium, price } = usePremium();
  const [busy, setBusy] = useState<'buy' | 'restore' | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    startStore();
  }, []);

  const run = async (kind: 'buy' | 'restore') => {
    setBusy(kind);
    setMessage(null);
    try {
      const ok = kind === 'buy' ? await buyPremium() : await restorePremium();
      if (!ok && kind === 'restore') setMessage(c.notFound);
    } catch {
      setMessage(c.failed);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Page
      title={c.title}
      onBack={router.back}
      footer={
        premium ? (
          <Button label={c.done} fullWidth onPress={router.back} />
        ) : (
          <>
            <Button label={c.buy(price)} fullWidth loading={busy === 'buy'} disabled={!!busy} onPress={() => run('buy')} />
            <Button label={c.restore} type="Ghost" fullWidth loading={busy === 'restore'} disabled={!!busy} onPress={() => run('restore')} />
          </>
        )
      }
      overlay={message ? <Toast kind="Info" message={message} /> : null}
    >
      <View style={styles.hero}>
        <IconBadge icon="sparkles" tone="Strong" size={64} />
        <Text accessibilityRole="header" style={[type('Headline', 'SemiBold'), styles.center, { color: color['text/primary'] }]}>
          {premium ? c.owned : c.heading}
        </Text>
        {premium ? null : <Text style={[type('Body/Medium'), styles.center, { color: color['text/secondary'] }]}>{c.intro}</Text>}
      </View>
      <View style={styles.card}>
        {c.perks.map(([icon, title, body]) => (
          <View key={title} style={styles.perk}>
            <Icon name={icon} size={22} color="text/brand" />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[type('Body/Large', 'SemiBold'), { color: color['text/primary'] }]}>{title}</Text>
              <Text style={[type('Body/Medium'), { color: color['text/secondary'] }]}>{body}</Text>
            </View>
          </View>
        ))}
      </View>
      <Text style={[type('Body/Small'), { color: color['text/tertiary'] }]}>{c.note}</Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: 12, paddingTop: 8 },
  center: { textAlign: 'center' },
  card: { padding: 20, gap: 18, borderRadius: radius.xl, borderWidth: 1, borderColor: color['border/subtle'], backgroundColor: color['surface/default'] },
  perk: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
});
