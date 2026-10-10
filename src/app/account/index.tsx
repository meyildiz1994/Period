import * as AppleAuthentication from 'expo-apple-authentication';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Banner, Button, IconBadge, LegalLine, Page, useAuthProblems } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { appleAvailable, authProblem, signInWith, type AuthProblem } from '../../lib/account';
import { afterSignIn, type Then } from '../../lib/accountFlow';
import { color, type } from '../../theme';

const COPY = defineCopy({
  en: {
    title: 'Account',
    heading: 'Keep your logs safe',
    intro: 'Optional. With an account your logs are backed up end-to-end encrypted, so you can restore them on a new phone. Nilemy works fully without one.',
    google: 'Continue with Google',
    email: 'Sign up with email',
    haveEmail: 'Signed up with email?',
    signIn: 'Sign in',
    errorTitle: 'Couldn’t sign in',
  },
  tr: {
    title: 'Hesap',
    heading: 'Kayıtların güvende kalsın',
    intro: 'İsteğe bağlı. Hesapla kayıtların uçtan uca şifrelenerek yedeklenir; yeni bir telefonda geri yükleyebilirsin. Nilemy hesapsız da tamamen çalışır.',
    google: 'Google ile devam et',
    email: 'E-posta ile kayıt ol',
    haveEmail: 'E-postayla mı kayıt oldun?',
    signIn: 'Giriş yap',
    errorTitle: 'Giriş yapılamadı',
  },
});

// F1 Create account / sign in: Apple (iPhone), Google or email. Opened from Welcome (then=onboarding),
// Me or Your data. The Nilemy password comes next (account/password).
export default function Account() {
  const c = useCopy(COPY);
  const problems = useAuthProblems();
  const { then } = useLocalSearchParams<{ then?: Then }>();
  const [busy, setBusy] = useState<'google' | 'apple' | null>(null);
  const [problem, setProblem] = useState<AuthProblem | null>(null);

  const go = async (method: 'google' | 'apple') => {
    setBusy(method);
    setProblem(null);
    try {
      if (await signInWith(method)) afterSignIn(then);
    } catch (e) {
      const p = authProblem(e);
      if (p !== 'cancelled') setProblem(p);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Page title={c.title} onBack={router.back}>
      <View style={styles.hero}>
        <IconBadge icon="shield-lock" size={64} />
        <Text accessibilityRole="header" style={[type('Title/Medium', 'Bold'), styles.center, { color: color['text/primary'] }]}>{c.heading}</Text>
        <Text style={[type('Body/Medium'), styles.center, { color: color['text/secondary'] }]}>{c.intro}</Text>
      </View>
      {problem ? <Banner kind={problem === 'offline' ? 'Warning' : 'Error'} title={c.errorTitle} message={problems[problem]} /> : null}
      <View style={styles.buttons}>
        {appleAvailable ? (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={28}
            style={styles.apple}
            onPress={() => (busy ? undefined : go('apple'))}
          />
        ) : null}
        <Button label={c.google} type="Outline" fullWidth loading={busy === 'google'} disabled={!!busy} onPress={() => go('google')} />
        <Button label={c.email} type="Secondary" iconLeft="mail" fullWidth disabled={!!busy} onPress={() => router.push({ pathname: '/account/email', params: { mode: 'signup', then } })} />
      </View>
      <View style={styles.row}>
        <Text style={[type('Body/Medium'), { color: color['text/secondary'] }]}>{c.haveEmail}</Text>
        <Text
          accessibilityRole="link"
          onPress={() => router.push({ pathname: '/account/email', params: { mode: 'signin', then } })}
          style={[type('Body/Medium', 'SemiBold'), { color: color['text/brand'] }]}
        >
          {c.signIn}
        </Text>
      </View>
      <LegalLine />
    </Page>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: 12, paddingTop: 8 },
  center: { textAlign: 'center' },
  buttons: { gap: 12, marginTop: 8 },
  apple: { height: 56, width: '100%' },
  row: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 6 },
});
