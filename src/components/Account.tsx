import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View, type TextInputProps } from 'react-native';

import { defineCopy, useCopy } from '../i18n';
import type { AuthProblem } from '../lib/account';
import { color, type } from '../theme';
import { Input } from './Inputs';

// Pieces shared by the account screens (src/app/account/).
const COPY = defineCopy({
  en: {
    show: 'Show password',
    hide: 'Hide password',
    agree: 'By continuing you accept the',
    terms: 'Terms of service',
    and: 'and the',
    privacy: 'Privacy policy',
    end: '.',
    problems: {
      cancelled: '',
      wrong: 'That email and password don’t match. Check them and try again.',
      exists: 'There’s already an account with this email. Sign in instead.',
      email: 'Enter a full email address, like name@example.com.',
      weak: 'Use at least 8 characters.',
      offline: 'You’re offline. Connect to the internet and try again. Your logs on this phone are still available.',
      tooMany: 'Too many tries. Wait a few minutes and try again.',
      otherMethod: 'This email already signs in another way. Use the method you chose before.',
      failed: 'Something went wrong. Please try again.',
    } as Record<AuthProblem, string>,
  },
  tr: {
    show: 'Parolayı göster',
    hide: 'Parolayı gizle',
    agree: 'Devam ederek',
    terms: 'Kullanım koşulları',
    and: 've',
    privacy: 'Gizlilik politikası',
    end: '’nı kabul etmiş olursun.',
    problems: {
      cancelled: '',
      wrong: 'E-posta ve parola eşleşmiyor. Kontrol edip tekrar dene.',
      exists: 'Bu e-postayla zaten bir hesap var. Giriş yapmayı dene.',
      email: 'Tam bir e-posta adresi yaz, örneğin ad@ornek.com.',
      weak: 'En az 8 karakter kullan.',
      offline: 'İnternet bağlantın yok. Bağlanıp tekrar dene. Bu telefondaki kayıtların yerinde.',
      tooMany: 'Çok fazla deneme oldu. Birkaç dakika bekleyip tekrar dene.',
      otherMethod: 'Bu e-posta başka bir yöntemle giriş yapıyor. Daha önce seçtiğin yöntemi kullan.',
      failed: 'Bir şeyler ters gitti. Lütfen tekrar dene.',
    },
  },
});

export function useAuthProblems() {
  return useCopy(COPY).problems;
}

/** Password field with a show/hide button. */
export function PasswordInput(props: Omit<TextInputProps, 'style' | 'editable' | 'secureTextEntry'> & { label: string; helper?: string; error?: string; disabled?: boolean }) {
  const c = useCopy(COPY);
  const [shown, setShown] = useState(false);
  return (
    <Input
      {...props}
      iconLeft="lock"
      iconRight={shown ? 'eye-off' : 'eye'}
      iconRightLabel={shown ? c.hide : c.show}
      onIconRight={() => setShown(!shown)}
      secureTextEntry={!shown}
      autoCapitalize="none"
      autoCorrect={false}
    />
  );
}

/** "By continuing you accept the Terms of service and the Privacy policy." */
export function LegalLine() {
  const c = useCopy(COPY);
  const link = [type('Body/Small', 'SemiBold'), { color: color['text/brand'] }];
  return (
    <View style={styles.legal}>
      <Text style={[type('Body/Small'), styles.center, { color: color['text/secondary'] }]}>
        {c.agree}{' '}
        <Text accessibilityRole="link" style={link} onPress={() => router.push('/about/terms')}>{c.terms}</Text>{' '}
        {c.and}{' '}
        <Text accessibilityRole="link" style={link} onPress={() => router.push('/about/privacy')}>{c.privacy}</Text>
        {c.end}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  legal: { paddingHorizontal: 8 },
  center: { textAlign: 'center' },
});
