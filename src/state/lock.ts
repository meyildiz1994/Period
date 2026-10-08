import { CryptoDigestAlgorithm, digestStringAsync, getRandomBytes } from 'expo-crypto';
import { useSyncExternalStore } from 'react';

// App lock (G5, G6). Saved by persist.ts. The passcode itself is never stored: only a salted
// SHA-256 hash, inside the encrypted data file.
export type LockAfter = 0 | 60 | 300;

type LockState = {
  enabled: boolean;
  passcodeHash: string | null;
  salt: string | null;
  biometrics: boolean;
  /** Seconds in the background before the lock screen shows again. */
  lockAfter: LockAfter;
  /** Wrong passcodes in a row; kept across restarts so relaunching doesn't reset the limit. */
  failedTries: number;
  /** Epoch ms until which the keypad is disabled after too many wrong passcodes. */
  lockedUntil: number | null;
  locked: boolean;
};

const initial: LockState = { enabled: false, passcodeHash: null, salt: null, biometrics: false, lockAfter: 0, failedTries: 0, lockedUntil: null, locked: false };
let state = initial;
const listeners = new Set<() => void>();

export function setLock(patch: Partial<LockState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function getLock() {
  return state;
}

export function resetLock() {
  setLock(initial);
}

const hash = (code: string, salt: string) => digestStringAsync(CryptoDigestAlgorithm.SHA256, `${salt}:${code}`);

/** Turns the lock on with a new passcode. */
export async function setPasscode(code: string) {
  const salt = Array.from(getRandomBytes(16), (b) => b.toString(16).padStart(2, '0')).join('');
  setLock({ enabled: true, passcodeHash: await hash(code, salt), salt, failedTries: 0, lockedUntil: null, locked: false });
}

export async function checkPasscode(code: string) {
  return !!state.salt && (await hash(code, state.salt)) === state.passcodeHash;
}

/** Wrong passcodes allowed before each wait. */
export const TRIES_PER_ROUND = 5;
/** Wait after each full round of wrong passcodes: 30 s, 1 min, 5 min, then 15 min. */
const WAITS_S = [30, 60, 300, 900];

/** Checks a passcode entered on the lock screen and updates the saved try counter. */
export async function tryUnlock(code: string) {
  if (await checkPasscode(code)) {
    setLock({ locked: false, failedTries: 0, lockedUntil: null });
    return true;
  }
  const failedTries = state.failedTries + 1;
  const round = failedTries / TRIES_PER_ROUND;
  const wait = Number.isInteger(round) ? WAITS_S[Math.min(round, WAITS_S.length) - 1] : 0;
  setLock({ failedTries, lockedUntil: wait ? Date.now() + wait * 1000 : state.lockedUntil });
  return false;
}

/** Unlocked another way (Face ID): clears the wrong-try counter. */
export function unlocked() {
  setLock({ locked: false, failedTries: 0, lockedUntil: null });
}

export function turnOffLock() {
  setLock({ enabled: false, passcodeHash: null, salt: null, biometrics: false, failedTries: 0, lockedUntil: null, locked: false });
}

export function subscribeLock(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useLock() {
  return useSyncExternalStore(subscribeLock, getLock, getLock);
}

