import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthPage, Banner, Button, Input, useAuthProblems } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { authProblem, sendPasswordReset, type AuthProblem } from '../../lib/account';

const COPY = defineCopy({
  en: {
    title: 'Reset password',
    heading: 'Forgot your password?',
    body: 'Enter the email you signed up with. We’ll send a link to set a new password.',
    note: 'This resets your sign-in password only. Your Nilemy password, which opens your backup, stays the same.',
    email: 'Email',
    send: 'Send reset link',
    sentTitle: 'Check your email',
    sent: (email: string) => `If there’s an account for ${email}, a reset link is on its way. Check your spam folder too.`,
    back: 'Back to sign in',
    resend: 'Didn’t get it? Resend email',
  },
  tr: {
    title: 'Parolayı sıfırla',
    heading: 'Parolanı mı unuttun?',
    body: 'Kayıt olduğun e-postayı yaz. Yeni parola belirlemen için bir bağlantı gönderelim.',
    note: 'Bu yalnızca giriş parolanı sıfırlar. Yedeğini açan Nilemy parolan aynı kalır.',
    email: 'E-posta',
    send: 'Bağlantıyı gönder',
    sentTitle: 'E-postanı kontrol et',
    sent: (email: string) => `${email} için bir hesap varsa sıfırlama bağlantısı yolda. İstenmeyen klasörüne de bak.`,
    back: 'Girişe dön',
    resend: 'Gelmedi mi? Tekrar gönder',
  },
});

// F6 Reset password and F7 sent.
export default function ResetPassword() {
  const c = useCopy(COPY);
  const problems = useAuthProblems();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<AuthProblem | null>(null);

  const send = async () => {
    setBusy(true);
    setProblem(null);
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch (e) {
      const p = authProblem(e);
      // Don't reveal whether an account exists for this email.
      if (p === 'wrong') setSent(true);
      else setProblem(p);
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <AuthPage heading={c.sentTitle} intro={c.sent(email.trim())} onBack={router.back}>
        <View style={styles.actions}>
          <Button label={c.back} fullWidth onPress={router.back} />
          <Button label={c.resend} type="Ghost" size="Medium" fullWidth loading={busy} onPress={send} />
        </View>
      </AuthPage>
    );
  }

  return (
    <AuthPage heading={c.heading} intro={c.body} onBack={router.back}>
      {problem && problem !== 'cancelled' ? <Banner kind={problem === 'offline' ? 'Warning' : 'Error'} message={problems[problem]} /> : null}
      <Input pill label={c.email} iconLeft="mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" autoFocus disabled={busy} onSubmitEditing={send} />
      <Button label={c.send} fullWidth loading={busy} disabled={busy || !email.trim()} onPress={send} />
      <Banner message={c.note} />
    </AuthPage>
  );
}

const styles = StyleSheet.create({
  actions: { gap: 4 },
});
