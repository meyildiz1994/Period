import { useSyncExternalStore } from 'react';

// The optional account (1.2). Without one, everything stays on the phone as before.
// - off: not signed in
// - checking: signed in, looking up whether the account already has a backup
// - new: signed in, no backup yet (the Nilemy password and recovery code come next)
// - locked: signed in, the backup exists but this phone doesn't have its key (Nilemy password)
// - on: the backup is open on this phone and kept in sync
export type AccountStatus = 'off' | 'checking' | 'new' | 'locked' | 'on';
export type SignInMethod = 'google' | 'apple' | 'password';

export type AccountState = {
  /** False until Firebase has said whether someone is signed in (only matters once started). */
  ready: boolean;
  status: AccountStatus;
  email: string | null;
  method: SignInMethod | null;
  syncing: boolean;
  /** ISO time of the last successful sync on this phone. */
  syncedAt: string | null;
  /** The last sync attempt failed; it is retried on the next change or launch. */
  error: 'offline' | 'failed' | null;
};

const initial: AccountState = { ready: false, status: 'off', email: null, method: null, syncing: false, syncedAt: null, error: null };

let state = initial;
const listeners = new Set<() => void>();

export function setAccount(patch: Partial<AccountState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function getAccount() {
  return state;
}

export function subscribeAccount(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useAccount() {
  return useSyncExternalStore(subscribeAccount, getAccount, getAccount);
}
