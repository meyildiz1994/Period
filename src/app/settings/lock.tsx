import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Banner, BottomSheet, Choice, Divider, ListRow, Page } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { authenticate, biometricName, useBiometricKind } from '../../lib/biometrics';
import { setLock, turnOffLock, useLock, type LockAfter } from '../../state/lock';
import { color, radius } from '../../theme';

const LOCK_AFTER: LockAfter[] = [0, 60, 300];

const COPY = defineCopy({
  en: {
    title: 'App lock',
    lockHint: 'Ask for a passcode when Nilemy opens',
    use: (name: string) => `Use ${name[0].toUpperCase() + name.slice(1)}`,
    useHint: 'Unlock without typing your passcode',
    turnOn: (name: string) => `Turn on ${name}`,
    lockAfter: 'Lock after',
    lockAfterLabel: { 0: 'Immediately', 60: 'After 1 minute', 300: 'After 5 minutes' } as Record<LockAfter, string>,
    change: 'Change passcode',
    forgotWith: (name: string) => `If you forget your passcode, you can unlock with ${name} or reinstall the app. Reinstalling deletes your logs.`,
    forgot: 'If you forget your passcode, the only way back in is to reinstall the app, which deletes your logs.',
  },
  tr: {
    title: 'Uygulama kilidi',
    lockHint: 'Nilemy açılırken şifre sor',
    use: (name: string) => `${name[0].toLocaleUpperCase('tr') + name.slice(1)} kullan`,
    useHint: 'Şifreni yazmadan kilidi aç',
    turnOn: (name: string) => `${name} ile kilit açmayı etkinleştir`,
    lockAfter: 'Kilitlenme zamanı',
    lockAfterLabel: { 0: 'Hemen', 60: '1 dakika sonra', 300: '5 dakika sonra' },
    change: 'Şifreyi değiştir',
    forgotWith: (name: string) => `Şifreni unutursan ${name} ile kilidi açabilir ya da uygulamayı yeniden yükleyebilirsin. Yeniden yüklemek kayıtlarını siler.`,
    forgot: 'Şifreni unutursan tek yol uygulamayı yeniden yüklemek, bu da kayıtlarını siler.',
  },
});

// G5 App lock. Turning it on goes through choosing a passcode first.
export default function AppLock() {
  const lock = useLock();
  const kind = useBiometricKind();
  const [picking, setPicking] = useState(false);
  const c = useCopy(COPY);
  const name = kind ? biometricName(kind) : '';

  return (
    <Page title={c.title} onBack={router.back}>
      <View style={styles.card}>
        <ListRow
          title={c.title}
          subtitle={c.lockHint}
          icon="lock"
          trailing="Toggle"
          toggled={lock.enabled}
          onToggle={(on) => (on ? router.push('/settings/passcode') : turnOffLock())}
        />
        {lock.enabled && kind ? (
          <>
            <Divider inset={0} />
            <ListRow
              title={c.use(name)}
              subtitle={c.useHint}
              icon="scan-face"
              trailing="Toggle"
              toggled={lock.biometrics}
              onToggle={async (on) => {
                if (!on) return setLock({ biometrics: false });
                if (await authenticate(c.turnOn(name))) setLock({ biometrics: true });
              }}
            />
          </>
        ) : null}
        {lock.enabled ? (
          <>
            <Divider inset={0} />
            <ListRow title={c.lockAfter} icon="clock" trailing="Value" value={c.lockAfterLabel[lock.lockAfter]} onPress={() => setPicking(true)} />
          </>
        ) : null}
      </View>

      {lock.enabled ? (
        <View style={styles.card}>
          <ListRow title={c.change} icon="key" onPress={() => router.push('/settings/passcode?mode=change')} />
        </View>
      ) : null}

      <Banner
        message={
          kind
            ? c.forgotWith(name)
            : c.forgot
        }
      />

      <BottomSheet visible={picking} title={c.lockAfter} onClose={() => setPicking(false)}>
        <View style={styles.options} accessibilityRole="radiogroup">
          {LOCK_AFTER.map((s) => (
            <Choice
              key={s}
              label={c.lockAfterLabel[s]}
              selected={lock.lockAfter === s}
              onPress={() => {
                setLock({ lockAfter: s });
                setPicking(false);
              }}
            />
          ))}
        </View>
      </BottomSheet>
    </Page>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, borderWidth: 1, borderColor: color['border/subtle'], backgroundColor: color['surface/default'], overflow: 'hidden' },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 16 },
});
