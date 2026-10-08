import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Banner, Page } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { color, type } from '../../theme';

const COPY = defineCopy({
  en: {
    title: 'Terms of service',
    updated: 'Last updated November 1, 2026',
    contraceptionTitle: 'Not for contraception',
    contraception: 'Estimates are not a reliable way to prevent pregnancy. Don’t use Nilemy for contraception.',
    items: [
      ['Using Nilemy', 'Nilemy is a personal log. Estimates are based on what you enter.'],
      ['Not medical advice', 'Nothing in the app replaces advice from a healthcare professional.'],
      ['Changes', 'If these terms change, we’ll tell you in the app first.'],
    ] as [string, string][],
  },
  tr: {
    title: 'Kullanım koşulları',
    updated: 'Son güncelleme: 1 Kasım 2026',
    contraceptionTitle: 'Doğum kontrolü için kullanılmaz',
    contraception: 'Tahminler gebeliği önlemenin güvenilir bir yolu değildir. Nilemy’yi doğum kontrolü için kullanma.',
    items: [
      ['Nilemy’yi kullanmak', 'Nilemy kişisel bir kayıt defteridir. Tahminler senin girdiklerine dayanır.'],
      ['Tıbbi tavsiye değildir', 'Uygulamadaki hiçbir şey bir sağlık uzmanının tavsiyesinin yerini tutmaz.'],
      ['Değişiklikler', 'Bu koşullar değişirse sana önce uygulamada haber veririz.'],
    ],
  },
});

// G9 Terms of service.
export default function Terms() {
  const c = useCopy(COPY);
  return (
    <Page title={c.title} onBack={router.back}>
      <Text style={[type('Body/Small'), { color: color['text/tertiary'] }]}>{c.updated}</Text>
      <Banner kind="Warning" title={c.contraceptionTitle} message={c.contraception} />
      {c.items.map(([title, body], i) => (
        <View key={title} style={styles.item}>
          <View style={styles.number}>
            <Text style={[type('Body/Medium', 'Medium'), { color: color['text/brand'] }]}>{i + 1}</Text>
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            <Text accessibilityRole="header" style={[type('Body/Large', 'SemiBold'), { color: color['text/primary'] }]}>{title}</Text>
            <Text style={[type('Body/Medium'), { color: color['text/secondary'] }]}>{body}</Text>
          </View>
        </View>
      ))}
    </Page>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  number: { width: 32, height: 32, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: color['surface/muted'] },
});
