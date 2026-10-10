import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { BackHandler, Share, StyleSheet, Text, View } from 'react-native';

import { Banner, Button, Checkbox, IconBadge, Page } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { finishAccount, type Then } from '../../lib/accountFlow';
import { formatRecoveryCode } from '../../lib/vault';
import { getAccount, setAccount } from '../../state/account';
import { color, fontFamily, radius, type } from '../../theme';

const COPY = defineCopy({
  en: {
    title: 'Recovery code',
    heading: 'Save your recovery code',
    body: 'If you forget your Nilemy password, this code is the only way to open your backup. We can’t show it again or recover it for you.',
    save: 'Save or share the code',
    shareMessage: (code: string) => `Nilemy recovery code: ${code}`,
    tips: 'Keep it somewhere private, like a password manager or a note only you can open. Anyone with the code and your sign-in can open your backup.',
    saved: 'I saved my recovery code somewhere safe',
    continue: 'Continue',
  },
  tr: {
    title: 'Kurtarma kodu',
    heading: 'Kurtarma kodunu kaydet',
    body: 'Nilemy parolanı unutursan yedeğini açmanın tek yolu bu kod. Bu kodu bir daha gösteremeyiz ve senin için kurtaramayız.',
    save: 'Kodu kaydet ya da paylaş',
    shareMessage: (code: string) => `Nilemy kurtarma kodu: ${code}`,
    tips: 'Bir parola yöneticisi ya da yalnızca senin açabildiğin bir not gibi gizli bir yerde sakla. Kodu ve giriş bilgilerini bilen herkes yedeğini açabilir.',
    saved: 'Kurtarma kodumu güvenli bir yere kaydettim',
    continue: 'Devam et',
  },
});

// Shown once after creating the Nilemy password or using the recovery code. The code lives only
// in memory (state/account newCode) and is forgotten when the person continues.
export default function RecoveryCode() {
  const c = useCopy(COPY);
  const { then } = useLocalSearchParams<{ then?: Then }>();
  const [code] = useState(() => getAccount().newCode ?? '');
  const [saved, setSaved] = useState(false);
  const shown = formatRecoveryCode(code);

  // Going back would skip the code; it has to be confirmed first.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  const done = () => {
    setAccount({ newCode: null });
    finishAccount(then);
  };

  return (
    <Page title={c.title} onBack={() => {}} footer={<Button label={c.continue} fullWidth disabled={!saved} onPress={done} />}>
      <Stack.Screen options={{ gestureEnabled: false }} />
      <View style={styles.hero}>
        <IconBadge icon="key" size={64} />
        <Text accessibilityRole="header" style={[type('Title/Medium', 'Bold'), styles.center, { color: color['text/primary'] }]}>{c.heading}</Text>
        <Text style={[type('Body/Medium'), styles.center, { color: color['text/secondary'] }]}>{c.body}</Text>
      </View>
      <View style={styles.code}>
        <Text selectable accessibilityLabel={shown.split('').join(' ')} style={[styles.codeText, { color: color['text/primary'] }]}>{shown}</Text>
      </View>
      <Button label={c.save} type="Secondary" iconLeft="share" fullWidth onPress={() => Share.share({ message: c.shareMessage(shown) }).catch(() => {})} />
      <Banner kind="Warning" message={c.tips} />
      <View style={styles.check}>
        <Checkbox checked={saved} onChange={setSaved} label={c.saved} />
        <Text style={[type('Body/Medium'), { flex: 1, color: color['text/primary'] }]} onPress={() => setSaved(!saved)}>{c.saved}</Text>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: 12, paddingTop: 8 },
  center: { textAlign: 'center' },
  code: { padding: 20, borderRadius: radius.xl, borderWidth: 1, borderColor: color['border/subtle'], backgroundColor: color['surface/muted'], alignItems: 'center' },
  codeText: { fontFamily: fontFamily.SemiBold, fontSize: 20, lineHeight: 30, letterSpacing: 1, textAlign: 'center' },
  check: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
