import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Banner, Page } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { color, type } from '../../theme';

const COPY = defineCopy({
  en: {
    title: 'Terms of service',
    updated: 'Last updated October 10, 2026',
    contraceptionTitle: 'Not for contraception',
    contraception: 'Estimates are not a reliable way to prevent pregnancy. Don’t use Nilemy for contraception.',
    items: [
      ['Using Nilemy', 'Nilemy is a personal log. Estimates are based on what you enter.'],
      ['Not medical advice', 'Nothing in the app replaces advice from a healthcare professional.'],
      ['Your account', 'An account is optional. Keep your sign-in details, Nilemy password and recovery code private. If you lose both your Nilemy password and recovery code, nobody can open your backup, not even us. You can delete your account at any time.'],
      ['Premium subscription', 'Premium is a monthly or yearly subscription through the App Store or Google Play. It renews automatically unless cancelled at least 24 hours before the end of the period; payment is charged to your store account. Manage or cancel it in your store settings; Premium stays on until the paid period ends. Refunds are handled by Apple or Google.'],
      ['Ads', 'The free version shows non-personalised ads on some screens from a week after you install it. Premium removes them.'],
      ['Changes', 'If these terms change, we’ll tell you in the app first. Full terms: nilemy.com/terms'],
    ] as [string, string][],
  },
  tr: {
    title: 'Kullanım koşulları',
    updated: 'Son güncelleme: 10 Ekim 2026',
    contraceptionTitle: 'Doğum kontrolü için kullanılmaz',
    contraception: 'Tahminler gebeliği önlemenin güvenilir bir yolu değildir. Nilemy’yi doğum kontrolü için kullanma.',
    items: [
      ['Nilemy’yi kullanmak', 'Nilemy kişisel bir kayıt defteridir. Tahminler senin girdiklerine dayanır.'],
      ['Tıbbi tavsiye değildir', 'Uygulamadaki hiçbir şey bir sağlık uzmanının tavsiyesinin yerini tutmaz.'],
      ['Hesabın', 'Hesap açmak isteğe bağlıdır. Giriş bilgilerini, Nilemy parolanı ve kurtarma kodunu kimseyle paylaşma. Nilemy parolanı ve kurtarma kodunu birlikte kaybedersen yedeğini kimse açamaz, biz de. Hesabını istediğin zaman silebilirsin.'],
      ['Premium aboneliği', 'Premium, App Store ya da Google Play üzerinden aylık veya yıllık bir aboneliktir. Dönem bitmeden en az 24 saat önce iptal edilmezse kendiliğinden yenilenir; ücret mağaza hesabından alınır. Mağaza ayarlarından yönetebilir ya da iptal edebilirsin; Premium ödenen dönemin sonuna kadar açık kalır. İadeleri Apple ya da Google yapar.'],
      ['Reklamlar', 'Ücretsiz sürüm, kurulumdan bir hafta sonra bazı ekranlarda kişiselleştirilmemiş reklam gösterir. Premium reklamları kaldırır.'],
      ['Değişiklikler', 'Bu koşullar değişirse sana önce uygulamada haber veririz. Koşulların tamamı: nilemy.com/terms'],
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
