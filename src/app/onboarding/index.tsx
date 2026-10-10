import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Dialog, Icon, LanguageSwitch, LogoFull } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { accountsAvailable } from '../../lib/account';
import { color, layout, type } from '../../theme';

const COPY = defineCopy({
  en: {
    welcome: 'Welcome to',
    welcomeLabel: 'Welcome to Nilemy',
    intro: 'Log your period in seconds, see what your cycle is doing and plan ahead.',
    start: 'Get started',
    account: 'Sign up or sign in',
    noAccount: 'Continue without signing in',
    localTitle: 'Your logs stay only on this phone',
    localBody: 'If you delete the app or lose your phone, your logs are lost too. You can create an account any time from Me to back them up.',
    continue: 'Continue',
    privacy: 'Your logs are encrypted on this phone.',
  },
  tr: {
    welcome: 'Hoş geldin',
    welcomeLabel: 'Nilemy’ye hoş geldin',
    intro: 'Adetini saniyeler içinde kaydet, döngünde neler olduğunu gör ve önünü planla.',
    start: 'Başlayalım',
    account: 'Kayıt ol ya da giriş yap',
    noAccount: 'Giriş yapmadan devam et',
    localTitle: 'Bilgilerin yalnızca bu telefonda saklanır',
    localBody: 'Uygulamayı silersen ya da telefonunu kaybedersen kayıtların da kaybolur. İstediğin zaman Ben sekmesinden hesap açıp yedekleyebilirsin.',
    continue: 'Devam et',
    privacy: 'Kayıtların bu telefonda şifreli durur.',
  },
});

// A1 Welcome: "Welcome to" over the full logo (mark and wordmark), then the intro line. With
// accounts (1.2): sign up / sign in first, or continue on this phone only after a warning.
export default function Welcome() {
  const insets = useSafeAreaInsets();
  const c = useCopy(COPY);
  const [local, setLocal] = useState(false);
  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) }]}>
      <View style={styles.corner}>
        <LanguageSwitch />
      </View>
      <View style={styles.top}>
        <Text accessibilityRole="header" accessibilityLabel={c.welcomeLabel} style={[type('Title/Large', 'Bold'), styles.title]}>{c.welcome}</Text>
        <View style={styles.logo}>
          <LogoFull width={220} />
        </View>
        <Text style={[type('Body/Medium'), styles.body]}>
          {c.intro}
        </Text>
        <View style={styles.cta}>
          {accountsAvailable ? (
            <>
              <Button label={c.account} fullWidth onPress={() => router.push({ pathname: '/account', params: { then: 'onboarding' } })} />
              <Button label={c.noAccount} type="Ghost" fullWidth onPress={() => setLocal(true)} />
            </>
          ) : (
            <Button label={c.start} fullWidth onPress={() => router.push('/onboarding/name')} />
          )}
        </View>
      </View>

      <View style={styles.privacy}>
        <Icon name="lock" size={16} color="text/secondary" />
        <Text style={[type('Caption'), { color: color['text/secondary'] }]}>{c.privacy}</Text>
      </View>
      <Dialog
        visible={local}
        title={c.localTitle}
        body={c.localBody}
        confirmLabel={c.continue}
        onConfirm={() => {
          setLocal(false);
          router.push('/onboarding/name');
        }}
        onCancel={() => setLocal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color['bg/canvas'], justifyContent: 'space-between' },
  corner: { alignItems: 'flex-end', paddingHorizontal: layout.gutter, paddingTop: 8 },
  top: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: layout.gutter },
  logo: { marginTop: 24 },
  title: { textAlign: 'center', color: color['text/primary'] },
  body: { marginTop: 32, textAlign: 'center', color: color['text/secondary'], maxWidth: 300 },
  // 50 pt under the intro line (user's call), so the button sits with the welcome, not the bottom edge.
  cta: { marginTop: 50, alignSelf: 'stretch', paddingHorizontal: 24 - layout.gutter, gap: 8 },
  privacy: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingBottom: 8 },
});
