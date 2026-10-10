import type { ReactNode } from 'react';

import { usePremium } from '../state/premium';

// Wraps a Premium-only feature (e.g. a future advanced insight). Free users see `fallback`,
// usually a short card that links to /premium.
export function PremiumOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return <>{usePremium().premium ? children : fallback}</>;
}
