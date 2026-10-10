import * as AppleAuthentication from 'expo-apple-authentication';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthPage, Banner, Button, GoogleMark, LegalLine, OrDivider, ProviderButton, useAuthProblems } from '../../components';
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
    or: 'or',
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
    or: 'ya da',
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
    <AuthPage heading={c.heading} intro={c.intro} onBack={router.back}>
      {problem ? <Banner kind={problem === 'offline' ? 'Warning' : 'Error'} title={c.errorTitle} message={problems[problem]} /> : null}
      {/* Google first; on iPhone the Apple button sits right under it (Android shows Google only). */}
      <View style={styles.providers}>
        <ProviderButton label={c.google} disabled={!!busy} onPress={() => go('google')}>
          <GoogleMark />
        </ProviderButton>
        {appleAvailable ? (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE}
            cornerRadius={26}
            style={styles.apple}
            onPress={() => (busy ? undefined : go('apple'))}
          />
        ) : null}
      </View>
      <OrDivider label={c.or} />
      <Button label={c.email} iconLeft="mail" fullWidth disabled={!!busy} onPress={() => router.push({ pathname: '/account/email', params: { mode: 'signup', then } })} />
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
    </AuthPage>
  );
}

const styles = StyleSheet.create({
  providers: { gap: 12 },
  apple: { height: 52, width: '100%' },
  row: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 6 },
});
