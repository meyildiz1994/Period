import * as AppleAuthentication from 'expo-apple-authentication';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Banner, Button, Dialog, GoogleMark, Input, LanguageSwitch, LegalLine, LogoFull, PasswordInput, ProviderButton, WelcomeHero, useAuthProblems,
} from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { accountsAvailable, appleAvailable, authProblem, signInWith, signInWithEmail, type AuthProblem } from '../../lib/account';
import { afterSignIn } from '../../lib/accountFlow';
import { color, layout, type } from '../../theme';

const COPY = defineCopy({
  en: {
    welcome: 'Welcome to',
    welcomeLabel: 'Welcome to Nilemy',
    intro: 'Log your period in seconds, see what your cycle is doing and plan ahead.',
    start: 'Get started',
    tagline: 'Your cycle,\nalways with you.',
    heading: 'Welcome',
    email: 'Email',
    password: 'Password',
    forgot: 'Forgot password?',
    signIn: 'Sign in',
    noAccount: 'Continue without signing in',
    orWith: 'Or continue with',
    google: 'Google',
    newHere: 'Don’t have an account?',
    signUp: 'Sign up',
    errorTitle: 'Couldn’t sign in',
    caseSensitive: 'Passwords are case-sensitive.',
    localTitle: 'Your logs stay only on this phone',
    localBody: 'If you delete the app or lose your phone, your logs are lost too. You can create an account any time from Me to back them up.',
    continue: 'Continue',
  },
  tr: {
    welcome: 'Hoş geldin',
    welcomeLabel: 'Nilemy’ye hoş geldin',
    intro: 'Adetini saniyeler içinde kaydet, döngünde neler olduğunu gör ve önünü planla.',
    start: 'Başlayalım',
    tagline: 'Döngün,\nhep yanında.',
    heading: 'Hoş geldin',
    email: 'E-posta',
    password: 'Parola',
    forgot: 'Parolanı mı unuttun?',
    signIn: 'Giriş yap',
    noAccount: 'Giriş yapmadan devam et',
    orWith: 'ya da şununla devam et',
    google: 'Google',
    newHere: 'Hesabın yok mu?',
    signUp: 'Kayıt ol',
    errorTitle: 'Giriş yapılamadı',
    caseSensitive: 'Parolalarda büyük-küçük harf fark eder.',
    localTitle: 'Bilgilerin yalnızca bu telefonda saklanır',
    localBody: 'Uygulamayı silersen ya da telefonunu kaybedersen kayıtların da kaybolur. İstediğin zaman Ben sekmesinden hesap açıp yedekleyebilirsin.',
    continue: 'Devam et',
  },
});

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A1 Welcome. With accounts: a plum hero (logo, tagline, flower), email sign-in, "Continue
// without signing in" right under the button, Google / Apple, and a link to sign up.
// Without accounts: the logo, intro line and "Get started".
export default function Welcome() {
  return accountsAvailable ? <SignInWelcome /> : <PlainWelcome />;
}

function SignInWelcome() {
  const insets = useSafeAreaInsets();
  const c = useCopy(COPY);
  const problems = useAuthProblems();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState<'email' | 'google' | 'apple' | null>(null);
  const [problem, setProblem] = useState<AuthProblem | null>(null);
  const [local, setLocal] = useState(false);

  const emailError = tried && !EMAIL.test(email.trim()) ? problems.email : undefined;
  const passwordError = problem === 'wrong' ? c.caseSensitive : undefined;

  const run = async (method: 'email' | 'google' | 'apple') => {
    setProblem(null);
    if (method === 'email') {
      setTried(true);
      if (!EMAIL.test(email.trim()) || !password) return;
    }
    setBusy(method);
    try {
      if (method === 'email') {
        await signInWithEmail(email, password);
        afterSignIn('onboarding');
      } else if (await signInWith(method)) {
        afterSignIn('onboarding');
      }
    } catch (e) {
      const p = authProblem(e);
      if (p !== 'cancelled') setProblem(p);
    } finally {
      setBusy(null);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <WelcomeHero tagline={c.tagline} top={insets.top} corner={<LanguageSwitch />} />
        <View style={styles.body}>
          <Text accessibilityRole="header" accessibilityLabel={c.welcomeLabel} style={[type('Title/Medium', 'Bold'), { color: color['text/primary'] }]}>
            {c.heading}
          </Text>
          {problem ? <Banner kind={problem === 'offline' ? 'Warning' : 'Error'} title={c.errorTitle} message={problems[problem]} /> : null}
          <View style={styles.fields}>
            <Input
              pill
              label={c.email}
              iconLeft="mail"
              value={email}
              onChangeText={setEmail}
              error={emailError}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              disabled={!!busy}
            />
            <PasswordInput
              pill
              label={c.password}
              value={password}
              onChangeText={setPassword}
              error={passwordError}
              autoComplete="current-password"
              textContentType="password"
              disabled={!!busy}
              onSubmitEditing={() => run('email')}
            />
          </View>
          <Text
            accessibilityRole="link"
            onPress={() => router.push({ pathname: '/account/reset', params: { email } })}
            style={[type('Body/Small', 'SemiBold'), styles.forgot, { color: color['text/brand'] }]}
          >
            {c.forgot}
          </Text>
          <View style={styles.actions}>
            <Button label={c.signIn} fullWidth loading={busy === 'email'} disabled={!!busy} onPress={() => run('email')} />
            <Button label={c.noAccount} type="Ghost" size="Medium" fullWidth disabled={!!busy} onPress={() => setLocal(true)} />
          </View>
          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={[type('Body/Small'), { color: color['text/tertiary'] }]}>{c.orWith}</Text>
            <View style={styles.line} />
          </View>
          <View style={styles.providers}>
            <ProviderButton label={c.google} disabled={!!busy} onPress={() => run('google')}>
              <GoogleMark />
            </ProviderButton>
            {appleAvailable ? (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE}
                cornerRadius={26}
                style={styles.apple}
                onPress={() => (busy ? undefined : run('apple'))}
              />
            ) : null}
          </View>
          <View style={styles.signUp}>
            <Text style={[type('Body/Medium'), { color: color['text/secondary'] }]}>{c.newHere}</Text>
            <Text
              accessibilityRole="link"
              onPress={() => router.push({ pathname: '/account/email', params: { mode: 'signup', then: 'onboarding' } })}
              style={[type('Body/Medium', 'SemiBold'), { color: color['text/brand'] }]}
            >
              {c.signUp}
            </Text>
          </View>
          <LegalLine />
        </View>
      </ScrollView>
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
    </KeyboardAvoidingView>
  );
}

function PlainWelcome() {
  const insets = useSafeAreaInsets();
  const c = useCopy(COPY);
  return (
    <View style={[styles.screen, styles.plain, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) }]}>
      <View style={styles.corner}>
        <LanguageSwitch />
      </View>
      <View style={styles.top}>
        <Text accessibilityRole="header" accessibilityLabel={c.welcomeLabel} style={[type('Title/Large', 'Bold'), styles.title]}>{c.welcome}</Text>
        <View style={styles.logo}>
          <LogoFull width={220} />
        </View>
        <Text style={[type('Body/Medium'), styles.intro]}>{c.intro}</Text>
        <View style={styles.cta}>
          <Button label={c.start} fullWidth onPress={() => router.push('/onboarding/name')} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color['bg/canvas'] },
  body: { paddingHorizontal: layout.gutter, paddingTop: 24, gap: 16 },
  fields: { gap: 12 },
  forgot: { alignSelf: 'flex-end', marginTop: -4 },
  actions: { gap: 4 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  line: { flex: 1, height: 1, backgroundColor: color['surface/divider'] },
  providers: { flexDirection: 'row', gap: 12 },
  apple: { flex: 1, height: 52 },
  signUp: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 6 },
  plain: { justifyContent: 'space-between' },
  corner: { alignItems: 'flex-end', paddingHorizontal: layout.gutter, paddingTop: 8 },
  top: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: layout.gutter },
  logo: { marginTop: 24 },
  title: { textAlign: 'center', color: color['text/primary'] },
  intro: { marginTop: 32, textAlign: 'center', color: color['text/secondary'], maxWidth: 300 },
  cta: { marginTop: 50, alignSelf: 'stretch', paddingHorizontal: 24 - layout.gutter, gap: 8 },
});
