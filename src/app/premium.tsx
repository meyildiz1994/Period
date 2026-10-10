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
    heading: 'Know your cycle better',
    intro: 'One purchase, yours for good. No subscription.',
    perks: [
      ['ban', 'No ads', 'Every screen stays clean.'],
      ['chart-bars', 'Deeper insights', 'All-time trends, when your symptoms usually show up and a day-by-day map of mood, energy and pain.'],
      ['file-text', 'Cycle summary PDF', 'A tidy record of your logs to keep or show your doctor, plus your year in review.'],
      ['bell-ring', 'Smart reminders', 'A heads-up naming what you usually feel before your period, and your own daily reminders.'],
      ['plus', 'Your own symptoms', 'Add as many symptoms as you like to your logs.'],
      ['shield-check', 'Same privacy', 'Everything is worked out on this phone. Your logs stay encrypted here.'],
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
    heading: 'Döngünü daha iyi tanı',
    intro: 'Tek seferlik satın alma, kalıcı olarak senin. Abonelik yok.',
    perks: [
      ['ban', 'Reklam yok', 'Hiçbir ekranda reklam görmezsin.'],
      ['chart-bars', 'Daha derin analiz', 'Tüm zamanların eğilimleri, belirtilerinin genelde ne zaman başladığı ve ruh hali, enerji, ağrının gün gün haritası.'],
      ['file-text', 'Döngü özeti PDF', 'Kayıtlarının düzenli bir dökümü; saklamak ya da doktoruna göstermek için. Yanında yıllık özetin.'],
      ['bell-ring', 'Akıllı hatırlatıcılar', 'Adetinden önce genelde ne hissettiğini söyleyen bir uyarı ve kendi günlük hatırlatıcıların.'],
      ['plus', 'Kendi belirtilerin', 'Kayıtlarına istediğin kadar belirti ekle.'],
      ['shield-check', 'Aynı gizlilik', 'Her şey bu telefonda hesaplanır. Kayıtların burada şifreli kalır.'],
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

// Premium: no ads, deeper insights, cycle summary PDF, smart reminders and custom symptoms.
// One non-consumable purchase.
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
