import { Platform } from 'react-native';
import mobileAds, { AdsConsent, MaxAdContentRating, TestIds } from 'react-native-google-mobile-ads';

import { getOnboarding } from '../state/onboarding';
import { getPremium, setPremium } from '../state/premium';
import { diffDays, fromISODate } from './dates';
import { startStore } from './store';

// Banner ads for the free version (Google AdMob). Only non-personalised ads are requested, so
// no advertising ID is used and there is no App Tracking Transparency prompt. Google's consent
// form (UMP) is shown first where the law asks for it (EEA, UK, Switzerland, some US states).
// Nothing the user logs is ever passed to the ads SDK. The first week after onboarding has no
// ads at all (the SDK isn't even started), so people get to know the app first.
//
// Ad unit IDs come from the AdMob console. Development builds always use Google's test units.
const UNITS = {
  ios: 'ca-app-pub-9059849179519229/9841572207',
  android: 'ca-app-pub-9059849179519229/6092979016',
};

export const BANNER_UNIT = __DEV__ ? TestIds.ADAPTIVE_BANNER : Platform.OS === 'ios' ? UNITS.ios : UNITS.android;

/** Days after onboarding before any ad (or the consent form) is shown. */
export const AD_FREE_DAYS = 7;

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
    const { startedAt } = getOnboarding();
    if (!startedAt || diffDays(fromISODate(startedAt), new Date()) < AD_FREE_DAYS) return;
    try {
      const info = await AdsConsent.gatherConsent();
      setPremium({ adChoicesRequired: info.privacyOptionsRequirementStatus === 'REQUIRED' });
      if (!info.canRequestAds) return;
      await mobileAds().setRequestConfiguration({ maxAdContentRating: MaxAdContentRating.T });
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
