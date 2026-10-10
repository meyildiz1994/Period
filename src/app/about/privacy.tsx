import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Page } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { color, type } from '../../theme';

const COPY = defineCopy({
  en: {
    title: 'Privacy policy',
    toData: 'Go to Your data',
    updated: 'Last updated October 10, 2026',
    sections: [
      ['What we collect', 'Only what you enter: period dates, flow, pain, mood, energy, symptoms, notes and your name. Without an account, none of it is ever sent to us.'],
      ['Where it lives', 'On this phone, encrypted. If your phone’s iCloud or Google backup is on, the encrypted file can be included, but it only opens on this phone.'],
      ['Account and backup (optional)', 'With an account (Google, Apple or email), your logs are encrypted on this phone with your Nilemy password before they’re backed up to Google Firebase in the EU. We and Google can’t read the backup. Your email and sign-in details are processed by Google, including in the US. Your logs are uploaded only with your explicit consent, which you can withdraw by deleting your account.'],
      ['Ads in the free version', 'After your first week, the free version shows non-personalised Google AdMob banners. Your logs and account details are never given to the ad provider and no advertising ID is used. To show ads, Google handles technical details such as your IP address and device model. Where the law asks, you’re asked for consent first. Premium removes ads.'],
      ['Premium', 'A monthly or yearly subscription through the App Store or Google Play. We never see your payment details; the app only checks whether your subscription is active.'],
      ['What we never do', 'We don’t sell your data, track you or share your logs with anyone.'],
      ['Your control', 'Export or delete everything on this phone in Your data, and delete your account and backup in Account. For anything else, write to info@nilemy.com.'],
      ['Full policy', 'Read the full policy, including your rights under data protection law, at nilemy.com/privacy.'],
    ] as [string, string][],
  },
  tr: {
    title: 'Gizlilik politikası',
    toData: 'Verilerin sayfasına git',
    updated: 'Son güncelleme: 10 Ekim 2026',
    sections: [
      ['Ne topluyoruz', 'Yalnızca senin girdiklerini: adet tarihleri, akış, ağrı, ruh hali, enerji, belirtiler, notlar ve adın. Hesap açmazsan bunların hiçbiri bize gönderilmez.'],
      ['Nerede duruyor', 'Bu telefonda, şifreli olarak. Telefonunun iCloud ya da Google yedeği açıksa şifreli dosya yedeğe dahil olabilir, ama yalnızca bu telefonda açılır.'],
      ['Hesap ve yedek (isteğe bağlı)', 'Hesap açarsan (Google, Apple ya da e-posta) kayıtların bu telefonda Nilemy parolanla şifrelenir ve öyle Google Firebase’in AB’deki sunucularına yedeklenir. Biz ve Google yedeği okuyamayız. E-postan ve giriş bilgilerin Google tarafından, ABD dahil yurt dışında işlenir. Kayıtların yalnızca açık rızanla yüklenir; rızanı hesabını silerek geri alabilirsin.'],
      ['Ücretsiz sürümde reklamlar', 'İlk haftandan sonra ücretsiz sürüm, kişiselleştirilmemiş Google AdMob banner reklamları gösterir. Kayıtların ve hesap bilgilerin reklam sağlayıcısına asla verilmez ve reklam kimliği kullanılmaz. Reklamı göstermek için Google, IP adresi ve cihaz modeli gibi teknik bilgileri işler. Yasanın gerektirdiği yerlerde önce iznin istenir. Premium reklamları kaldırır.'],
      ['Premium', 'App Store ya da Google Play üzerinden aylık veya yıllık abonelik. Ödeme bilgilerini görmeyiz; uygulama yalnızca aboneliğinin etkin olup olmadığını kontrol eder.'],
      ['Asla yapmadıklarımız', 'Verilerini satmayız, seni takip etmeyiz ve kayıtlarını kimseyle paylaşmayız.'],
      ['Kontrol sende', 'Bu telefondaki her şeyi Verilerin bölümünden dışa aktarabilir ya da silebilir, hesabını ve yedeğini Hesap bölümünden silebilirsin. Diğer talepler için: info@nilemy.com'],
      ['Politikanın tamamı', 'KVKK kapsamındaki hakların dahil politikanın tamamını nilemy.com/privacy adresinde okuyabilirsin.'],
    ],
  },
});

// G8 Privacy policy.
export default function Privacy() {
  const c = useCopy(COPY);
  return (
    <Page
      title={c.title}
      onBack={router.back}
      footer={<Button label={c.toData} type="Secondary" fullWidth onPress={() => router.push('/data')} />}
    >
      <Text style={[type('Body/Small'), { color: color['text/tertiary'] }]}>{c.updated}</Text>
      {c.sections.map(([title, body]) => (
        <View key={title} style={styles.section}>
          <Text accessibilityRole="header" style={[type('Body/Large', 'SemiBold'), { color: color['text/primary'] }]}>{title}</Text>
          <Text style={[type('Body/Medium'), { color: color['text/secondary'] }]}>{body}</Text>
        </View>
      ))}
    </Page>
  );
}

const styles = StyleSheet.create({
  section: { gap: 6 },
});
