import {
  EmailAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  reauthenticateWithCredential,
  revokeAccessToken,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  type AuthCredential,
  type User,
} from '@firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Bytes, collection, doc, getDoc, getDocs, runTransaction, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore';
import { Platform } from 'react-native';

import { getLang } from '../i18n';
import { getAccount, setAccount, type SignInMethod } from '../state/account';
import { firebaseAuth, firestore, GOOGLE } from './firebase';
import { clearRecord, dataKey, finishSync, readRecord, startSync, stopSync } from './sync';
import { KDF, newKey, newNonce, newRecoveryCode, newSalt, normalizeRecoveryCode, open, passwordKey, recoveryKey, seal, type KdfParams } from './vault';

// The optional account (1.2): sign-in with Google, Apple (iPhone) or email, then the Nilemy
// password that opens the end-to-end encrypted backup (lib/vault.ts, lib/sync.ts).
//
// users/{uid}/data/keys  { v, kdf: { N, r, p, salt }, password: Bytes, recovery: { salt, key: Bytes }, consentAt }
//
// `password` and `recovery.key` are the data key sealed with the password key and with the
// recovery key. Firebase is only loaded for people who have signed in at least once.
export { syncNow } from './sync';

export const accountsAvailable = true;
export const appleAvailable = Platform.OS === 'ios';

export type AuthProblem = 'cancelled' | 'wrong' | 'exists' | 'email' | 'weak' | 'offline' | 'tooMany' | 'otherMethod' | 'failed';

const FLAG = 'nilemy.account.v1';
const keysRef = (uid: string) => doc(firestore(), 'users', uid, 'data', 'keys');
const aad = (uid: string, slot: 'password' | 'recovery') => `nilemy:${uid}:key:${slot}`;

/** Firebase / Google / Apple errors → what the screen says. */
export function authProblem(e: unknown): AuthProblem {
  const code = String((e as { code?: string })?.code ?? '');
  if (code === 'ERR_REQUEST_CANCELED' || (isErrorWithCode(e) && e.code === statusCodes.IN_PROGRESS)) return 'cancelled';
  if (['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-login-credentials'].includes(code)) return 'wrong';
  if (code === 'auth/email-already-in-use') return 'exists';
  if (code === 'auth/invalid-email' || code === 'auth/missing-email') return 'email';
  if (code === 'auth/weak-password' || code === 'auth/missing-password') return 'weak';
  if (code === 'auth/network-request-failed' || code === 'unavailable') return 'offline';
  if (code === 'auth/too-many-requests') return 'tooMany';
  if (code === 'auth/account-exists-with-different-credential') return 'otherMethod';
  return 'failed';
}

function methodOf(user: User): SignInMethod {
  const ids = user.providerData.map((p) => p.providerId);
  return ids.includes('apple.com') ? 'apple' : ids.includes('google.com') ? 'google' : 'password';
}

let resolving: { uid: string | null; done: Promise<void> } | null = null;

/** Works out what the signed-in account needs on this phone (status in state/account.ts). */
function resolveUser(user: User | null) {
  const uid = user?.uid ?? null;
  if (resolving?.uid === uid) return resolving.done;
  const done = (async () => {
    if (!user) {
      stopSync();
      setAccount({ ready: true, status: 'off', email: null, method: null, syncing: false, syncedAt: null, error: null });
      return;
    }
    setAccount({ ready: true, email: user.email, method: methodOf(user) });
    const saved = await readRecord();
    if (saved?.uid === user.uid) {
      await startSync(user.uid, saved.key, false);
      return;
    }
    setAccount({ status: 'checking', error: null });
    try {
      const keys = await getDoc(keysRef(user.uid));
      setAccount({ status: keys.exists() ? 'locked' : 'new' });
    } catch {
      setAccount({ error: 'offline' });
    }
  })();
  resolving = { uid, done };
  return done;
}

let listening = false;
function listen() {
  if (listening) return;
  listening = true;
  onAuthStateChanged(firebaseAuth(), (user) => {
    resolveUser(user).catch((e) => console.warn('Nilemy: account check failed', e));
  });
}

let started = false;
/** At launch, once saved data is loaded. Does nothing (and loads nothing) without an account. */
export async function startAccount() {
  if (started) return;
  started = true;
  const signedIn = (await AsyncStorage.getItem(FLAG).catch(() => null)) === '1';
  if (signedIn || (await readRecord())) listen();
  else setAccount({ ready: true });
}

/** Looks again after "checking" failed (offline). */
export async function recheckAccount() {
  resolving = null;
  await resolveUser(firebaseAuth().currentUser);
}

async function signedIn(user: User) {
  await AsyncStorage.setItem(FLAG, '1');
  listen();
  await resolveUser(user);
}

let googleReady = false;
async function googleCredential() {
  if (!googleReady) {
    GoogleSignin.configure({ webClientId: GOOGLE.webClientId, iosClientId: GOOGLE.iosClientId });
    googleReady = true;
  }
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const res = await GoogleSignin.signIn();
  if (res.type !== 'success' || !res.data.idToken) return null;
  return GoogleAuthProvider.credential(res.data.idToken);
}

async function appleCredential() {
  const nonce = newNonce();
  try {
    const res = await AppleAuthentication.signInAsync({
      requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL],
      nonce: nonce.hashed,
    });
    if (!res.identityToken) return null;
    return { credential: new OAuthProvider('apple.com').credential({ idToken: res.identityToken, rawNonce: nonce.raw }), code: res.authorizationCode };
  } catch (e) {
    if ((e as { code?: string })?.code === 'ERR_REQUEST_CANCELED') return null;
    throw e;
  }
}

/** Resolves false if the person closed the Google or Apple sheet. */
export async function signInWith(method: 'google' | 'apple') {
  let credential: AuthCredential | null;
  if (method === 'google') credential = await googleCredential();
  else credential = (await appleCredential())?.credential ?? null;
  if (!credential) return false;
  const { user } = await signInWithCredential(firebaseAuth(), credential);
  await signedIn(user);
  return true;
}

export async function signUpWithEmail(email: string, password: string) {
  const { user } = await createUserWithEmailAndPassword(firebaseAuth(), email.trim(), password);
  await signedIn(user);
}

export async function signInWithEmail(email: string, password: string) {
  const { user } = await signInWithEmailAndPassword(firebaseAuth(), email.trim(), password);
  await signedIn(user);
}

export async function sendPasswordReset(email: string) {
  const auth = firebaseAuth();
  auth.languageCode = getLang();
  await sendPasswordResetEmail(auth, email.trim());
}

function currentUser() {
  const user = firebaseAuth().currentUser;
  if (!user) throw new Error('account: not signed in');
  return user;
}

type KeysDoc = { kdf: KdfParams & { salt: Bytes }; password: Bytes; recovery: { salt: Bytes; key: Bytes } };

async function wrapPassword(uid: string, key: Uint8Array, password: string) {
  const salt = newSalt();
  const sealed = seal(await passwordKey(password, salt), key, aad(uid, 'password'));
  return { kdf: { ...KDF, salt: Bytes.fromUint8Array(salt) }, password: Bytes.fromUint8Array(sealed) };
}

function wrapRecovery(uid: string, key: Uint8Array) {
  const code = newRecoveryCode();
  const salt = newSalt();
  const sealed = seal(recoveryKey(code, salt), key, aad(uid, 'recovery'));
  return { code, recovery: { salt: Bytes.fromUint8Array(salt), key: Bytes.fromUint8Array(sealed) } };
}

/**
 * First time for this account: makes the data key, saves it wrapped with the Nilemy password and
 * a new recovery code (returned, shown once), records the consent time and starts syncing.
 * Resolves null if another phone set up the backup meanwhile (status becomes "locked").
 */
export async function createVault(password: string) {
  const { uid } = currentUser();
  const key = newKey();
  const { code, recovery } = wrapRecovery(uid, key);
  const keys = { v: 1, ...(await wrapPassword(uid, key, password)), recovery, consentAt: serverTimestamp(), createdAt: serverTimestamp() };
  const created = await runTransaction(firestore(), async (tx) => {
    if ((await tx.get(keysRef(uid))).exists()) return false;
    tx.set(keysRef(uid), keys);
    return true;
  });
  if (!created) {
    setAccount({ status: 'locked' });
    return null;
  }
  await startSync(uid, key, true);
  return code;
}

async function readKeys(uid: string) {
  const snap = await getDoc(keysRef(uid));
  if (!snap.exists()) throw new Error('account: no backup keys');
  return snap.data() as KeysDoc;
}

/** Opens the backup on this phone. Resolves false for a wrong Nilemy password. */
export async function unlockVault(password: string) {
  const { uid } = currentUser();
  const keys = await readKeys(uid);
  const { salt, ...params } = keys.kdf;
  let key: Uint8Array;
  try {
    key = open(await passwordKey(password, salt.toUint8Array(), params), keys.password.toUint8Array(), aad(uid, 'password'));
  } catch {
    return false;
  }
  await startSync(uid, key, true);
  return true;
}

/**
 * Forgot the Nilemy password: the recovery code opens the backup, then a new password and a new
 * recovery code replace the old ones. Resolves the new code, or null for a wrong code.
 */
export async function recoverVault(input: string, newPassword: string) {
  const { uid } = currentUser();
  const code = normalizeRecoveryCode(input);
  if (!code) return null;
  const keys = await readKeys(uid);
  let key: Uint8Array;
  try {
    key = open(recoveryKey(code, keys.recovery.salt.toUint8Array()), keys.recovery.key.toUint8Array(), aad(uid, 'recovery'));
  } catch {
    return null;
  }
  const next = wrapRecovery(uid, key);
  await updateDoc(keysRef(uid), { ...(await wrapPassword(uid, key, newPassword)), recovery: next.recovery });
  await startSync(uid, key, true);
  return next.code;
}

/** Re-wraps the open data key with a new Nilemy password. The recovery code stays the same. */
export async function changeVaultPassword(newPassword: string) {
  const { uid } = currentUser();
  const key = dataKey();
  if (!key) throw new Error('account: backup not open');
  await updateDoc(keysRef(uid), await wrapPassword(uid, key, newPassword));
}

async function forgetHere() {
  stopSync();
  await clearRecord();
  await AsyncStorage.removeItem(FLAG);
  if (getAccount().method === 'google') await GoogleSignin.signOut().catch(() => {});
}

/** Signs out on this phone. The logs stay here; the backup stays in the account. */
export async function signOutAccount() {
  await finishSync().catch(() => {});
  await forgetHere();
  await signOut(firebaseAuth());
}

/**
 * Deletes the backup and the account. Asks the person to sign in again first (Firebase requires
 * a recent sign-in; for Apple it also gives the code to revoke the app's Apple tokens).
 * Resolves false if they cancelled that sign-in. The logs on this phone stay.
 */
export async function deleteAccount(password?: string) {
  const auth = firebaseAuth();
  const user = currentUser();
  const method = methodOf(user);
  let appleCode: string | null = null;
  if (method === 'google') {
    const credential = await googleCredential();
    if (!credential) return false;
    await reauthenticateWithCredential(user, credential);
  } else if (method === 'apple') {
    const apple = await appleCredential();
    if (!apple) return false;
    await reauthenticateWithCredential(user, apple.credential);
    appleCode = apple.code;
  } else {
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email ?? '', password ?? ''));
  }
  stopSync();
  const docs = await getDocs(collection(firestore(), 'users', user.uid, 'data'));
  const batch = writeBatch(firestore());
  docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  if (appleCode) {
    // Needs the Apple key in Firebase (Apple provider › OAuth code flow); deletion goes on without it.
    await revokeAccessToken(auth, appleCode).catch((e) => console.warn('Nilemy: Apple token not revoked', e));
  }
  await deleteUser(user);
  await forgetHere();
  return true;
}
