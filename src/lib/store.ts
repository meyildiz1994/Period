import {
  fetchProducts,
  finishTransaction,
  getAvailablePurchases,
  initConnection,
  isUserCancelledError,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
  restorePurchases,
  type Purchase,
} from 'expo-iap';

import { getPremium, setPremium } from '../state/premium';

// Nilemy Premium: one non-consumable in-app purchase through the App Store / Google Play
// (StoreKit / Play Billing, no third-party service). It removes ads, and new features can be
// kept for Premium with <PremiumOnly>. The store remembers it, so it is read back at every launch and with Restore.
export const PREMIUM_SKU = 'com.meyildiz.nilemy.premium';

const owns = (purchases: Purchase[]) => purchases.some((p) => p.productId === PREMIUM_SKU && p.purchaseState !== 'pending');

let started: Promise<void> | null = null;
let waiting: { resolve: (ok: boolean) => void; reject: (e: unknown) => void } | null = null;

async function unlock(purchase: Purchase) {
  if (purchase.productId !== PREMIUM_SKU || purchase.purchaseState === 'pending') return;
  setPremium({ premium: true, adsReady: false });
  try {
    await finishTransaction({ purchase, isConsumable: false });
  } catch (e) {
    console.warn('Nilemy: finishing the purchase failed', e);
  }
  waiting?.resolve(true);
  waiting = null;
}

/** Connects to the store and reads back an earlier purchase. Safe to call more than once. */
export function startStore() {
  started ??= (async () => {
    try {
      await initConnection();
      purchaseUpdatedListener((p) => void unlock(p));
      purchaseErrorListener((e) => {
        if (isUserCancelledError(e)) waiting?.resolve(false);
        else waiting?.reject(e);
        waiting = null;
      });
      if (owns(await getAvailablePurchases())) setPremium({ premium: true });
      const [product] = (await fetchProducts({ skus: [PREMIUM_SKU], type: 'in-app' })) ?? [];
      if (product) setPremium({ price: product.displayPrice });
    } catch (e) {
      // No store (simulator, no account, offline): the app stays free and keeps working.
      console.warn('Nilemy: store unavailable', e);
    }
  })();
  return started;
}

/** Opens the store's purchase sheet. Resolves true once bought, false if cancelled. */
export async function buyPremium() {
  await startStore();
  if (getPremium().premium) return true;
  const done = new Promise<boolean>((resolve, reject) => {
    waiting = { resolve, reject };
  });
  try {
    await requestPurchase({ request: { apple: { sku: PREMIUM_SKU }, google: { skus: [PREMIUM_SKU] } }, type: 'in-app' });
  } catch (e) {
    waiting = null;
    if (isUserCancelledError(e)) return false;
    throw e;
  }
  return done;
}

/** Restore purchases (App Review requires the button). Resolves true if Premium was found. */
export async function restorePremium() {
  await startStore();
  await restorePurchases();
  const found = owns(await getAvailablePurchases());
  if (found) setPremium({ premium: true, adsReady: false });
  return found;
}
