import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';
import * as SecureStore from 'expo-secure-store';
import { Bytes, doc, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { AppState } from 'react-native';

import { getAccount, setAccount } from '../state/account';
import { getLog, replaceLog, subscribeLog, type DayLog, type LogState, type Period } from '../state/log';
import { getOnboarding, setOnboarding, subscribeOnboarding, type OnboardingState } from '../state/onboarding';
import { firestore } from './firebase';
import { openText, sealText } from './vault';

// Keeps the phone's logs and settings in step with the encrypted backup in Firestore.
//
// users/{uid}/data/state  { rev, parts, data: Bytes, updatedAt }  (+ data/part-1 … when large)
//
// `data` is the AES-GCM ciphertext of the JSON below (vault.ts). Each upload bumps `rev` in a
// transaction that checks this phone saw the previous one, so two phones can't overwrite each
// other unseen: on a mismatch the phone pulls, merges and tries again. Pulls happen at launch
// and when the app comes back to the front; pushes a few seconds after a change and when the
// app goes to the background. The app lock is per phone and isn't synced.
export type Payload = { v: 1; onboarding: Omit<OnboardingState, 'hydrated'>; log: LogState };

/** What this phone remembers about the account, in the Keychain / Keystore. */
type Record = { uid: string; key: Uint8Array; rev: number; dirty: boolean };

const RECORD = 'nilemy.sync.v1';
const STORE = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };
/** Firestore documents hold at most 1 MiB; ciphertext is split into parts below that. */
const PART = 900_000;
const PUSH_DELAY = 4000;

let rec: Record | null = null;
let applying = false;
let timer: ReturnType<typeof setTimeout> | null = null;
let running: Promise<void> | null = null;
let stop: (() => void) | null = null;

export const stateRef = (uid: string) => doc(firestore(), 'users', uid, 'data', 'state');
const partRef = (uid: string, i: number) => doc(firestore(), 'users', uid, 'data', `part-${i}`);
const aad = (uid: string) => `nilemy:${uid}:state`;

export async function readRecord(): Promise<Record | null> {
  try {
    const raw = await SecureStore.getItemAsync(RECORD, STORE);
    if (!raw) return null;
    const r = JSON.parse(raw);
    return { uid: r.uid, key: hexToBytes(r.key), rev: r.rev, dirty: r.dirty };
  } catch {
    return null;
  }
}

async function saveRecord() {
  if (!rec) return;
  await SecureStore.setItemAsync(RECORD, JSON.stringify({ uid: rec.uid, key: bytesToHex(rec.key), rev: rec.rev, dirty: rec.dirty }), STORE);
}

export async function clearRecord() {
  rec = null;
  await SecureStore.deleteItemAsync(RECORD, STORE);
}

function snapshot(): Payload {
  const { hydrated: _h, ...onboarding } = getOnboarding();
  return { v: 1, onboarding, log: getLog() };
}

function apply(p: Payload) {
  applying = true;
  try {
    replaceLog(p.log);
    setOnboarding({ ...p.onboarding, hydrated: true });
  } finally {
    applying = false;
  }
}

const newer = (a: DayLog, b: DayLog) => (a.loggedAt >= b.loggedAt ? a : b);

/**
 * Both sides changed since the last sync. Keeps everything from both: a day logged on both
 * phones keeps the later save, a period on both keeps this phone's version. This phone's
 * settings win. (A day deleted on one phone comes back if the other still has it.)
 */
export function merge(local: Payload, remote: Payload): Payload {
  if (!local.onboarding.done) return remote;
  if (!remote.onboarding.done) return local;
  const periods = new Map<string, Period>();
  for (const p of [...remote.log.periods, ...local.log.periods]) periods.set(p.start, p);
  const days: LogState['days'] = { ...remote.log.days };
  for (const [k, d] of Object.entries(local.log.days)) days[k] = days[k] ? newer(d, days[k]) : d;
  const reminders = new Map([...remote.onboarding.customReminders, ...local.onboarding.customReminders].map((r) => [r.id, r]));
  const started = [local.onboarding.startedAt, remote.onboarding.startedAt].filter((s): s is string => !!s).sort()[0] ?? null;
  return {
    v: 1,
    onboarding: {
      ...local.onboarding,
      startedAt: started,
      customSymptoms: [...new Set([...local.onboarding.customSymptoms, ...remote.onboarding.customSymptoms])],
      customReminders: [...reminders.values()],
    },
    log: { periods: [...periods.values()].sort((a, b) => (a.start < b.start ? 1 : -1)), days },
  };
}

async function pull() {
  if (!rec) return;
  const { uid, key } = rec;
  for (let attempt = 0; attempt < 3; attempt++) {
    const snap = await getDoc(stateRef(uid));
    if (!snap.exists()) {
      // Nothing uploaded yet (or the backup was reset): everything here is new to it.
      if (rec.rev !== 0) Object.assign(rec, { rev: 0, dirty: getOnboarding().done });
      return;
    }
    const { rev, parts, data } = snap.data() as { rev: number; parts: number; data: Bytes };
    if (rev === rec.rev) return;
    const chunks = [data.toUint8Array()];
    let stale = false;
    for (let i = 1; i < parts; i++) {
      const part = await getDoc(partRef(uid, i));
      // A part from another upload means one happened meanwhile: read again.
      if (part.get('rev') !== rev) stale = true;
      else chunks.push((part.get('data') as Bytes).toUint8Array());
    }
    if (stale) continue;
    const sealed = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
    chunks.reduce((at, c) => (sealed.set(c, at), at + c.length), 0);
    const remote = JSON.parse(openText(key, sealed, aad(uid))) as Payload;
    apply(rec.dirty ? merge(snapshot(), remote) : remote);
    rec.rev = rev;
    await saveRecord();
    return;
  }
}

async function push() {
  if (!rec?.dirty || !getOnboarding().done) return;
  const r = rec;
  for (let attempt = 0; attempt < 3; attempt++) {
    const sealed = sealText(r.key, JSON.stringify(snapshot()), aad(r.uid));
    const parts: Uint8Array[] = [];
    for (let at = 0; at < sealed.length; at += PART) parts.push(sealed.slice(at, at + PART));
    const saved = await runTransaction(firestore(), async (tx) => {
      const snap = await tx.get(stateRef(r.uid));
      const rev = snap.exists() ? (snap.get('rev') as number) : 0;
      if (rev !== r.rev) return null;
      const next = rev + 1;
      tx.set(stateRef(r.uid), { rev: next, parts: parts.length, data: Bytes.fromUint8Array(parts[0]), updatedAt: serverTimestamp() });
      parts.slice(1).forEach((p, i) => tx.set(partRef(r.uid, i + 1), { rev: next, data: Bytes.fromUint8Array(p) }));
      return next;
    });
    if (saved !== null) {
      r.rev = saved;
      r.dirty = false;
      await saveRecord();
      return;
    }
    // Another phone uploaded first: take its changes, then try again.
    await pull();
  }
  throw new Error('sync: too many conflicting uploads');
}

/** Pull, then push anything new. Runs one at a time; safe to call often. */
export function syncNow() {
  if (!rec) return Promise.resolve();
  if (running) return running;
  if (timer) clearTimeout(timer);
  timer = null;
  setAccount({ syncing: true });
  running = (async () => {
    try {
      await pull();
      await push();
      setAccount({ syncing: false, syncedAt: new Date().toISOString(), error: null });
    } catch (e) {
      const offline = /unavailable|network|offline/i.test(String((e as { code?: string })?.code ?? e));
      setAccount({ syncing: false, error: offline ? 'offline' : 'failed' });
      if (!offline) console.warn('Nilemy: sync failed', e);
    } finally {
      running = null;
    }
  })();
  return running;
}

function changed() {
  if (applying || !rec) return;
  if (!rec.dirty) {
    rec.dirty = true;
    saveRecord().catch(() => {});
  }
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => syncNow(), PUSH_DELAY);
}

/**
 * Starts syncing with this data key. `fresh` is a new link between this phone and the account:
 * anything already on the phone counts as unsynced, so it's merged with the backup, not lost.
 */
export async function startSync(uid: string, key: Uint8Array, fresh: boolean) {
  stopSync();
  const saved = fresh ? null : await readRecord();
  rec = saved?.uid === uid ? { ...saved, key } : { uid, key, rev: 0, dirty: getOnboarding().done };
  // Nothing on this phone yet (new phone, reinstall): read the whole backup.
  if (!getOnboarding().done) rec.rev = 0;
  await saveRecord();
  const offLog = subscribeLog(changed);
  const offOnboarding = subscribeOnboarding(changed);
  const app = AppState.addEventListener('change', (s) => {
    if (s === 'active' || (s === 'background' && rec?.dirty)) syncNow();
  });
  stop = () => {
    offLog();
    offOnboarding();
    app.remove();
  };
  setAccount({ status: 'on' });
  await syncNow();
}

/** The open data key, for re-wrapping it with a new Nilemy password. */
export const dataKey = () => rec?.key ?? null;

export function stopSync() {
  stop?.();
  stop = null;
  if (timer) clearTimeout(timer);
  timer = null;
  rec = null;
}

/** Pushes pending changes before signing out, if it can. */
export async function finishSync() {
  if (rec?.dirty && getAccount().status === 'on') await syncNow();
}
