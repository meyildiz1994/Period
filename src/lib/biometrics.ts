import * as LocalAuthentication from 'expo-local-authentication';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

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

/** "Use Face ID", "Use fingerprint"… */
export const unlockLabel = (kind: BiometricKind) => `Use ${kind}`;

export async function authenticate(reason: string) {
  try {
    const result = await LocalAuthentication.authenticateAsync({ promptMessage: reason, disableDeviceFallback: true, cancelLabel: 'Use passcode' });
    return result.success;
  } catch {
    return false;
  }
}
