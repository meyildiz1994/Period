import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Banner, BottomSheet, Choice, Divider, ListRow, Page } from '../../components';
import { authenticate, useBiometricKind } from '../../lib/biometrics';
import { LOCK_AFTER_LABEL, setLock, turnOffLock, useLock, type LockAfter } from '../../state/lock';
import { color, radius } from '../../theme';

const LOCK_AFTER: LockAfter[] = [0, 60, 300];

// G5 App lock. Turning it on goes through choosing a passcode first.
export default function AppLock() {
  const lock = useLock();
  const kind = useBiometricKind();
  const [picking, setPicking] = useState(false);
  const capital = kind ? kind[0].toUpperCase() + kind.slice(1) : '';

  return (
    <Page title="App lock" onBack={router.back}>
      <View style={styles.card}>
        <ListRow
          title="App lock"
          subtitle="Ask for a passcode when Period opens"
          icon="lock"
          trailing="Toggle"
          toggled={lock.enabled}
          onToggle={(on) => (on ? router.push('/settings/passcode') : turnOffLock())}
        />
        {lock.enabled && kind ? (
          <>
            <Divider inset={0} />
            <ListRow
              title={`Use ${capital}`}
              subtitle="Unlock without typing your passcode"
              icon="scan-face"
              trailing="Toggle"
              toggled={lock.biometrics}
              onToggle={async (on) => {
                if (!on) return setLock({ biometrics: false });
                if (await authenticate(`Turn on ${kind}`)) setLock({ biometrics: true });
              }}
            />
          </>
        ) : null}
        {lock.enabled ? (
          <>
            <Divider inset={0} />
            <ListRow title="Lock after" icon="clock" trailing="Value" value={LOCK_AFTER_LABEL[lock.lockAfter]} onPress={() => setPicking(true)} />
          </>
        ) : null}
      </View>

      {lock.enabled ? (
        <View style={styles.card}>
          <ListRow title="Change passcode" icon="key" onPress={() => router.push('/settings/passcode?mode=change')} />
        </View>
      ) : null}

      <Banner
        message={
          kind
            ? `If you forget your passcode, you can unlock with ${kind} or reinstall the app. Reinstalling deletes your logs.`
            : 'If you forget your passcode, the only way back in is to reinstall the app, which deletes your logs.'
        }
      />

      <BottomSheet visible={picking} title="Lock after" onClose={() => setPicking(false)}>
        <View style={styles.options} accessibilityRole="radiogroup">
          {LOCK_AFTER.map((s) => (
            <Choice
              key={s}
              label={LOCK_AFTER_LABEL[s]}
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
