import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Banner, Button, Checkbox, Dialog, Icon, Page, PasswordInput, useAuthProblems } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { useCommon } from '../../i18n/common';
import { authProblem, deleteAccount, type AuthProblem } from '../../lib/account';
import { useAccount } from '../../state/account';
import { color, radius, type } from '../../theme';
import type { IconName } from '../../theme/icons';

const COPY = defineCopy({
  en: {
    title: 'Delete account',
    heading: 'Delete your account?',
    rows: [
      ['cloud-off', 'Your backup is erased', 'Logs can’t be restored on another phone.', true],
      ['user', 'You’re signed out', 'Your email is removed from our servers.', true],
      ['smartphone', 'This phone keeps its logs', 'Delete them separately in Your data.', false],
    ] as [IconName, string, string, boolean][],
    reauth: 'To confirm it’s you, you’ll be asked to sign in once more.',
    password: 'Sign-in password',
    understand: 'I understand this can’t be undone',
    confirmTitle: 'Delete account permanently?',
    confirmBody: 'Your backup and sign-in are removed. Logs stay on this phone.',
    failedTitle: 'Couldn’t delete the account',
  },
  tr: {
    title: 'Hesabı sil',
    heading: 'Hesabın silinsin mi?',
    rows: [
      ['cloud-off', 'Yedeğin silinir', 'Kayıtların başka bir telefonda geri yüklenemez.', true],
      ['user', 'Oturumun kapanır', 'E-postan sunucularımızdan silinir.', true],
      ['smartphone', 'Bu telefondaki kayıtlar kalır', 'Onları Verilerin bölümünden ayrıca silebilirsin.', false],
    ],
    reauth: 'Sen olduğunu doğrulamak için bir kez daha giriş yapman istenecek.',
    password: 'Giriş parolası',
    understand: 'Bunun geri alınamayacağını anlıyorum',
    confirmTitle: 'Hesap kalıcı olarak silinsin mi?',
    confirmBody: 'Yedeğin ve giriş bilgilerin silinir. Kayıtların bu telefonda kalır.',
    failedTitle: 'Hesap silinemedi',
  },
});

// H6 Delete account and H7 confirm. Firebase needs a fresh sign-in first (Google / Apple sheet,
// or the email password here). Logs on this phone stay.
export default function DeleteAccount() {
  const c = useCopy(COPY);
  const common = useCommon();
  const problems = useAuthProblems();
  const { method } = useAccount();
  const [understood, setUnderstood] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<AuthProblem | null>(null);
  const needsPassword = method === 'password';

  const run = async () => {
    setConfirm(false);
    setBusy(true);
    setProblem(null);
    try {
      if (await deleteAccount(needsPassword ? password : undefined)) router.dismissTo('/me');
    } catch (e) {
      const p = authProblem(e);
      if (p !== 'cancelled') setProblem(p);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page
      title={c.title}
      onBack={router.back}
      footer={
        <>
          <Button label={c.title} type="Destructive" fullWidth loading={busy} disabled={!understood || busy || (needsPassword && !password)} onPress={() => setConfirm(true)} />
          <Button label={common.cancel} type="Ghost" fullWidth onPress={router.back} />
        </>
      }
    >
      <View style={styles.badge}>
        <Icon name="trash-x" size={28} color="feedback/danger" />
      </View>
      <Text accessibilityRole="header" style={[type('Title/Medium', 'Bold'), { color: color['text/primary'] }]}>{c.heading}</Text>
      {problem ? <Banner kind={problem === 'offline' ? 'Warning' : 'Error'} title={c.failedTitle} message={problems[problem]} /> : null}
      <View style={styles.card}>
        {c.rows.map(([icon, title, body, danger]) => (
          <View key={title} style={styles.row}>
            <View style={[styles.rowBadge, { backgroundColor: color[danger ? 'feedback/danger-subtle' : 'surface/muted'] }]}>
              <Icon name={icon} size={20} color={danger ? 'feedback/danger' : 'text/brand'} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[type('Body/Default', 'SemiBold'), { color: color['text/primary'] }]}>{title}</Text>
              <Text style={[type('Body/Small'), { color: color['text/secondary'] }]}>{body}</Text>
            </View>
          </View>
        ))}
      </View>
      {needsPassword ? (
        <PasswordInput label={c.password} value={password} onChangeText={setPassword} autoComplete="current-password" textContentType="password" disabled={busy} />
      ) : (
        <Text style={[type('Body/Small'), { color: color['text/secondary'] }]}>{c.reauth}</Text>
      )}
      <View style={styles.check}>
        <Checkbox checked={understood} onChange={setUnderstood} label={c.understand} />
        <Text style={[type('Body/Medium'), { flex: 1, color: color['text/primary'] }]} onPress={() => setUnderstood(!understood)}>{c.understand}</Text>
      </View>
      <Dialog visible={confirm} destructive title={c.confirmTitle} body={c.confirmBody} confirmLabel={c.title} onConfirm={run} onCancel={() => setConfirm(false)} />
    </Page>
  );
}

const styles = StyleSheet.create({
  badge: { width: 56, height: 56, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: color['feedback/danger-subtle'] },
  card: { gap: 16, padding: 20, borderRadius: radius.xl, borderWidth: 1, borderColor: color['border/subtle'], backgroundColor: color['surface/default'] },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  rowBadge: { width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  check: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
