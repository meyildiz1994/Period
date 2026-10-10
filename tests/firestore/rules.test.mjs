// Firestore rules tests (firestore.rules), run against the emulator: cd tests/firestore && npm install && npm test
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'node:fs';
import { Bytes, deleteDoc, doc, getDoc, runTransaction, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

const env = await initializeTestEnvironment({
  projectId: 'nilemy-rules-test',
  firestore: { rules: readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8'), host: '127.0.0.1', port: 8181 },
});
const b = (n) => Bytes.fromUint8Array(new Uint8Array(n).fill(7));
const keys = () => ({ v: 1, kdf: { N: 32768, r: 8, p: 1, salt: b(16) }, password: b(60), recovery: { salt: b(16), key: b(60) }, consentAt: serverTimestamp(), createdAt: serverTimestamp() });
const state = (rev, parts = 1) => ({ rev, parts, data: b(1000), updatedAt: serverTimestamp() });

let pass = 0, fail = 0;
async function check(name, p) {
  try { await p; pass++; console.log('ok  ', name); } catch (e) { fail++; console.log('FAIL', name, e.message?.slice(0, 120)); }
}

const alice = env.authenticatedContext('alice').firestore();
const bob = env.authenticatedContext('bob').firestore();
const anon = env.unauthenticatedContext().firestore();
const ref = (db, uid, id) => doc(db, 'users', uid, 'data', id);

// What the app does
await check('create keys', assertSucceeds(setDoc(ref(alice, 'alice', 'keys'), keys())));
await check('re-wrap keys (updateDoc)', assertSucceeds(updateDoc(ref(alice, 'alice', 'keys'), { kdf: { N: 32768, r: 8, p: 1, salt: b(16) }, password: b(60) })));
await check('first push via transaction', assertSucceeds(runTransaction(alice, async (tx) => { tx.set(ref(alice, 'alice', 'state'), state(1, 2)); tx.set(ref(alice, 'alice', 'part-1'), { rev: 1, data: b(1000) }); })));
await check('next push rev+1', assertSucceeds(setDoc(ref(alice, 'alice', 'state'), state(2))));
await check('read own', assertSucceeds(getDoc(ref(alice, 'alice', 'state'))));
await check('delete own', assertSucceeds(deleteDoc(ref(alice, 'alice', 'part-1'))));

// What must be refused
await check('other user reads', assertFails(getDoc(ref(bob, 'alice', 'state'))));
await check('other user writes', assertFails(setDoc(ref(bob, 'alice', 'part-2'), { rev: 1, data: b(10) })));
await check('signed out reads', assertFails(getDoc(ref(anon, 'alice', 'keys'))));
await check('rev skips ahead', assertFails(setDoc(ref(alice, 'alice', 'state'), state(9))));
await check('rev goes back', assertFails(setDoc(ref(alice, 'alice', 'state'), state(1))));
await check('extra field', assertFails(setDoc(ref(alice, 'alice', 'part-3'), { rev: 1, data: b(10), note: 'x' })));
await check('plain text instead of bytes', assertFails(setDoc(ref(alice, 'alice', 'part-3'), { rev: 1, data: 'hello' })));
await check('unknown doc id', assertFails(setDoc(ref(alice, 'alice', 'notes'), { rev: 1, data: b(10) })));
await check('part-20 refused', assertFails(setDoc(ref(alice, 'alice', 'part-20'), { rev: 1, data: b(10) })));
await check('change consentAt', assertFails(updateDoc(ref(alice, 'alice', 'keys'), { consentAt: new Date(0) })));
await check('top-level collection', assertFails(setDoc(doc(alice, 'stuff', 'x'), { a: 1 })));
await check('users root doc', assertFails(setDoc(doc(alice, 'users', 'alice'), { a: 1 })));

console.log(`\n${pass} passed, ${fail} failed`);
await env.cleanup();
process.exit(fail ? 1 : 0);
