import { gcm } from '@noble/ciphers/aes.js';
import { bytesToUtf8, concatBytes, utf8ToBytes } from '@noble/ciphers/utils.js';
import { hkdf } from '@noble/hashes/hkdf.js';
import { scryptAsync } from '@noble/hashes/scrypt.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';
import { getRandomBytes } from 'expo-crypto';

// End-to-end encryption for the account backup. The logs are sealed on the phone with a random
// 256-bit data key; the server only ever sees ciphertext. The data key is stored twice, wrapped
// (AES-GCM) with a key from the user's Nilemy password (scrypt) and with a key from a random
// recovery code (HKDF; the code itself has 160 bits, so it needs no slow hashing).

/** scrypt cost for the Nilemy password; saved with the backup so it can be raised later. */
export const KDF = { N: 2 ** 15, r: 8, p: 1 } as const;
export type KdfParams = { N: number; r: number; p: number };
export const PASSWORD_MIN = 8;

const NONCE = 12;

/** AES-256-GCM with a random nonce in front. `aad` ties the ciphertext to where it's stored. */
export function seal(key: Uint8Array, plain: Uint8Array, aad?: string) {
  const nonce = getRandomBytes(NONCE);
  return concatBytes(nonce, gcm(key, nonce, aad ? utf8ToBytes(aad) : undefined).encrypt(plain));
}

/** Throws if the key is wrong or the data was changed. */
export function open(key: Uint8Array, sealed: Uint8Array, aad?: string) {
  return gcm(key, sealed.slice(0, NONCE), aad ? utf8ToBytes(aad) : undefined).decrypt(sealed.slice(NONCE));
}

export const sealText = (key: Uint8Array, text: string, aad?: string) => seal(key, utf8ToBytes(text), aad);
export const openText = (key: Uint8Array, sealed: Uint8Array, aad?: string) => bytesToUtf8(open(key, sealed, aad));

export const newKey = () => getRandomBytes(32);
export const newSalt = () => getRandomBytes(16);

/** Slow on purpose (about a second on a phone); yields so a spinner keeps moving. */
export function passwordKey(password: string, salt: Uint8Array, params: KdfParams = KDF) {
  return scryptAsync(password.normalize('NFKC'), salt, { ...params, dkLen: 32, asyncTick: 16 });
}

// Recovery code: 20 random bytes in Crockford base32, 32 characters shown as 8 groups of 4.
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export function newRecoveryCode() {
  const bytes = getRandomBytes(20);
  let bits = 0;
  let value = 0;
  let out = '';
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  return out;
}

/** "abcd-efgh …" as typed → the 32-character code, or null if it can't be one. */
export function normalizeRecoveryCode(input: string) {
  const code = input
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, '')
    .replace(/O/g, '0')
    .replace(/[IL]/g, '1');
  return code.length === 32 && [...code].every((ch) => ALPHABET.includes(ch)) ? code : null;
}

export const formatRecoveryCode = (code: string) => code.match(/.{1,4}/g)?.join('-') ?? code;

export const recoveryKey = (code: string, salt: Uint8Array) => hkdf(sha256, utf8ToBytes(code), salt, utf8ToBytes('nilemy-recovery-v1'), 32);

/** For Sign in with Apple: Apple gets the hash, Firebase checks it against the raw nonce. */
export function newNonce() {
  const raw = bytesToHex(getRandomBytes(16));
  return { raw, hashed: bytesToHex(sha256(utf8ToBytes(raw))) };
}
