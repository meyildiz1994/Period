import { router } from 'expo-router';
import { View } from 'react-native';

import { OptionCard, Page } from '../../components';
import { defineCopy, LANGUAGES, useCopy, useLang } from '../../i18n';
import { setOnboarding } from '../../state/onboarding';

const COPY = defineCopy({
  en: { title: 'Language', intro: 'Nilemy follows your phone’s language until you pick one here.' },
  tr: { title: 'Dil', intro: 'Burada bir dil seçene kadar Nilemy telefonunun dilini kullanır.' },
});

// Me › Language. Applies straight away.
export default function LanguageSettings() {
  const c = useCopy(COPY);
  const lang = useLang();
  return (
    <Page title={c.title} onBack={router.back} intro={c.intro}>
      <View style={{ gap: 12 }} accessibilityRole="radiogroup">
        {LANGUAGES.map((l) => (
          <OptionCard key={l.id} title={l.name} icon="globe" selected={lang === l.id} onPress={() => setOnboarding({ language: l.id })} />
        ))}
      </View>
    </Page>
  );
}
