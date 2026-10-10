import { setAccount } from '../state/account';

// The web build is a preview only: no accounts (Google and Apple sign-in need the native apps).
export const accountsAvailable = false;
export const appleAvailable = false;
export type AuthProblem = 'cancelled' | 'wrong' | 'exists' | 'email' | 'weak' | 'offline' | 'tooMany' | 'otherMethod' | 'failed';

const unavailable = () => Promise.reject(new Error('Accounts are not available on the web.'));

export const authProblem = (): AuthProblem => 'failed';
export async function startAccount() {
  setAccount({ ready: true });
}
export const recheckAccount = async () => {};
export const signInWith = (_m: 'google' | 'apple'): Promise<boolean> => unavailable();
export const signUpWithEmail = (_e: string, _p: string): Promise<void> => unavailable();
export const signInWithEmail = (_e: string, _p: string): Promise<void> => unavailable();
export const sendPasswordReset = (_e: string): Promise<void> => unavailable();
export const createVault = (_p: string): Promise<string | null> => unavailable();
export const unlockVault = (_p: string): Promise<boolean> => unavailable();
export const recoverVault = (_c: string, _p: string): Promise<string | null> => unavailable();
export const changeVaultPassword = (_p: string): Promise<void> => unavailable();
export const signOutAccount = async () => {};
export const deleteAccount = (_p?: string): Promise<boolean> => unavailable();
export const syncNow = async () => {};
