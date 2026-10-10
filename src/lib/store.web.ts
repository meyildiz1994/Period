import type { Plan } from '../state/premium';

// The web build is a preview only: no store, so it stays on the free version.
export const PLANS: Record<Plan, string> = {
  yearly: 'com.meyildiz.nilemy.premium.yearly',
  monthly: 'com.meyildiz.nilemy.premium.monthly1',
};
export async function startStore() {}
export async function buyPremium(_plan: Plan) {
  return false;
}
export async function restorePremium() {
  return false;
}
export async function manageSubscription() {}
