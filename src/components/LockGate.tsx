import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState, StyleSheet, View } from 'react-native';

import { defineCopy, getCopy, useCopy } from '../i18n';
import { authenticate, unlockLabel, useBiometricKind } from '../lib/biometrics';
import { getLock, setLock, TRIES_PER_ROUND, tryUnlock, unlocked, useLock } from '../state/lock';
import { color } from '../theme';
import { Button } from './Button';
import { LogoMark } from './Logo';
import { PASSCODE_LENGTH, PasscodePad } from './Passcode';

const COPY = defineCopy({
  en: {
    title: 'Enter passcode',
    unlock: 'Unlock Nilemy',
    locked: 'Nilemy is locked',
    cooldown: (s: number) => (s >= 60 ? `Too many tries. Try again in ${Math.ceil(s / 60)} min.` : `Too many tries. Try again in ${s} seconds.`),
    wrong: (left: number) => `Wrong passcode. ${left} ${left === 1 ? 'try' : 'tries'} left.`,
  },
  tr: {
    title: 'Şifreni gir',
    unlock: 'Nilemy’nin kilidini aç',
    locked: 'Nilemy kilitli',
    cooldown: (s: number) => (s >= 60 ? `Çok fazla deneme yapıldı. ${Math.ceil(s / 60)} dk sonra tekrar dene.` : `Çok fazla deneme yapıldı. ${s} saniye sonra tekrar dene.`),
    wrong: (left: number) => `Yanlış şifre. ${left} deneme hakkın kaldı.`,
  },
});

// Shows G6 over the whole app while it is locked, and locks again after the app has been in
// the background for the chosen time ("Immediately" locks as soon as it leaves). While the app
// is leaving or in the app switcher, a plain cover hides it so the snapshot shows nothing.
// Whatever is under the lock is hidden from screen readers too.
export function LockGate({ children }: { children: ReactNode }) {
  const { enabled, locked } = useLock();
  const hiddenAt = useRef<number | null>(null);
  const [cover, setCover] = useState(false);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      const lock = getLock();
      if (!lock.enabled) return;
      if (s === 'inactive' || s === 'background') setCover(true);
      if (s === 'background') {
        hiddenAt.current = Date.now();
        if (lock.lockAfter === 0) setLock({ locked: true });
      }
      if (s === 'active') {
        setCover(false);
        if (hiddenAt.current !== null && (Date.now() - hiddenAt.current) / 1000 >= lock.lockAfter) setLock({ locked: true });
        hiddenAt.current = null;
      }
    });
    return () => sub.remove();
  }, []);

  const shut = enabled && locked;
  const hidden = enabled && (locked || cover);
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }} importantForAccessibility={hidden ? 'no-hide-descendants' : 'auto'} accessibilityElementsHidden={hidden}>
        {children}
      </View>
      {shut ? (
        <View style={StyleSheet.absoluteFill} accessibilityViewIsModal>
          <LockScreen />
        </View>
      ) : null}
      {enabled && cover ? (
        <View style={[StyleSheet.absoluteFill, styles.cover]} pointerEvents="none">
          <LogoMark size={96} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { alignItems: 'center', justifyContent: 'center', backgroundColor: color['bg/canvas'] },
});

function LockScreen() {
  const { biometrics, failedTries, lockedUntil } = useLock();
  const kind = useBiometricKind();
  const c = useCopy(COPY);
  const [entered, setEntered] = useState('');
  const [wrong, setWrong] = useState(false);
  /** Seconds left before the keypad works again; the deadline itself is saved with the lock. */
  const [cooldown, setCooldown] = useState(0);
  const offerBiometrics = biometrics && kind !== null;
  const left = TRIES_PER_ROUND - (failedTries % TRIES_PER_ROUND);

  const unlockWithBiometrics = async () => {
    if (await authenticate(getCopy(COPY).unlock)) unlocked();
  };

  useEffect(() => {
    if (offerBiometrics) unlockWithBiometrics();
    // Ask once when the lock screen appears; the button retries.
  }, [offerBiometrics]);

  // Count down to the saved deadline (it survives closing the app).
  useEffect(() => {
    if (!lockedUntil) return;
    const update = () => setCooldown(Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000)));
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [lockedUntil]);

  const waiting = cooldown > 0;

  const onDigit = async (d: string) => {
    // A full code is being checked; ignore extra taps until it's done.
    if (waiting || (!wrong && entered.length >= PASSCODE_LENGTH)) return;
    const next = (wrong ? '' : entered) + d;
    setWrong(false);
    setEntered(next);
    if (next.length < PASSCODE_LENGTH) return;
    if (await tryUnlock(next)) {
      setEntered('');
      return;
    }
    setWrong(true);
  };

  const subtitle = waiting ? c.cooldown(cooldown) : wrong ? c.wrong(left) : c.locked;

  return (
    <PasscodePad
      title={c.title}
      subtitle={subtitle}
      error={wrong || waiting}
      entered={waiting ? 0 : entered.length}
      disabled={waiting}
      onDigit={onDigit}
      onDelete={() => {
        setWrong(false);
        setEntered((e) => (wrong ? '' : e.slice(0, -1)));
      }}
      footer={offerBiometrics && kind ? <Button label={unlockLabel(kind)} type="Ghost" iconLeft="scan-face" onPress={unlockWithBiometrics} /> : null}
    />
  );
}
