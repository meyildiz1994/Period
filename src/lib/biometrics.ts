import * as LocalAuthentication from 'expo-local-authentication';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { defineCopy, getCopy } from '../i18n';

const COPY = defineCopy({
  en: {
    name: { 'Face ID': 'Face ID', 'Touch ID': 'Touch ID', fingerprint: 'fingerprint', 'face unlock': 'face unlock' } as Record<BiometricKind, string>,
    use: (name: string) => `Use ${name}`,
    usePasscode: 'Use passcode',
  },
  tr: {
    name: { 'Face ID': 'Face ID', 'Touch ID': 'Touch ID', fingerprint: 'parmak izi', 'face unlock': 'yüz tanıma' },
    use: (name: string) => `${name[0].toLocaleUpperCase('tr')}${name.slice(1)} kullan`,
    usePasscode: 'Şifreyi kullan',
  },
});

// What the phone offers for unlocking without the passcode, named the way the OS names it.
export type BiometricKind = 'Face ID' | 'Touch ID' | 'fingerprint' | 'face unlock';

export async function biometricKind(): Promise<BiometricKind | null> {
  if (Platform.OS === 'web') return null;
  try {
    if (!(await LocalAuthentication.hasHardwareAsync()) || !(await LocalAuthentication.isEnrolledAsync())) return null;
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    const face = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
    if (Platform.OS === 'ios') return face ? 'Face ID' : 'Touch ID';
    return face ? 'face unlock' : 'fingerprint';
  } catch {
    return null;
  }
}

export function useBiometricKind() {
  const [kind, setKind] = useState<BiometricKind | null>(null);
  useEffect(() => {
    let live = true;
    biometricKind().then((k) => live && setKind(k));
    return () => {
      live = false;
    };
  }, []);
  return kind;
}

/** The kind in the current language, lower case where the OS writes it so ("parmak izi"). */
export const biometricName = (kind: BiometricKind) => getCopy(COPY).name[kind];

/** "Use Face ID", "Use fingerprint"… */
export const unlockLabel = (kind: BiometricKind) => getCopy(COPY).use(biometricName(kind));

export async function authenticate(reason: string) {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      disableDeviceFallback: true,
      cancelLabel: getCopy(COPY).usePasscode,
      // Android: only Class 3 biometrics (fingerprint, 3D face), not camera-only face unlock.
      biometricsSecurityLevel: 'strong',
    });
    return result.success;
  } catch {
    return false;
  }
}
