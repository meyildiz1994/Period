import { useSyncExternalStore } from 'react';

// The profile photo, as a data URI ready for <Image>. It stays on this phone only: saved encrypted
// next to the rest of the data (persist.ts) and left out of the account backup.
let photo: string | null = null;
const listeners = new Set<() => void>();

export function setPhoto(next: string | null) {
  photo = next;
  listeners.forEach((l) => l());
}

export function getPhoto() {
  return photo;
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function usePhoto() {
  return useSyncExternalStore(subscribe, getPhoto, getPhoto);
}
