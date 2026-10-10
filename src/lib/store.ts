import {
  deepLinkToSubscriptions,
  fetchProducts,
  finishTransaction,
  getActiveSubscriptions,
  initConnection,
  isUserCancelledError,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
  restorePurchases,
  type ProductSubscription,
  type Purchase,
} from 'expo-iap';
import { AppState } from 'react-native';

import { getPremium, setPremium, type Plan } from '../state/premium';

// Nilemy Premium: an auto-renewing subscription through the App Store / Google Play (StoreKit /
// Play Billing, no third-party service), monthly or yearly. It removes ads and opens the Premium
// features (wrapped in <PremiumOnly> or checked with usePremium). The store is asked at every
// launch and whenever the app comes back to the front, so a lapsed subscription turns ads back on.
//
// App Store: one subscription group with both products. Google Play: two subscription products
// with the same ids, each with one base plan.
export const PLANS: Record<Plan, string> = {
  yearly: 'com.meyildiz.nilemy.premium.yearly',
  monthly: 'com.meyildiz.nilemy.premium.monthly',
};
const SKUS = Object.values(PLANS);
const PACKAGE = 'com.meyildiz.nilemy';

/** Google Play needs the offer token of the base plan to buy it. */
const offerTokens: Partial<Record<string, string>> = {};
let started: Promise<void> | null = null;
let waiting: { resolve: (ok: boolean) => void; reject: (e: unknown) => void } | null = null;

async function unlock(purchase: Purchase) {
  if (!SKUS.includes(purchase.productId) || purchase.purchaseState === 'pending') return;
  setPremium({ premium: true, adsReady: false });
  try {
    await finishTransaction({ purchase, isConsumable: false });
  } catch (e) {
    console.warn('Nilemy: finishing the purchase failed', e);
  }
  waiting?.resolve(true);
  waiting = null;
}

/** Asks the store whether a subscription is active now. Leaves things as they are if it can't tell. */
async function check() {
  try {
    const active = (await getActiveSubscriptions(SKUS)).filter((s) => s.isActive && SKUS.includes(s.productId));
    const plan = (Object.keys(PLANS) as Plan[]).find((p) => active.some((s) => s.productId === PLANS[p])) ?? null;
    setPremium({ premium: !!plan, plan, ...(plan ? { adsReady: false } : null) });
    return !!plan;
  } catch (e) {
    console.warn('Nilemy: subscription check failed', e);
    return getPremium().premium;
  }
}

function priceOf(product: ProductSubscription) {
  const offer = product.subscriptionOffers?.find((o) => o.offerTokenAndroid && !o.pricingPhasesAndroid?.pricingPhaseList.some((ph) => ph.priceAmountMicros === '0'));
  const any = product.subscriptionOffers?.find((o) => o.offerTokenAndroid);
  const token = (offer ?? any)?.offerTokenAndroid;
  if (token) offerTokens[product.id] = token;
  return product.displayPrice;
}

/** Connects to the store, reads the subscription and the prices. Safe to call more than once. */
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
      await check();
      AppState.addEventListener('change', (s) => {
        if (s === 'active') check();
      });
      const products = ((await fetchProducts({ skus: SKUS, type: 'subs' })) ?? []) as ProductSubscription[];
      const prices = { ...getPremium().prices };
      for (const plan of Object.keys(PLANS) as Plan[]) {
        const product = products.find((p) => p.id === PLANS[plan]);
        if (product) prices[plan] = priceOf(product);
      }
      setPremium({ prices });
    } catch (e) {
      // No store (simulator, no account, offline): the app stays free and keeps working.
      console.warn('Nilemy: store unavailable', e);
    }
  })();
  return started;
}

/** Opens the store's subscription sheet. Resolves true once subscribed, false if cancelled. */
export async function buyPremium(plan: Plan) {
  await startStore();
  if (getPremium().premium) return true;
  const sku = PLANS[plan];
  const done = new Promise<boolean>((resolve, reject) => {
    waiting = { resolve, reject };
  });
  const token = offerTokens[sku];
  try {
    await requestPurchase({
      request: { apple: { sku }, google: { skus: [sku], subscriptionOffers: token ? [{ sku, offerToken: token }] : null } },
      type: 'subs',
    });
  } catch (e) {
    waiting = null;
    if (isUserCancelledError(e)) return false;
    throw e;
  }
  return done;
}

/** Restore purchases (App Review requires the button). Resolves true if a subscription is active. */
export async function restorePremium() {
  await startStore();
  await restorePurchases();
  return check();
}

/** The store's own page to change plan or cancel. */
export async function manageSubscription() {
  await deepLinkToSubscriptions({ skuAndroid: PLANS[getPremium().plan ?? 'yearly'], packageNameAndroid: PACKAGE });
}
