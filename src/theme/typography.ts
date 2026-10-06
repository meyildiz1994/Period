import type { TextStyle } from 'react-native';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_400Regular_Italic,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';

// Loaded once in src/app/_layout.tsx.
export const fontAssets = {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_400Regular_Italic,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
};

export const fontFamily = {
  Regular: 'PlusJakartaSans_400Regular',
  Italic: 'PlusJakartaSans_400Regular_Italic',
  Medium: 'PlusJakartaSans_500Medium',
  SemiBold: 'PlusJakartaSans_600SemiBold',
  Bold: 'PlusJakartaSans_700Bold',
} as const;

export type Weight = keyof typeof fontFamily;

// Figma text style roles by size (e.g. "Title/Large/Bold", "Body/Default/Regular", "Overline/12").
const ROLE_SIZE = {
  Display: 40,
  'Title/Large': 32,
  'Title/Medium': 28,
  'Title/Small': 24,
  Headline: 20,
  'Body/Large': 18,
  'Body/Medium': 16,
  'Body/Default': 15,
  'Body/Small': 14,
  Caption: 13,
  Footnote: 12,
  Micro: 11,
} as const;

export type TypeRole = keyof typeof ROLE_SIZE;

// Same metrics the Figma text styles use: 1.2 line height and -2% tracking from 24 up, 1.45 below.
export function type(role: TypeRole, weight: Weight = 'Regular'): TextStyle {
  const size = ROLE_SIZE[role];
  const large = size >= 24;
  return {
    fontFamily: fontFamily[weight],
    fontSize: size,
    lineHeight: Math.round(size * (large ? 1.2 : 1.45)),
    letterSpacing: large ? -0.02 * size : 0,
  };
}

// Uppercase label style (Overline/<size>): SemiBold, +6% tracking.
export function overline(size: 11 | 12 | 13 | 14 = 12): TextStyle {
  return {
    fontFamily: fontFamily.SemiBold,
    fontSize: size,
    lineHeight: Math.round(size * 1.45),
    letterSpacing: 0.06 * size,
    textTransform: 'uppercase',
  };
}
