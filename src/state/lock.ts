import { useSyncExternalStore } from 'react';

// App lock (G5, G6). In memory for now; step 9 keeps the passcode in the device's secure
// storage so the lock survives restarts.
export type LockAfter = 0 | 60 | 300;

type LockState = {
  enabled: boolean;
  passcode: string | null;
  biometrics: boolean;
  /** Seconds in the background before the lock screen shows again. */
  lockAfter: LockAfter;
  locked: boolean;
};

const initial: LockState = { enabled: false, passcode: null, biometrics: false, lockAfter: 0, locked: false };
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

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useLock() {
  return useSyncExternalStore(subscribe, getLock, getLock);
}

export const LOCK_AFTER_LABEL: Record<LockAfter, string> = { 0: 'Immediately', 60: 'After 1 minute', 300: 'After 5 minutes' };
