import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LANGUAGES, useLang } from '../i18n';
import { setOnboarding } from '../state/onboarding';
import { color, type } from '../theme';

// Small "TR | EN" switch for the corner of A1 Welcome. Choosing one fixes the language; until
// then the app follows the phone.
export function LanguageSwitch() {
  const lang = useLang();
  return (
    <View style={styles.track} accessibilityRole="radiogroup">
      {LANGUAGES.map((l) => {
        const on = l.id === lang;
        return (
          <Pressable
            key={l.id}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            accessibilityLabel={l.name}
            hitSlop={6}
            onPress={() => setOnboarding({ language: l.id })}
            style={[styles.option, on && styles.on]}
          >
            <Text style={[type('Caption', 'SemiBold'), { color: color[on ? 'text/on-brand' : 'text/secondary'] }]}>{l.short}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', padding: 3, borderRadius: 999, backgroundColor: color['surface/muted'] },
  option: { minWidth: 40, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, alignItems: 'center' },
  on: { backgroundColor: color['surface/brand'] },
});
