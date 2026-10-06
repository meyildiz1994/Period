import type { IconName } from '../theme';

// Symptoms offered in A5; also the default quick options in C3 Daily log.
export const SYMPTOMS: { label: string; icon: IconName }[] = [
  { label: 'Cramps', icon: 'bandage' },
  { label: 'Headache', icon: 'brain' },
  { label: 'Tender breasts', icon: 'leaf' },
  { label: 'Fatigue', icon: 'moon' },
  { label: 'Mood swings', icon: 'smile' },
  { label: 'Bloating', icon: 'drop' },
  { label: 'Acne', icon: 'sparkles' },
  { label: 'Cravings', icon: 'cookie' },
  { label: 'Back pain', icon: 'person' },
  { label: 'Trouble sleeping', icon: 'clock' },
];
