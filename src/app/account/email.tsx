import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthPage, Banner, Button, Checkbox, Input, PasswordInput, useAuthProblems } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { authProblem, signInWithEmail, signUpWithEmail, type AuthProblem } from '../../lib/account';
import { afterSignIn, type Then } from '../../lib/accountFlow';
import { PASSWORD_MIN } from '../../lib/vault';
import { color, type } from '../../theme';

const COPY = defineCopy({
  en: {
    signupTitle: 'Create an account',
    signupBody: 'Optional. An account lets you restore your logs on a new phone. Nilemy works fully without one.',
    signinTitle: 'Welcome back',
    signinBody: 'Sign in to restore your backed-up logs.',
    email: 'Email',
    password: 'Password',
    min: `At least ${PASSWORD_MIN} characters.`,
    agree: 'I agree to the Terms of service and the Privacy policy',
    agreeNeeded: 'Required to create an account.',
    create: 'Create account',
    signIn: 'Sign in',
    forgot: 'Forgot password?',
    haveAccount: 'Already have an account?',
    newHere: 'New to Nilemy?',
    signupError: 'Couldn’t create the account',
    signinError: 'Couldn’t sign in',
    caseSensitive: 'Passwords are case-sensitive.',
  },
  tr: {
    signupTitle: 'Hesap oluştur',
    signupBody: 'İsteğe bağlı. Hesapla kayıtlarını yeni bir telefonda geri yükleyebilirsin. Nilemy hesapsız da tamamen çalışır.',
    signinTitle: 'Tekrar hoş geldin',
    signinBody: 'Yedeklenen kayıtlarını geri yüklemek için giriş yap.',
    email: 'E-posta',
    password: 'Parola',
    min: `En az ${PASSWORD_MIN} karakter.`,
    agree: 'Kullanım koşullarını ve Gizlilik politikasını kabul ediyorum',
    agreeNeeded: 'Hesap oluşturmak için gerekli.',
    create: 'Hesap oluştur',
    signIn: 'Giriş yap',
    forgot: 'Parolanı mı unuttun?',
    haveAccount: 'Zaten hesabın var mı?',
    newHere: 'Nilemy’de yeni misin?',
    signupError: 'Hesap oluşturulamadı',
    signinError: 'Giriş yapılamadı',
    caseSensitive: 'Parolalarda büyük-küçük harf fark eder.',
  },
});

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// F1–F4 Create account / Sign in with email and password (Firebase Authentication).
export default function EmailAccount() {
  const c = useCopy(COPY);
  const problems = useAuthProblems();
  const params = useLocalSearchParams<{ mode?: 'signup' | 'signin'; then?: Then }>();
  const [mode, setMode] = useState(params.mode ?? 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<AuthProblem | null>(null);
  const signup = mode === 'signup';

  const emailError = tried && !EMAIL.test(email.trim()) ? problems.email : undefined;
  const passwordError = tried && signup && password.length < PASSWORD_MIN ? problems.weak : problem === 'wrong' ? c.caseSensitive : undefined;
  const agreeError = tried && signup && !agreed;

  const submit = async () => {
    setTried(true);
    setProblem(null);
    if (!EMAIL.test(email.trim()) || (signup && (password.length < PASSWORD_MIN || !agreed)) || !password) return;
    setBusy(true);
    try {
      if (signup) await signUpWithEmail(email, password);
      else await signInWithEmail(email, password);
      afterSignIn(params.then);
    } catch (e) {
      setProblem(authProblem(e));
    } finally {
      setBusy(false);
    }
  };

  const switchMode = () => {
    setMode(signup ? 'signin' : 'signup');
    setTried(false);
    setProblem(null);
  };

  return (
    <AuthPage heading={signup ? c.signupTitle : c.signinTitle} intro={signup ? c.signupBody : c.signinBody} onBack={router.back}>
      {problem && problem !== 'cancelled' ? (
        <Banner kind={problem === 'offline' ? 'Warning' : 'Error'} title={signup ? c.signupError : c.signinError} message={problems[problem]} />
      ) : null}
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
          textContentType={signup ? 'username' : 'emailAddress'}
          disabled={busy}
        />
        <PasswordInput
          pill
          label={c.password}
          value={password}
          onChangeText={setPassword}
          helper={signup ? c.min : undefined}
          error={passwordError}
          autoComplete={signup ? 'new-password' : 'current-password'}
          textContentType={signup ? 'newPassword' : 'password'}
          disabled={busy}
          onSubmitEditing={submit}
        />
      </View>
      {signup ? (
        <View style={styles.agree}>
          <Checkbox checked={agreed} onChange={setAgreed} label={c.agree} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[type('Body/Small'), { color: color['text/secondary'] }]} onPress={() => setAgreed(!agreed)}>{c.agree}</Text>
            {agreeError ? <Text style={[type('Caption'), { color: color['feedback/danger'] }]}>{c.agreeNeeded}</Text> : null}
          </View>
        </View>
      ) : (
        <Text accessibilityRole="link" onPress={() => router.push({ pathname: '/account/reset', params: { email } })} style={[type('Body/Small', 'SemiBold'), styles.forgot, { color: color['text/brand'] }]}>
          {c.forgot}
        </Text>
      )}
      <Button label={signup ? c.create : c.signIn} fullWidth loading={busy} disabled={busy} onPress={submit} />
      <View style={styles.row}>
        <Text style={[type('Body/Medium'), { color: color['text/secondary'] }]}>{signup ? c.haveAccount : c.newHere}</Text>
        <Text accessibilityRole="button" onPress={switchMode} style={[type('Body/Medium', 'SemiBold'), { color: color['text/brand'] }]}>
          {signup ? c.signIn : c.create}
        </Text>
      </View>
    </AuthPage>
  );
}

const styles = StyleSheet.create({
  fields: { gap: 12 },
  agree: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  forgot: { alignSelf: 'flex-end', marginTop: -4 },
  row: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 6 },
});
