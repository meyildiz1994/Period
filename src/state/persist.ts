import { gcm } from '@noble/ciphers/aes.js';
import { bytesToHex, bytesToUtf8, concatBytes, hexToBytes, utf8ToBytes } from '@noble/ciphers/utils.js';
import { getRandomBytes } from 'expo-crypto';
import { Directory, File, Paths } from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { getLock, setLock, subscribeLock } from './lock';
import { getLog, replaceLog, subscribeLog } from './log';
import { getOnboarding, setOnboarding, subscribeOnboarding } from './onboarding';

// Everything the app knows lives in one encrypted file on the phone. The 256-bit key is kept
// in the iOS Keychain / Android Keystore (expo-secure-store, this device only); the file holds
// a 12-byte nonce followed by the AES-GCM ciphertext of the JSON below.
// The web build (a preview only) keeps the JSON unencrypted in localStorage.
const VERSION = 1;
const KEY_NAME = 'period.key.v1';
const FILE_NAME = 'period.dat';
const TEMP_NAME = 'period.dat.tmp';
/** Exports are written to the cache with this prefix (lib/export.ts) and removed on Delete all. */
export const EXPORT_PREFIX = 'nilemy-export-';
const WEB_KEY = 'period.state.v1';

type Saved = {
  v: number;
  onboarding: Omit<ReturnType<typeof getOnboarding>, 'hydrated'>;
  log: ReturnType<typeof getLog>;
  lock: Omit<ReturnType<typeof getLock>, 'locked'>;
};

const web = Platform.OS === 'web';
const file = () => new File(Paths.document, FILE_NAME);

async function key() {
  const opts = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };
  const stored = await SecureStore.getItemAsync(KEY_NAME, opts);
  if (stored) return hexToBytes(stored);
  const fresh = getRandomBytes(32);
  await SecureStore.setItemAsync(KEY_NAME, bytesToHex(fresh), opts);
  return fresh;
}

async function read(): Promise<Saved | null> {
  if (web) {
    const raw = globalThis.localStorage?.getItem(WEB_KEY);
    return raw ? JSON.parse(raw) : null;
  }
  const f = file();
  if (!f.exists) return null;
  const bytes = new Uint8Array(await f.arrayBuffer());
  const plain = gcm(await key(), bytes.slice(0, 12)).decrypt(bytes.slice(12));
  return JSON.parse(bytesToUtf8(plain));
}

async function write(data: Saved) {
  const json = JSON.stringify(data);
  if (web) {
    globalThis.localStorage?.setItem(WEB_KEY, json);
    return;
  }
  const nonce = getRandomBytes(12);
  const sealed = concatBytes(nonce, gcm(await key(), nonce).encrypt(utf8ToBytes(json)));
  // Write a temp file and move it into place, so a crash mid-write can't leave a broken file.
  const tmp = new File(Paths.document, TEMP_NAME);
  if (tmp.exists) tmp.delete();
  tmp.create();
  tmp.write(sealed);
  await tmp.move(file(), { overwrite: true });
}

function snapshot(): Saved {
  const { hydrated: _h, ...onboarding } = getOnboarding();
  const { locked: _l, ...lock } = getLock();
  return { v: VERSION, onboarding, log: getLog(), lock };
}

let started = false;
let pending: Promise<void> = Promise.resolve();
let timer: ReturnType<typeof setTimeout> | null = null;

/** Saves now (after any save already running). Rejects if the file can't be written. */
export function flush() {
  if (timer) clearTimeout(timer);
  timer = null;
  pending = pending.catch(() => {}).then(() => write(snapshot()));
  return pending;
}

function schedule() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    flush().catch((e) => console.warn('Nilemy: saving failed', e));
  }, 300);
}

/**
 * Reads saved data into the stores, then saves on every change. Unreadable data (for example
 * after the key was lost) starts the app fresh instead of crashing.
 */
export async function hydrate() {
  if (started) return;
  started = true;
  let saved: Saved | null = null;
  try {
    saved = await read();
  } catch (e) {
    console.warn('Nilemy: saved data could not be read; starting fresh', e);
    // Keep the unreadable file aside instead of letting the next save overwrite it.
    try {
      if (!web && file().exists) file().rename(`period-unreadable-${Date.now()}.dat`);
    } catch {}
  }
  if (saved?.v === VERSION) {
    replaceLog(saved.log);
    setLock({ ...saved.lock, locked: saved.lock.enabled });
    setOnboarding({ ...saved.onboarding, hydrated: true });
  } else {
    setOnboarding({ hydrated: true });
  }
  try {
    clearExports();
  } catch {}
  subscribeOnboarding(schedule);
  subscribeLog(schedule);
  subscribeLock(schedule);
}

/**
 * Delete all (H2): removes the data file, its key and any export left in the cache, so nothing
 * readable is left behind. Throws if something couldn't be removed. The stores are reset by the
 * caller first; the next save writes a fresh file with a new key.
 */
export async function wipe() {
  if (timer) clearTimeout(timer);
  timer = null;
  await pending.catch(() => {});
  if (web) {
    globalThis.localStorage?.removeItem(WEB_KEY);
    return;
  }
  for (const name of [FILE_NAME, TEMP_NAME]) {
    const f = new File(Paths.document, name);
    if (f.exists) f.delete();
  }
  await SecureStore.deleteItemAsync(KEY_NAME, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
  clearExports();
}

/** Removes plaintext exports left in the cache (after sharing, at launch, on Delete all). */
export function clearExports() {
  if (web) return;
  for (const item of new Directory(Paths.cache).list()) {
    if (item instanceof File && item.name.startsWith(EXPORT_PREFIX)) item.delete();
  }
}
