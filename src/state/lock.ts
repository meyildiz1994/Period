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
  locked: boolean;
};

const initial: LockState = { enabled: false, passcodeHash: null, salt: null, biometrics: false, lockAfter: 0, locked: false };
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
  setLock({ enabled: true, passcodeHash: await hash(code, salt), salt, locked: false });
}

export async function checkPasscode(code: string) {
  return !!state.salt && (await hash(code, state.salt)) === state.passcodeHash;
}

export function turnOffLock() {
  setLock({ enabled: false, passcodeHash: null, salt: null, biometrics: false, locked: false });
}

export function subscribeLock(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useLock() {
  return useSyncExternalStore(subscribeLock, getLock, getLock);
}

export const LOCK_AFTER_LABEL: Record<LockAfter, string> = { 0: 'Immediately', 60: 'After 1 minute', 300: 'After 5 minutes' };
