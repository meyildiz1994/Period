import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Banner, Button, Dialog, Divider, Icon, ListRow, Page } from '../../components';
import { defineCopy, useCopy, useLang } from '../../i18n';
import { recheckAccount, signOutAccount, syncNow } from '../../lib/account';
import type { Then } from '../../lib/accountFlow';
import { useAccount, type SignInMethod } from '../../state/account';
import { color, radius, type } from '../../theme';

const COPY = defineCopy({
  en: {
    title: 'Account',
    method: { google: 'Signed in with Google', apple: 'Signed in with Apple', password: 'Signed in with email' } as Record<SignInMethod, string>,
    on: 'End-to-end encrypted backup is on',
    syncedAt: (when: string) => `Last synced ${when}`,
    syncing: 'Syncing…',
    neverSynced: 'Not synced yet',
    syncNow: 'Sync now',
    offline: 'You’re offline. Your changes are saved on this phone and will sync when you’re back online.',
    failed: 'The last sync didn’t work. It will try again; you can also sync now.',
    lockedTitle: 'Your backup is closed on this phone',
    locked: 'Enter your Nilemy password to open your backup and sync this phone.',
    unlock: 'Enter Nilemy password',
    newTitle: 'Finish setting up your backup',
    new: 'Create a Nilemy password to start backing up your logs.',
    create: 'Create Nilemy password',
    checking: 'Checking your account…',
    checkingOffline: 'You’re offline, so your account can’t be checked yet.',
    retry: 'Try again',
    changePassword: 'Change Nilemy password',
    signOut: 'Sign out on this phone',
    signOutTitle: 'Sign out on this phone?',
    signOutBody: 'Your logs stay on this phone and your backup stays in your account. Sign in again any time to sync.',
    deleteAccount: 'Delete account',
    deleteSub: 'Removes your backup and account',
    note: 'Your logs are encrypted on this phone before they’re backed up. Not even we can read them.',
  },
  tr: {
    title: 'Hesap',
    method: { google: 'Google ile giriş yapıldı', apple: 'Apple ile giriş yapıldı', password: 'E-posta ile giriş yapıldı' },
    on: 'Uçtan uca şifreli yedek açık',
    syncedAt: (when: string) => `Son eşitleme: ${when}`,
    syncing: 'Eşitleniyor…',
    neverSynced: 'Henüz eşitlenmedi',
    syncNow: 'Şimdi eşitle',
    offline: 'İnternet bağlantın yok. Değişikliklerin bu telefonda kayıtlı; bağlanınca eşitlenecek.',
    failed: 'Son eşitleme olmadı. Yeniden denenecek; istersen şimdi eşitleyebilirsin.',
    lockedTitle: 'Yedeğin bu telefonda kapalı',
    locked: 'Yedeğini açıp bu telefonu eşitlemek için Nilemy parolanı gir.',
    unlock: 'Nilemy parolasını gir',
    newTitle: 'Yedeklemeyi tamamla',
    new: 'Kayıtlarını yedeklemeye başlamak için bir Nilemy parolası oluştur.',
    create: 'Nilemy parolası oluştur',
    checking: 'Hesabın kontrol ediliyor…',
    checkingOffline: 'İnternet bağlantın yok, hesabın henüz kontrol edilemedi.',
    retry: 'Tekrar dene',
    changePassword: 'Nilemy parolasını değiştir',
    signOut: 'Bu telefonda çıkış yap',
    signOutTitle: 'Bu telefonda çıkış yapılsın mı?',
    signOutBody: 'Kayıtların bu telefonda, yedeğin hesabında kalır. Eşitlemek için istediğin zaman tekrar giriş yapabilirsin.',
    deleteAccount: 'Hesabı sil',
    deleteSub: 'Yedeğini ve hesabını siler',
    note: 'Kayıtların yedeklenmeden önce bu telefonda şifrelenir. Biz bile okuyamayız.',
  },
});

// Account (Me › Account, Your data › Account backup): sync status, Nilemy password, sign out, delete.
export default function ManageAccount() {
  const c = useCopy(COPY);
  const lang = useLang();
  const { then } = useLocalSearchParams<{ then?: Then }>();
  const account = useAccount();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const when = account.syncedAt
    ? new Date(account.syncedAt).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : null;

  if (account.ready && account.status === 'off') return <Redirect href={{ pathname: '/account', params: { then } }} />;

  const signOut = async () => {
    setConfirm(false);
    setBusy(true);
    try {
      await signOutAccount();
    } finally {
      setBusy(false);
    }
    router.back();
  };

  return (
    <Page title={c.title} onBack={router.back}>
      <View style={styles.card}>
        <View style={styles.badge}>
          <Icon name="user-circle" color="text/brand" />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text numberOfLines={1} style={[type('Body/Large', 'SemiBold'), { color: color['text/primary'] }]}>{account.email ?? '—'}</Text>
          {account.method ? <Text style={[type('Body/Small'), { color: color['text/secondary'] }]}>{c.method[account.method]}</Text> : null}
        </View>
      </View>

      {account.status === 'on' ? (
        <View style={styles.sync}>
          <View style={styles.syncRow}>
            <Icon name="shield-check" size={20} color="feedback/success" />
            <Text style={[type('Body/Default', 'SemiBold'), { flex: 1, color: color['text/primary'] }]}>{c.on}</Text>
          </View>
          <Text style={[type('Body/Small'), { color: color['text/secondary'] }]}>{account.syncing ? c.syncing : when ? c.syncedAt(when) : c.neverSynced}</Text>
          <Button label={c.syncNow} type="Secondary" size="Medium" iconLeft="refresh" loading={account.syncing} disabled={account.syncing} onPress={() => syncNow()} />
        </View>
      ) : null}
      {account.status === 'on' && account.error ? <Banner kind="Warning" message={account.error === 'offline' ? c.offline : c.failed} /> : null}
      {account.status === 'locked' ? (
        <Banner kind="Warning" title={c.lockedTitle} message={c.locked} action={c.unlock} onAction={() => router.push({ pathname: '/account/password', params: { mode: 'unlock', then } })} />
      ) : null}
      {account.status === 'new' ? (
        <Banner title={c.newTitle} message={c.new} action={c.create} onAction={() => router.push({ pathname: '/account/password', params: { mode: 'create', then } })} />
      ) : null}
      {account.status === 'checking' ? (
        account.error ? <Banner kind="Warning" message={c.checkingOffline} action={c.retry} onAction={() => recheckAccount().catch(() => {})} /> : <Banner message={c.checking} />
      ) : null}

      <View style={styles.list}>
        {account.status === 'on' ? (
          <>
            <ListRow title={c.changePassword} icon="key" onPress={() => router.push({ pathname: '/account/password', params: { mode: 'change' } })} />
            <Divider inset={0} />
          </>
        ) : null}
        <ListRow title={c.signOut} icon="user" disabled={busy} onPress={() => setConfirm(true)} />
      </View>
      <View style={styles.list}>
        <ListRow title={c.deleteAccount} subtitle={c.deleteSub} icon="trash-x" destructive onPress={() => router.push('/account/delete')} />
      </View>
      <Banner message={c.note} />

      <Dialog visible={confirm} title={c.signOutTitle} body={c.signOutBody} confirmLabel={c.signOut} onConfirm={signOut} onCancel={() => setConfirm(false)} />
    </Page>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20, borderRadius: radius.xl, backgroundColor: color['surface/muted'] },
  badge: { width: 48, height: 48, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: color['surface/default'] },
  sync: { gap: 8, padding: 20, borderRadius: radius.xl, borderWidth: 1, borderColor: color['border/subtle'], backgroundColor: color['surface/default'], alignItems: 'flex-start' },
  syncRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  list: { borderRadius: radius.xl, borderWidth: 1, borderColor: color['border/subtle'], backgroundColor: color['surface/default'], overflow: 'hidden' },
});
