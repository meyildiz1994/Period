import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Button, Divider, Icon, ListRow, SectionHeader, TopBar, useTabBarSpace } from '../../components';
import { defineCopy, LANGUAGES, useCopy, useLang } from '../../i18n';
import { useCommon } from '../../i18n/common';
import { accountsAvailable } from '../../lib/account';
import { showAdChoices } from '../../lib/ads';
import { APP_VERSION } from '../../lib/app';
import { biometricName, useBiometricKind } from '../../lib/biometrics';
import { useAccount } from '../../state/account';
import { resetLock, useLock } from '../../state/lock';
import { resetLog } from '../../state/log';
import { resetOnboarding, useOnboarding } from '../../state/onboarding';
import { usePremium } from '../../state/premium';
import { color, layout, radius, type } from '../../theme';

const COPY = defineCopy({
  en: {
    title: 'Me',
    saved: 'Saved on this device',
    backedUp: 'Backed up, end-to-end encrypted',
    backUp: 'Back up with an account',
    account: 'Account',
    accountOn: 'On',
    accountNeeds: 'Needs password',
    editName: 'Change your name',
    addName: 'Add your name',
    settings: 'Settings',
    cycle: 'Cycle settings',
    cycleSub: 'Cycle and period length',
    reminders: 'Reminders',
    data: 'Your data',
    dataSub: 'Export or delete',
    lock: 'App lock',
    passcode: 'Passcode',
    language: 'Language',
    appIcon: 'App icon',
    about: 'About',
    aboutApp: 'About Nilemy',
    privacy: 'Privacy policy',
    terms: 'Terms of service',
    premium: 'Nilemy Premium',
    premiumOn: 'Active',
    premiumOff: 'Remove ads',
    adChoices: 'Ad privacy choices',
  },
  tr: {
    title: 'Ben',
    saved: 'Bu cihazda kayıtlı',
    backedUp: 'Uçtan uca şifreli yedekleniyor',
    backUp: 'Hesapla yedekle',
    account: 'Hesap',
    accountOn: 'Açık',
    accountNeeds: 'Parola gerekli',
    editName: 'Adını değiştir',
    addName: 'Adını ekle',
    settings: 'Ayarlar',
    cycle: 'Döngü ayarları',
    cycleSub: 'Döngü ve adet süresi',
    reminders: 'Hatırlatıcılar',
    data: 'Verilerin',
    dataSub: 'Dışa aktar ya da sil',
    lock: 'Uygulama kilidi',
    passcode: 'Şifre',
    language: 'Dil',
    appIcon: 'Uygulama ikonu',
    about: 'Hakkında',
    aboutApp: 'Nilemy hakkında',
    privacy: 'Gizlilik politikası',
    terms: 'Kullanım koşulları',
    premium: 'Nilemy Premium',
    premiumOn: 'Etkin',
    premiumOff: 'Reklamları kaldır',
    adChoices: 'Reklam gizlilik seçenekleri',
  },
});

// G1 Me. "Back up with an account" opens the optional account (1.2); once signed in, the Account row.
export default function Me() {
  const insets = useSafeAreaInsets();
  const bottom = useTabBarSpace();
  const { name, reminder } = useOnboarding();
  const lock = useLock();
  const { premium, adChoicesRequired } = usePremium();
  const account = useAccount();
  const signedIn = account.status !== 'off';
  const kind = useBiometricKind();
  const c = useCopy(COPY);
  const common = useCommon();
  const lang = useLang();
  const biometric = kind ? biometricName(kind) : null;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <TopBar kind="Root" title={c.title} userName={name ?? undefined} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottom }]} showsVerticalScrollIndicator={false}>
        <View style={styles.profile}>
          <Avatar name={name ?? undefined} size="Large" />
          <Pressable accessibilityRole="button" accessibilityLabel={c.editName} onPress={() => router.push('/settings/name')} hitSlop={8} style={styles.name}>
            <Text style={[type('Headline', 'SemiBold'), { color: color['text/primary'] }]}>{name || c.addName}</Text>
            <Icon name="pencil" size={16} color="text/brand" />
          </Pressable>
          <View style={styles.pill}>
            <View style={styles.dot} />
            <Text style={[type('Body/Small', 'Medium'), { color: color['text/primary'] }]}>{account.status === 'on' ? c.backedUp : c.saved}</Text>
          </View>
          {accountsAvailable && account.ready && !signedIn ? (
            <Button label={c.backUp} size="Medium" iconLeft="refresh" onPress={() => router.push('/account')} />
          ) : null}
        </View>

        <View style={styles.list}>
          {signedIn ? (
            <>
              <ListRow title={c.account} icon="user-circle" trailing="Value" value={account.status === 'on' ? c.accountOn : c.accountNeeds} onPress={() => router.push('/account/manage')} />
              <Divider inset={0} />
            </>
          ) : null}
          <ListRow title={c.premium} icon="sparkles" trailing="Value" value={premium ? c.premiumOn : c.premiumOff} onPress={() => router.push('/premium')} />
          {!premium && adChoicesRequired ? (
            <>
              <Divider inset={0} />
              <ListRow title={c.adChoices} icon="sliders" onPress={() => showAdChoices().catch(() => {})} />
            </>
          ) : null}
        </View>

        <SectionHeader title={c.settings} />
        <View style={styles.list}>
          <ListRow title={c.cycle} subtitle={c.cycleSub} icon="drop" onPress={() => router.push('/settings/cycle')} />
          <Divider inset={0} />
          <ListRow title={c.reminders} icon="bell-ring" trailing="Value" value={reminder.enabled ? common.on : common.off} onPress={() => router.push('/settings/reminders')} />
          <Divider inset={0} />
          <ListRow title={c.data} subtitle={c.dataSub} icon="folder-user" onPress={() => router.push('/data')} />
          <Divider inset={0} />
          <ListRow
            title={c.lock}
            icon="lock"
            trailing="Value"
            value={lock.enabled ? (lock.biometrics && biometric ? biometric[0].toLocaleUpperCase(lang) + biometric.slice(1) : c.passcode) : common.off}
            onPress={() => router.push('/settings/lock')}
          />
          <Divider inset={0} />
          <ListRow
            title={c.language}
            icon="globe"
            trailing="Value"
            value={LANGUAGES.find((l) => l.id === lang)?.name}
            onPress={() => router.push('/settings/language')}
          />
          <Divider inset={0} />
          <ListRow title={c.appIcon} icon="smartphone" onPress={() => router.push('/settings/icon')} />
        </View>

        <SectionHeader title={c.about} />
        <View style={styles.list}>
          <ListRow title={c.aboutApp} icon="info" trailing="Value" value={APP_VERSION.replace(/\.0$/, '')} onPress={() => router.push('/about')} />
          <Divider inset={0} />
          <ListRow title={c.privacy} icon="shield" onPress={() => router.push('/about/privacy')} />
          <Divider inset={0} />
          <ListRow title={c.terms} icon="file-text" onPress={() => router.push('/about/terms')} />
        </View>

        {__DEV__ ? (
          <View style={styles.dev}>
            <Text style={[type('Caption'), { color: color['text/tertiary'] }]}>Developer</Text>
            <Button label="See components" type="Secondary" size="Small" onPress={() => router.push('/gallery')} />
            <Button label="See tokens" type="Secondary" size="Small" onPress={() => router.push('/tokens')} />
            <Button
              label="Restart onboarding"
              type="Ghost"
              size="Small"
              onPress={() => {
                resetOnboarding();
                resetLog();
                resetLock();
                router.replace('/');
              }}
            />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color['bg/canvas'] },
  content: { paddingHorizontal: layout.gutter, gap: 12 },
  name: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  profile: { alignItems: 'center', gap: 12, paddingVertical: 24, paddingHorizontal: 20, borderRadius: radius.xl, backgroundColor: color['surface/muted'] },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: color['surface/default'] },
  dot: { width: 6, height: 6, borderRadius: 999, backgroundColor: color['text/primary'] },
  list: { borderRadius: radius.xl, borderWidth: 1, borderColor: color['border/subtle'], backgroundColor: color['surface/default'], overflow: 'hidden' },
  dev: { marginTop: 12, gap: 8, alignItems: 'flex-start' },
});
