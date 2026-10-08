import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { IconButton, PASSCODE_LENGTH, PasscodePad } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { checkPasscode, setPasscode } from '../../state/lock';

type Stage = 'current' | 'new' | 'confirm';

const COPY = defineCopy({
  en: {
    titles: { current: 'Enter current passcode', new: 'Choose a passcode', confirm: 'Enter it again' } as Record<Stage, string>,
    hints: { current: 'To change it, enter the one you use now.', new: 'Four digits you’ll use to open Nilemy.', confirm: 'Type the same four digits.' } as Record<Stage, string>,
    notCurrent: 'That’s not your current passcode.',
    mismatch: 'The passcodes didn’t match. Choose one again.',
    cancel: 'Cancel',
  },
  tr: {
    titles: { current: 'Mevcut şifreni gir', new: 'Bir şifre seç', confirm: 'Tekrar gir' },
    hints: { current: 'Değiştirmek için şu an kullandığın şifreyi gir.', new: 'Nilemy’yi açmak için kullanacağın dört rakam.', confirm: 'Aynı dört rakamı yaz.' },
    notCurrent: 'Bu, mevcut şifren değil.',
    mismatch: 'Şifreler eşleşmedi. Yeniden bir tane seç.',
    cancel: 'Vazgeç',
  },
});

// Sets the passcode when App lock is turned on, or changes it (`?mode=change` asks for the current one first).
export default function SetPasscode() {
  const c = useCopy(COPY);
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const [stage, setStage] = useState<Stage>(mode === 'change' ? 'current' : 'new');
  const [entered, setEntered] = useState('');
  const [first, setFirst] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onDigit = async (d: string) => {
    const next = entered + d;
    setError(null);
    if (next.length < PASSCODE_LENGTH) return setEntered(next);
    setEntered('');
    if (stage === 'current') {
      if (await checkPasscode(next)) setStage('new');
      else setError(c.notCurrent);
    } else if (stage === 'new') {
      setFirst(next);
      setStage('confirm');
    } else if (next === first) {
      await setPasscode(next);
      router.back();
    } else {
      setFirst('');
      setStage('new');
      setError(c.mismatch);
    }
  };

  return (
    <PasscodePad
      title={c.titles[stage]}
      subtitle={error ?? c.hints[stage]}
      error={!!error}
      entered={entered.length}
      onDigit={onDigit}
      onDelete={() => setEntered((e) => e.slice(0, -1))}
      header={
        <View style={styles.header}>
          <IconButton icon="x" label={c.cancel} onPress={router.back} />
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  header: { height: 56, justifyContent: 'center', paddingHorizontal: 8 },
});
