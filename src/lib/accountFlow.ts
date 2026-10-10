import { router } from 'expo-router';

import { getAccount } from '../state/account';
import { getOnboarding } from '../state/onboarding';

// Where the account screens go next. `then` is "onboarding" when they were opened from Welcome
// (A1); otherwise they were opened from Me or Your data and return there.
export type Then = 'onboarding' | undefined;

/** Leaves the account screens once the backup is open (or the person is done with them). */
export function finishAccount(then: Then) {
  if (then === 'onboarding') {
    router.dismissAll();
    // A backup from another phone brings the finished onboarding with it.
    router.replace(getOnboarding().done ? '/home' : '/onboarding/name');
  } else {
    router.dismissTo('/account/manage');
  }
}

/** After a sign-in: create the Nilemy password, enter it, or carry on if this phone has the key. */
export function afterSignIn(then: Then) {
  const { status, newCode } = getAccount();
  if (status === 'on' && !newCode) return finishAccount(then);
  if (status === 'new') return router.replace({ pathname: '/account/password', params: { mode: 'create', then } });
  if (status === 'locked') return router.replace({ pathname: '/account/password', params: { mode: 'unlock', then } });
  router.replace({ pathname: '/account/manage', params: { then } });
}
