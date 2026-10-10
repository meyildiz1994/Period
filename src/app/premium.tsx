import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Icon, IconBadge, OptionCard, Page, Toast } from '../components';
import { defineCopy, useCopy } from '../i18n';
import { buyPremium, manageSubscription, restorePremium, startStore } from '../lib/store';
import { usePremium, type Plan } from '../state/premium';
import { color, radius, type } from '../theme';
import type { IconName } from '../theme/icons';

const COPY = defineCopy({
  en: {
    title: 'Nilemy Premium',
    heading: 'Know your cycle better',
    intro: 'Choose monthly or yearly. Cancel anytime in your store settings.',
    plans: 'Plan',
    plan: { yearly: 'Yearly', monthly: 'Monthly' } as Record<Plan, string>,
    per: { yearly: (p: string) => `${p} a year`, monthly: (p: string) => `${p} a month` } as Record<Plan, (p: string) => string>,
    loading: 'Loading price…',
    perks: [
      ['ban', 'No ads', 'Every screen stays clean.'],
      ['chart-bars', 'Deeper insights', 'All-time trends, when your symptoms usually show up and a day-by-day map of mood, energy and pain.'],
      ['file-text', 'Cycle summary PDF', 'A tidy record of your logs to keep or show your doctor, plus your year in review.'],
      ['bell-ring', 'Smart reminders', 'A heads-up naming what you usually feel before your period, and your own daily reminders.'],
      ['plus', 'Your own symptoms', 'Add as many symptoms as you like to your logs.'],
      ['shield-check', 'Same privacy', 'Everything is worked out on this phone. Your logs stay encrypted here.'],
    ] as [IconName, string, string][],
    buy: 'Subscribe',
    restore: 'Restore purchase',
    owned: 'You have Premium. Thank you!',
    manage: 'Manage subscription',
    done: 'Done',
    failed: 'The purchase didn’t go through. Please try again.',
    notFound: 'No earlier purchase was found for this store account.',
    note: 'Payment is charged to your App Store or Google Play account. The subscription renews automatically at the same price for the same period unless you cancel at least 24 hours before it ends; you can cancel in your store account settings. Nilemy never sees your payment details.',
    terms: 'Terms of service',
    privacy: 'Privacy policy',
  },
  tr: {
    title: 'Nilemy Premium',
    heading: 'Döngünü daha iyi tanı',
    intro: 'Aylık ya da yıllık seç. Dilediğin zaman mağaza ayarlarından iptal edebilirsin.',
    plans: 'Plan',
    plan: { yearly: 'Yıllık', monthly: 'Aylık' },
    per: { yearly: (p: string) => `Yılda ${p}`, monthly: (p: string) => `Ayda ${p}` },
    loading: 'Fiyat yükleniyor…',
    perks: [
      ['ban', 'Reklam yok', 'Hiçbir ekranda reklam görmezsin.'],
      ['chart-bars', 'Daha derin analiz', 'Tüm zamanların eğilimleri, belirtilerinin genelde ne zaman başladığı ve ruh hali, enerji, ağrının gün gün haritası.'],
      ['file-text', 'Döngü özeti PDF', 'Kayıtlarının düzenli bir dökümü; saklamak ya da doktoruna göstermek için. Yanında yıllık özetin.'],
      ['bell-ring', 'Akıllı hatırlatıcılar', 'Adetinden önce genelde ne hissettiğini söyleyen bir uyarı ve kendi günlük hatırlatıcıların.'],
      ['plus', 'Kendi belirtilerin', 'Kayıtlarına istediğin kadar belirti ekle.'],
      ['shield-check', 'Aynı gizlilik', 'Her şey bu telefonda hesaplanır. Kayıtların burada şifreli kalır.'],
    ],
    buy: 'Abone ol',
    restore: 'Satın alımı geri yükle',
    owned: 'Premium sende. Teşekkürler!',
    manage: 'Aboneliği yönet',
    done: 'Tamam',
    failed: 'Satın alma tamamlanamadı. Lütfen tekrar dene.',
    notFound: 'Bu mağaza hesabında daha önceki bir satın alma bulunamadı.',
    note: 'Ödeme App Store ya da Google Play hesabından alınır. Abonelik, dönem bitmeden en az 24 saat önce iptal etmezsen aynı süre ve fiyatla kendiliğinden yenilenir; iptali mağaza hesap ayarlarından yapabilirsin. Nilemy ödeme bilgilerini hiç görmez.',
    terms: 'Kullanım koşulları',
    privacy: 'Gizlilik politikası',
  },
});

// Premium: no ads, deeper insights, cycle summary PDF, smart reminders and custom symptoms.
// A monthly or yearly auto-renewing subscription; the plan, price, renewal terms and the links
// to the terms and privacy policy are shown before subscribing (App Store guideline 3.1.2).
export default function Premium() {
  const c = useCopy(COPY);
  const { premium, prices } = usePremium();
  const [plan, setPlan] = useState<Plan>('yearly');
  const [busy, setBusy] = useState<'buy' | 'restore' | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    startStore();
  }, []);

  const run = async (kind: 'buy' | 'restore') => {
    setBusy(kind);
    setMessage(null);
    try {
      const ok = kind === 'buy' ? await buyPremium(plan) : await restorePremium();
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
          <>
            <Button label={c.done} fullWidth onPress={router.back} />
            <Button label={c.manage} type="Ghost" fullWidth onPress={() => manageSubscription().catch(() => {})} />
          </>
        ) : (
          <>
            <Button label={c.buy} fullWidth loading={busy === 'buy'} disabled={!!busy || !prices[plan]} onPress={() => run('buy')} />
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
      {premium ? null : (
        <View style={styles.plans} accessibilityRole="radiogroup" accessibilityLabel={c.plans}>
          {(['yearly', 'monthly'] as Plan[]).map((p) => (
            <OptionCard
              key={p}
              icon={p === 'yearly' ? 'calendar' : 'calendar-day'}
              title={c.plan[p]}
              subtitle={prices[p] ? c.per[p](prices[p]) : c.loading}
              selected={plan === p}
              onPress={() => setPlan(p)}
            />
          ))}
        </View>
      )}
      <Text style={[type('Body/Small'), { color: color['text/tertiary'] }]}>{c.note}</Text>
      <View style={styles.links}>
        <Text accessibilityRole="link" onPress={() => router.push('/about/terms')} style={[type('Body/Small', 'SemiBold'), { color: color['text/brand'] }]}>{c.terms}</Text>
        <Text accessibilityRole="link" onPress={() => router.push('/about/privacy')} style={[type('Body/Small', 'SemiBold'), { color: color['text/brand'] }]}>{c.privacy}</Text>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: 12, paddingTop: 8 },
  center: { textAlign: 'center' },
  card: { padding: 20, gap: 18, borderRadius: radius.xl, borderWidth: 1, borderColor: color['border/subtle'], backgroundColor: color['surface/default'] },
  perk: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  plans: { gap: 12 },
  links: { flexDirection: 'row', gap: 20 },
});
