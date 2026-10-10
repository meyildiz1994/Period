import { Platform } from 'react-native';
import mobileAds, { AdsConsent, MaxAdContentRating, TestIds } from 'react-native-google-mobile-ads';

import { getPremium, setPremium } from '../state/premium';
import { startStore } from './store';

// Banner ads for the free version (Google AdMob). Only non-personalised ads are requested, so
// no advertising ID is used and there is no App Tracking Transparency prompt. Google's consent
// form (UMP) is shown first where the law asks for it (EEA, UK, Switzerland, some US states).
// Nothing the user logs is ever passed to the ads SDK.
//
// Ad unit IDs come from the AdMob console. Development builds always use Google's test units.
const UNITS = {
  ios: 'ca-app-pub-3940256099942544/2435281174', // TODO(1.0.1): replace with the real iOS banner unit
  android: 'ca-app-pub-3940256099942544/9214589741', // TODO(1.0.1): replace with the real Android banner unit
};

export const BANNER_UNIT = __DEV__ ? TestIds.ADAPTIVE_BANNER : Platform.OS === 'ios' ? UNITS.ios : UNITS.android;

/** Shared by every banner: never personalised. */
export const AD_REQUEST = { requestNonPersonalizedAdsOnly: true } as const;

let started: Promise<void> | null = null;

/**
 * Reads Premium from the store, then (for free users only) asks for ad consent where required
 * and starts the ads SDK. Called once onboarding is finished, so the consent form never
 * interrupts it.
 */
export function startAds() {
  started ??= (async () => {
    await startStore();
    if (getPremium().premium) return;
    try {
      const info = await AdsConsent.gatherConsent();
      setPremium({ adChoicesRequired: info.privacyOptionsRequirementStatus === 'REQUIRED' });
      if (!info.canRequestAds) return;
      await mobileAds().setRequestConfiguration({ maxAdContentRating: MaxAdContentRating.PG });
      await mobileAds().initialize();
      if (!getPremium().premium) setPremium({ adsReady: true });
    } catch (e) {
      console.warn('Nilemy: ads unavailable', e);
    }
  })();
  return started;
}

/** Me › Ad choices: Google's form to change or withdraw consent. */
export async function showAdChoices() {
  await AdsConsent.showPrivacyOptionsForm();
}
