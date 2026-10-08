import { router } from 'expo-router';
import { useState } from 'react';

import { Button, Input, Page } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { cleanName, NAME_MAX } from '../../state/name';
import { getOnboarding, setOnboarding } from '../../state/onboarding';

const COPY = defineCopy({
  en: { title: 'Your name', intro: 'Shown in the Home greeting and on your avatar.', label: 'Name', helper: 'Only kept on this phone.', save: 'Save' },
  tr: { title: 'Adın', intro: 'Ana sayfadaki selamlamada ve profil resminde görünür.', label: 'Ad', helper: 'Sadece bu telefonda kalır.', save: 'Kaydet' },
});

// Me › name (tap the profile card). Same rules as the onboarding step: required, trimmed.
export default function NameSettings() {
  const c = useCopy(COPY);
  const [name, setName] = useState(() => getOnboarding().name ?? '');
  const clean = cleanName(name);
  const save = () => {
    if (!clean) return;
    setOnboarding({ name: clean });
    router.back();
  };
  return (
    <Page title={c.title} onBack={router.back} intro={c.intro} footer={<Button label={c.save} fullWidth disabled={!clean} onPress={save} />}>
      <Input label={c.label} helper={c.helper} value={name} onChangeText={setName} maxLength={NAME_MAX} autoFocus autoCapitalize="words" returnKeyType="done" onSubmitEditing={save} />
    </Page>
  );
}
