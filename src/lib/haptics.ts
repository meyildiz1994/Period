import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Light selection tick, like iOS pickers, switches and segmented controls. Used by every
// control that picks or changes a value (chips, flow tiles, steppers, wheels, toggles).
export function tick() {
  if (Platform.OS === 'web') return;
  Haptics.selectionAsync().catch(() => {});
}

/** Wraps a press handler so it ticks first. */
export const withTick = <A extends unknown[]>(fn?: (...args: A) => void) => (fn ? (...args: A) => { tick(); fn(...args); } : undefined);
