import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthPage, Banner, Button, Checkbox, PasswordInput, Toast } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { changeVaultPassword, createVault, unlockVault } from '../../lib/account';
import { finishAccount, type Then } from '../../lib/accountFlow';
import { PASSWORD_MIN } from '../../lib/vault';
import { setAccount } from '../../state/account';
import { color, radius, type } from '../../theme';

type Mode = 'create' | 'unlock' | 'change';

const COPY = defineCopy({
  en: {
    title: 'Nilemy password',
    createHeading: 'Create your Nilemy password',
    createBody: 'Your logs are encrypted on this phone with this password before they’re backed up. We and Google never learn it and can’t read your backup.',
    createNote: 'Use a different password from your email or Google account. If you forget it, only the recovery code you’ll get next can open your backup.',
    unlockHeading: 'Open your backup',
    unlockBody: 'This account has an encrypted backup. Enter your Nilemy password to open it on this phone.',
    changeHeading: 'Change your Nilemy password',
    changeBody: 'Your backup will open with the new password from now on. Your recovery code stays the same.',
    password: 'Nilemy password',
    newPassword: 'New Nilemy password',
    repeat: 'Enter it again',
    min: `At least ${PASSWORD_MIN} characters.`,
    tooShort: `Use at least ${PASSWORD_MIN} characters.`,
    mismatch: 'The passwords don’t match.',
    wrong: 'That isn’t the Nilemy password for this backup.',
    consentTitle: 'Explicit consent',
    consent:
      'I consent to my period and health logs (dates, flow, pain, mood, energy, symptoms and notes) being encrypted on this phone and stored, encrypted, on Google’s servers in the EU (Firebase), and to my account details being processed on Google’s servers abroad, including the US, to back up and sync my logs. I can withdraw this at any time by deleting my account.',
    consentNeeded: 'Needed to back up your logs. Without it you can keep using Nilemy without an account.',
    details: 'Read the privacy policy',
    forgot: 'Forgot your Nilemy password?',
    working: 'Securing your backup…',
    continue: 'Continue',
    open: 'Open backup',
    save: 'Save new password',
    failed: 'Something went wrong. Check your connection and try again.',
    changed: 'Nilemy password changed.',
  },
  tr: {
    title: 'Nilemy parolası',
    createHeading: 'Nilemy parolanı oluştur',
    createBody: 'Kayıtların yedeklenmeden önce bu telefonda bu parolayla şifrelenir. Biz ve Google bu parolayı hiç öğrenmeyiz, yedeğini okuyamayız.',
    createNote: 'E-posta ya da Google hesabındakinden farklı bir parola kullan. Unutursan yedeğini yalnızca birazdan vereceğimiz kurtarma kodu açabilir.',
    unlockHeading: 'Yedeğini aç',
    unlockBody: 'Bu hesapta şifreli bir yedek var. Bu telefonda açmak için Nilemy parolanı gir.',
    changeHeading: 'Nilemy parolanı değiştir',
    changeBody: 'Yedeğin bundan sonra yeni parolayla açılır. Kurtarma kodun aynı kalır.',
    password: 'Nilemy parolası',
    newPassword: 'Yeni Nilemy parolası',
    repeat: 'Tekrar yaz',
    min: `En az ${PASSWORD_MIN} karakter.`,
    tooShort: `En az ${PASSWORD_MIN} karakter kullan.`,
    mismatch: 'Parolalar aynı değil.',
    wrong: 'Bu, bu yedeğin Nilemy parolası değil.',
    consentTitle: 'Açık rıza',
    consent:
      'Adet ve sağlık kayıtlarımın (tarihler, akış, ağrı, ruh hali, enerji, belirtiler ve notlar) bu telefonda şifrelenip şifreli hâliyle Google’ın Avrupa Birliği’ndeki sunucularında (Firebase) saklanmasına ve hesap bilgilerimin kayıtlarımı yedeklemek ve eşitlemek için Google’ın ABD dahil yurt dışındaki sunucularında işlenmesine açık rıza veriyorum. Bu rızayı hesabımı silerek istediğim zaman geri alabilirim.',
    consentNeeded: 'Kayıtlarını yedeklemek için gerekli. Vermezsen Nilemy’yi hesapsız kullanmaya devam edebilirsin.',
    details: 'Gizlilik politikasını oku',
    forgot: 'Nilemy parolanı mı unuttun?',
    working: 'Yedeğin güvenceye alınıyor…',
    continue: 'Devam et',
    open: 'Yedeği aç',
    save: 'Yeni parolayı kaydet',
    failed: 'Bir şeyler ters gitti. Bağlantını kontrol edip tekrar dene.',
    changed: 'Nilemy parolan değişti.',
  },
});

// The Nilemy password that encrypts the backup (lib/vault.ts). create: first time for this
// account, with the explicit consent (KVKK) and then the recovery code. unlock: the account has a
// backup but this phone doesn't have its key. change: from Account.
export default function NilemyPassword() {
  const c = useCopy(COPY);
  const params = useLocalSearchParams<{ mode?: Mode; then?: Then }>();
  const mode: Mode = params.mode ?? 'create';
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [consent, setConsent] = useState(false);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<'wrong' | 'failed' | null>(null);
  const [done, setDone] = useState(false);
  const making = mode !== 'unlock';

  const shortError = tried && making && password.length < PASSWORD_MIN ? c.tooShort : undefined;
  const repeatError = tried && making && repeat !== password ? c.mismatch : undefined;
  const consentMissing = tried && mode === 'create' && !consent;

  const submit = async () => {
    setTried(true);
    setError(null);
    if (!password || (making && (password.length < PASSWORD_MIN || repeat !== password)) || (mode === 'create' && !consent)) return;
    setBusy(true);
    try {
      if (mode === 'create') {
        const code = await createVault(password);
        // Another phone set up the backup meanwhile: open it with that password instead.
        if (!code) return router.setParams({ mode: 'unlock' });
        setAccount({ newCode: code });
        router.replace({ pathname: '/account/code', params: { then: params.then } });
      } else if (mode === 'unlock') {
        if (await unlockVault(password)) finishAccount(params.then);
        else setError('wrong');
      } else {
        await changeVaultPassword(password);
        setDone(true);
        setTimeout(() => router.back(), 1200);
      }
    } catch {
      setError('failed');
    } finally {
      setBusy(false);
    }
  };

  const heading = mode === 'create' ? c.createHeading : mode === 'unlock' ? c.unlockHeading : c.changeHeading;
  const body = mode === 'create' ? c.createBody : mode === 'unlock' ? c.unlockBody : c.changeBody;
  const action = mode === 'create' ? c.continue : mode === 'unlock' ? c.open : c.save;

  return (
    <AuthPage heading={heading} intro={body} onBack={router.back} overlay={done ? <Toast message={c.changed} /> : null}>
      {error === 'failed' ? <Banner kind="Error" message={c.failed} /> : null}
      <View style={styles.fields}>
        <PasswordInput
          pill
          label={mode === 'change' ? c.newPassword : c.password}
          value={password}
          onChangeText={setPassword}
          helper={making ? c.min : undefined}
          error={error === 'wrong' ? c.wrong : shortError}
          autoComplete={making ? 'new-password' : 'current-password'}
          textContentType={making ? 'newPassword' : 'password'}
          disabled={busy}
          autoFocus
        />
        {making ? (
          <PasswordInput pill label={c.repeat} value={repeat} onChangeText={setRepeat} error={repeatError} autoComplete="new-password" textContentType="newPassword" disabled={busy} />
        ) : null}
      </View>
      {mode === 'create' ? (
        <>
          <Banner kind="Warning" message={c.createNote} />
          <View style={[styles.consent, consentMissing && { borderColor: color['feedback/danger'] }]}>
            <Text style={[type('Body/Default', 'SemiBold'), { color: color['text/primary'] }]}>{c.consentTitle}</Text>
            <View style={styles.check}>
              <Checkbox checked={consent} onChange={setConsent} label={c.consentTitle} />
              <Text style={[type('Body/Small'), { flex: 1, color: color['text/secondary'] }]} onPress={() => setConsent(!consent)}>{c.consent}</Text>
            </View>
            {consentMissing ? <Text style={[type('Caption'), { color: color['feedback/danger'] }]}>{c.consentNeeded}</Text> : null}
            <Text accessibilityRole="link" onPress={() => router.push('/about/privacy')} style={[type('Body/Small', 'SemiBold'), { color: color['text/brand'] }]}>{c.details}</Text>
          </View>
        </>
      ) : null}
      {mode === 'unlock' ? (
        <Text accessibilityRole="link" onPress={() => router.push({ pathname: '/account/recover', params: { then: params.then } })} style={[type('Body/Medium', 'SemiBold'), styles.right, { color: color['text/brand'] }]}>
          {c.forgot}
        </Text>
      ) : null}
      <Button label={busy && making ? c.working : action} fullWidth loading={busy} disabled={busy} onPress={submit} />
    </AuthPage>
  );
}

const styles = StyleSheet.create({
  fields: { gap: 12 },
  right: { alignSelf: 'flex-end', marginTop: -4 },
  consent: { gap: 10, padding: 16, borderRadius: radius.xl, borderWidth: 1, borderColor: color['border/subtle'], backgroundColor: color['surface/default'] },
  check: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
});
