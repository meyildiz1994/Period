import { router } from 'expo-router';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { Button, Page } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { color, type } from '../../theme';

const CONTACT = 'info@nilemy.com';

// A paragraph, or a bullet list. A bullet is plain text or [bold lead, rest].
type Bullet = string | [string, string];
type Block = string | Bullet[];

// Same text as nilemy.com/privacy (site/privacy/index.html); keep the two in step.
const COPY = defineCopy({
  en: {
    title: 'Privacy policy',
    toData: 'Go to Your data',
    updated: 'Last updated October 9, 2026',
    lead: 'Nilemy is an app for tracking your menstrual cycle. Your logs stay on your phone, encrypted. We don’t collect, see or share any of your data.',
    sections: [
      ['What the app stores', [
        'Only what you enter:',
        [
          'Period start and end dates, flow, pain, mood, symptoms and notes',
          'The name used on Home',
          'Your settings: cycle and period length, reminders, language, app lock',
        ],
        'Your app lock passcode is never stored as plain text; only a one-way, salted hash is kept.',
      ]],
      ['Where it lives', [
        'Everything stays on your phone, in a single file encrypted with AES-256. The key is held in your phone’s secure storage (Keychain on iPhone, Keystore on Android) and can’t leave that device.',
        'Nilemy has no accounts, servers or cloud backup. The app doesn’t connect to the internet; your logs are never sent to us or anyone else.',
      ]],
      ['What we don’t collect', [[
        'We collect no personal data, health data or usage statistics.',
        'We show no ads, don’t track you, and use no analytics or advertising tools.',
        'We never sell or share your data.',
      ]]],
      ['Permissions', [[
        ['Notifications', ' (optional): Period reminders are scheduled and shown on your phone; nothing comes from a server.'],
        ['Face ID / fingerprint', ' (optional): Used to unlock the app lock. Your biometric data stays in your phone’s operating system; Nilemy can’t access it.'],
      ]]],
      ['Phone backups', [
        'If iCloud or Google backup is on, the encrypted data file may be included in it. The key stays on this phone, so the file can’t be opened on another device. Your logs therefore don’t move to a new phone on their own; use Export to take them with you.',
      ]],
      ['Export and delete', [[
        ['Export:', ' Me → Your data → Export creates a CSV or JSON copy of your logs. The file isn’t encrypted, and you choose where it goes. The app removes its own copy when you leave the screen.'],
        ['Delete:', ' Me → Your data → Delete all data permanently removes the data file and its encryption key from your phone. Deleting the app also removes all your logs.'],
      ]]],
      ['Children', ['Nilemy collects no data from anyone, so it collects none from children either.']],
      ['This website', [
        'nilemy.com is hosted on GitHub Pages. We use no cookies or analytics. Your language choice is stored only in your browser. GitHub may log technical information such as IP addresses for security, and fonts load from Google Fonts. These services have their own privacy policies.',
      ]],
      ['Changes', ['If this policy changes, we’ll update the date on this page and announce significant changes in the app first.']],
    ] as [string, Block[]][],
    contactTitle: 'Contact',
    contactBody: 'Write to us with any privacy question:',
  },
  tr: {
    title: 'Gizlilik politikası',
    toData: 'Verilerin sayfasına git',
    updated: 'Son güncelleme: 9 Ekim 2026',
    lead: 'Nilemy, adet döngünü takip etmen için yapılmış bir uygulama. Kayıtların yalnızca senin telefonunda, şifreli olarak durur. Biz hiçbir verini toplamayız, görmeyiz ve kimseyle paylaşmayız.',
    sections: [
      ['Uygulamanın sakladıkları', [
        'Yalnızca senin uygulamaya girdiklerin:',
        [
          'Adet başlangıç ve bitiş tarihleri, akış, ağrı, ruh hali, belirtiler ve notlar',
          'Ana sayfada kullanılan adın',
          'Ayarların: döngü ve adet süresi, hatırlatıcılar, dil, uygulama kilidi',
        ],
        'Uygulama kilidi şifren hiçbir zaman açık metin olarak saklanmaz; yalnızca tek yönlü, tuzlanmış bir özeti (hash) tutulur.',
      ]],
      ['Nerede duruyor', [
        'Her şey yalnızca telefonunda, AES-256 ile şifrelenmiş tek bir dosyada durur. Şifreleme anahtarı telefonunun güvenli bölgesinde (iPhone’da Keychain, Android’de Keystore) tutulur ve o cihazdan çıkamaz.',
        'Nilemy’de hesap, sunucu ya da bulut yedeği yok. Uygulama internete bağlanmaz; kayıtların bize ya da başka birine gönderilmez.',
      ]],
      ['Toplamadıklarımız', [[
        'Kişisel veri, sağlık verisi ya da kullanım istatistiği toplamayız.',
        'Reklam göstermeyiz, seni takip etmeyiz, analiz ya da reklam araçları kullanmayız.',
        'Verilerini satmayız ve kimseyle paylaşmayız.',
      ]]],
      ['İzinler', [[
        ['Bildirimler', ' (isteğe bağlı): Adet hatırlatıcıları telefonunda planlanır ve telefonunda gösterilir; hiçbir sunucudan gelmez.'],
        ['Face ID / parmak izi', ' (isteğe bağlı): Uygulama kilidini açmak için kullanılır. Biyometrik verilerin telefonunun işletim sisteminde kalır; Nilemy bunlara erişemez.'],
      ]]],
      ['Telefon yedekleri', [
        'Telefonunda iCloud ya da Google yedeği açıksa şifreli veri dosyası bu yedeğe dahil olabilir. Anahtar yalnızca bu telefonda kaldığı için dosya başka bir cihazda açılamaz. Bu yüzden kayıtların yeni bir telefona kendiliğinden taşınmaz; taşımak için Dışa aktar özelliğini kullanabilirsin.',
      ]],
      ['Dışa aktarma ve silme', [[
        ['Dışa aktar:', ' Ben → Verilerin → Dışa aktar ile kayıtlarının CSV ya da JSON kopyasını oluşturabilirsin. Bu dosya şifreli değildir; nereye göndereceğine sen karar verirsin. Uygulama, ekrandan çıktığında kendi kopyasını siler.'],
        ['Sil:', ' Ben → Verilerin → Tüm verileri sil, veri dosyasını ve şifreleme anahtarını telefonundan kalıcı olarak siler. Uygulamayı silmek de tüm kayıtlarını siler.'],
      ]]],
      ['Çocuklar', ['Nilemy hiçbir kullanıcıdan veri toplamadığı için çocuklardan da veri toplamaz.']],
      ['Bu web sitesi', [
        'nilemy.com, GitHub Pages üzerinde yayınlanır. Biz çerez ya da analiz aracı kullanmayız. Dil seçimin yalnızca tarayıcında saklanır. GitHub, güvenlik amacıyla IP adresi gibi teknik bilgileri kaydedebilir; yazı tipleri Google Fonts’tan yüklenir. Bu hizmetler kendi gizlilik politikalarına tabidir.',
      ]],
      ['Değişiklikler', ['Bu politika değişirse bu sayfadaki tarihi güncelleriz ve önemli değişiklikleri uygulamada önceden duyururuz.']],
    ],
    contactTitle: 'İletişim',
    contactBody: 'Gizlilikle ilgili her soru için bize yaz:',
  },
});

// G8 Privacy policy.
export default function Privacy() {
  const c = useCopy(COPY);
  const body = [type('Body/Medium'), { color: color['text/secondary'] }];
  const heading = [type('Body/Large', 'SemiBold'), { color: color['text/primary'] }];
  return (
    <Page
      title={c.title}
      onBack={router.back}
      footer={<Button label={c.toData} type="Secondary" fullWidth onPress={() => router.push('/data')} />}
    >
      <Text style={[type('Body/Small'), { color: color['text/tertiary'] }]}>{c.updated}</Text>
      <Text style={[type('Body/Medium'), { color: color['text/primary'] }]}>{c.lead}</Text>
      {c.sections.map(([title, blocks]) => (
        <View key={title} style={styles.section}>
          <Text accessibilityRole="header" style={heading}>{title}</Text>
          {blocks.map((block, i) =>
            typeof block === 'string' ? (
              <Text key={i} style={body}>{block}</Text>
            ) : (
              <View key={i} style={styles.list}>
                {block.map((item, j) => (
                  <View key={j} style={styles.bullet}>
                    <Text style={body}>•</Text>
                    <Text style={[body, { flex: 1 }]}>
                      {typeof item === 'string' ? item : (
                        <><Text style={[type('Body/Medium', 'SemiBold'), { color: color['text/primary'] }]}>{item[0]}</Text>{item[1]}</>
                      )}
                    </Text>
                  </View>
                ))}
              </View>
            ),
          )}
        </View>
      ))}
      <View style={styles.section}>
        <Text accessibilityRole="header" style={heading}>{c.contactTitle}</Text>
        <View style={styles.card}>
          <Text style={[type('Body/Medium', 'SemiBold'), { color: color['text/primary'] }]}>Nilufer Akten</Text>
          <Text style={body}>{c.contactBody}</Text>
          <Text
            accessibilityRole="link"
            onPress={() => Linking.openURL(`mailto:${CONTACT}`).catch(() => {})}
            style={[type('Body/Medium', 'SemiBold'), { color: color['text/brand'] }]}
          >
            {CONTACT}
          </Text>
        </View>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  section: { gap: 6 },
  list: { gap: 4 },
  bullet: { flexDirection: 'row', gap: 8 },
  card: { gap: 4, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: color['border/subtle'], backgroundColor: color['surface/default'] },
});
