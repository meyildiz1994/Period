import { useSyncExternalStore } from 'react';

// Premium (monthly or yearly subscription, lib/store.ts) and whether banner ads may load (lib/ads.ts).
// Not part of the encrypted data file: the purchase belongs to the store account and is read
// back from the App Store / Play Store at launch, so Delete all doesn't remove it.
export type Plan = 'yearly' | 'monthly';

type PremiumState = {
  premium: boolean;
  /** The active plan, when the store says which. */
  plan: Plan | null;
  /** Localised prices from the store, e.g. "₺499,99"; null until the store answers. */
  prices: Record<Plan, string | null>;
  /** Consent gathered and the ads SDK started; banners render only when true. */
  adsReady: boolean;
  /** The user is in a region where Google asks us to offer a way to change ad consent. */
  adChoicesRequired: boolean;
};

let state: PremiumState = { premium: false, plan: null, prices: { yearly: null, monthly: null }, adsReady: false, adChoicesRequired: false };
const listeners = new Set<() => void>();

export function setPremium(patch: Partial<PremiumState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function getPremium() {
  return state;
}

export function subscribePremium(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function usePremium() {
  return useSyncExternalStore(subscribePremium, getPremium, getPremium);
}
