import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { Banner, Button, Input, Page, PasswordInput } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { recoverVault } from '../../lib/account';
import type { Then } from '../../lib/accountFlow';
import { normalizeRecoveryCode, PASSWORD_MIN } from '../../lib/vault';
import { setAccount } from '../../state/account';
import { color, type } from '../../theme';

const COPY = defineCopy({
  en: {
    title: 'Recovery code',
    heading: 'Use your recovery code',
    body: 'Enter the recovery code you saved when you created your Nilemy password, then choose a new password. You’ll get a new recovery code.',
    code: 'Recovery code',
    codeHelp: '32 letters and numbers, dashes optional.',
    badCode: 'That doesn’t look like a recovery code.',
    wrongCode: 'This recovery code doesn’t open this backup.',
    password: 'New Nilemy password',
    repeat: 'Enter it again',
    tooShort: `Use at least ${PASSWORD_MIN} characters.`,
    mismatch: 'The passwords don’t match.',
    lost: 'Without your Nilemy password or recovery code, nobody can open the backup, not even us. Your logs on this phone are not affected.',
    open: 'Open backup',
    working: 'Opening your backup…',
    failed: 'Something went wrong. Check your connection and try again.',
  },
  tr: {
    title: 'Kurtarma kodu',
    heading: 'Kurtarma kodunu kullan',
    body: 'Nilemy parolanı oluştururken kaydettiğin kurtarma kodunu yaz, sonra yeni bir parola seç. Sana yeni bir kurtarma kodu verilecek.',
    code: 'Kurtarma kodu',
    codeHelp: '32 harf ve rakam; tireler isteğe bağlı.',
    badCode: 'Bu bir kurtarma koduna benzemiyor.',
    wrongCode: 'Bu kurtarma kodu bu yedeği açmıyor.',
    password: 'Yeni Nilemy parolası',
    repeat: 'Tekrar yaz',
    tooShort: `En az ${PASSWORD_MIN} karakter kullan.`,
    mismatch: 'Parolalar aynı değil.',
    lost: 'Nilemy parolan ya da kurtarma kodun olmadan yedeği kimse açamaz, biz de. Bu telefondaki kayıtların bundan etkilenmez.',
    open: 'Yedeği aç',
    working: 'Yedeğin açılıyor…',
    failed: 'Bir şeyler ters gitti. Bağlantını kontrol edip tekrar dene.',
  },
});

// Forgot the Nilemy password: the recovery code opens the backup and a new password replaces it.
export default function Recover() {
  const c = useCopy(COPY);
  const { then } = useLocalSearchParams<{ then?: Then }>();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<'wrongCode' | 'failed' | null>(null);

  const codeError = error === 'wrongCode' ? c.wrongCode : tried && !normalizeRecoveryCode(code) ? c.badCode : undefined;
  const shortError = tried && password.length < PASSWORD_MIN ? c.tooShort : undefined;
  const repeatError = tried && repeat !== password ? c.mismatch : undefined;

  const submit = async () => {
    setTried(true);
    setError(null);
    if (!normalizeRecoveryCode(code) || password.length < PASSWORD_MIN || repeat !== password) return;
    setBusy(true);
    try {
      const next = await recoverVault(code, password);
      if (!next) return setError('wrongCode');
      setAccount({ newCode: next });
      router.replace({ pathname: '/account/code', params: { then } });
    } catch {
      setError('failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page title={c.title} onBack={router.back} footer={<Button label={busy ? c.working : c.open} fullWidth loading={busy} disabled={busy} onPress={submit} />}>
      <Text accessibilityRole="header" style={[type('Title/Medium', 'Bold'), { color: color['text/primary'] }]}>{c.heading}</Text>
      <Text style={[type('Body/Medium'), { color: color['text/secondary'] }]}>{c.body}</Text>
      {error === 'failed' ? <Banner kind="Error" message={c.failed} /> : null}
      <Input label={c.code} iconLeft="key" value={code} onChangeText={setCode} helper={c.codeHelp} error={codeError} autoCapitalize="characters" autoCorrect={false} disabled={busy} autoFocus />
      <PasswordInput label={c.password} value={password} onChangeText={setPassword} error={shortError} autoComplete="new-password" textContentType="newPassword" disabled={busy} />
      <PasswordInput label={c.repeat} value={repeat} onChangeText={setRepeat} error={repeatError} autoComplete="new-password" textContentType="newPassword" disabled={busy} />
      <Banner message={c.lost} />
    </Page>
  );
}
