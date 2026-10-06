import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { IconButton, PASSCODE_LENGTH, PasscodePad } from '../../components';
import { getLock, setLock } from '../../state/lock';

type Stage = 'current' | 'new' | 'confirm';
const TITLES: Record<Stage, string> = { current: 'Enter current passcode', new: 'Choose a passcode', confirm: 'Enter it again' };

// Sets the passcode when App lock is turned on, or changes it (`?mode=change` asks for the current one first).
export default function SetPasscode() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const [stage, setStage] = useState<Stage>(mode === 'change' ? 'current' : 'new');
  const [entered, setEntered] = useState('');
  const [first, setFirst] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onDigit = (d: string) => {
    const next = entered + d;
    setError(null);
    if (next.length < PASSCODE_LENGTH) return setEntered(next);
    setEntered('');
    if (stage === 'current') {
      if (next === getLock().passcode) setStage('new');
      else setError('That’s not your current passcode.');
    } else if (stage === 'new') {
      setFirst(next);
      setStage('confirm');
    } else if (next === first) {
      setLock({ enabled: true, passcode: next, locked: false });
      router.back();
    } else {
      setFirst('');
      setStage('new');
      setError('The passcodes didn’t match. Choose one again.');
    }
  };

  return (
    <PasscodePad
      title={TITLES[stage]}
      subtitle={error ?? (stage === 'new' ? 'Four digits you’ll use to open Period.' : stage === 'confirm' ? 'Type the same four digits.' : 'To change it, enter the one you use now.')}
      error={!!error}
      entered={entered.length}
      onDigit={onDigit}
      onDelete={() => setEntered((e) => e.slice(0, -1))}
      header={
        <View style={styles.header}>
          <IconButton icon="x" label="Cancel" onPress={router.back} />
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  header: { height: 56, justifyContent: 'center', paddingHorizontal: 8 },
});
