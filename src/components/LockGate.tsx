import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState, StyleSheet, View } from 'react-native';

import { defineCopy, getCopy, useCopy } from '../i18n';
import { authenticate, unlockLabel, useBiometricKind } from '../lib/biometrics';
import { checkPasscode, getLock, setLock, useLock } from '../state/lock';
import { Button } from './Button';
import { PASSCODE_LENGTH, PasscodePad } from './Passcode';

const MAX_TRIES = 5;
const COOLDOWN_S = 30;

const COPY = defineCopy({
  en: {
    title: 'Enter passcode',
    unlock: 'Unlock Nilemy',
    locked: 'Nilemy is locked',
    cooldown: (s: number) => `Too many tries. Try again in ${s} seconds.`,
    wrong: (left: number) => `Wrong passcode. ${left} ${left === 1 ? 'try' : 'tries'} left.`,
  },
  tr: {
    title: 'Şifreni gir',
    unlock: 'Nilemy’nin kilidini aç',
    locked: 'Nilemy kilitli',
    cooldown: (s: number) => `Çok fazla deneme yapıldı. ${s} saniye sonra tekrar dene.`,
    wrong: (left: number) => `Yanlış şifre. ${left} deneme hakkın kaldı.`,
  },
});

// Shows G6 over the whole app while it is locked, and locks again after the app has been in
// the background for the chosen time.
export function LockGate({ children }: { children: ReactNode }) {
  const { enabled, locked } = useLock();
  const hiddenAt = useRef<number | null>(null);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      const lock = getLock();
      if (!lock.enabled) return;
      if (s === 'background') hiddenAt.current = Date.now();
      if (s === 'active' && hiddenAt.current !== null) {
        if ((Date.now() - hiddenAt.current) / 1000 >= lock.lockAfter) setLock({ locked: true });
        hiddenAt.current = null;
      }
    });
    return () => sub.remove();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {children}
      {enabled && locked ? (
        <View style={StyleSheet.absoluteFill}>
          <LockScreen />
        </View>
      ) : null}
    </View>
  );
}

function LockScreen() {
  const { biometrics } = useLock();
  const kind = useBiometricKind();
  const c = useCopy(COPY);
  const [entered, setEntered] = useState('');
  const [tries, setTries] = useState(MAX_TRIES);
  const [wrong, setWrong] = useState(false);
  /** Seconds left before the keypad works again after too many wrong tries. */
  const [cooldown, setCooldown] = useState(0);
  const offerBiometrics = biometrics && kind !== null;

  const unlockWithBiometrics = async () => {
    if (await authenticate(getCopy(COPY).unlock)) setLock({ locked: false });
  };

  useEffect(() => {
    if (offerBiometrics) unlockWithBiometrics();
    // Ask once when the lock screen appears; the button retries.
  }, [offerBiometrics]);

  const waiting = cooldown > 0;
  useEffect(() => {
    if (!waiting) return;
    const t = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) setTries(MAX_TRIES);
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [waiting]);

  const onDigit = async (d: string) => {
    // A full code is being checked; ignore extra taps until it's done.
    if (!wrong && entered.length >= PASSCODE_LENGTH) return;
    const next = (wrong ? '' : entered) + d;
    setWrong(false);
    if (next.length < PASSCODE_LENGTH) return setEntered(next);
    setEntered(next);
    if (await checkPasscode(next)) {
      setEntered('');
      setLock({ locked: false });
      return;
    }
    const left = tries - 1;
    setTries(left);
    setEntered(next);
    setWrong(true);
    if (left === 0) setCooldown(COOLDOWN_S);
  };

  const subtitle = waiting ? c.cooldown(cooldown) : wrong ? c.wrong(tries) : c.locked;

  return (
    <PasscodePad
      title={c.title}
      subtitle={subtitle}
      error={wrong || waiting}
      entered={entered.length}
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
