import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Banner, Button, Icon, Page } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { useCommon } from '../../i18n/common';
import { resetLock } from '../../state/lock';
import { resetLog, useLog } from '../../state/log';
import { resetOnboarding } from '../../state/onboarding';
import { flush, wipe } from '../../state/persist';
import { color, type } from '../../theme';

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

const COPY = defineCopy({
  en: {
    title: 'Delete all data',
    heading: 'Delete everything on this phone?',
    body: (cycles: number, logs: number) =>
      `This permanently removes ${plural(cycles, 'cycle', 'cycles')} and ${plural(logs, 'daily log', 'daily logs')}. It can’t be undone.`,
    copyFirst: 'Want a copy first? Export your data before deleting.',
    export: 'Export',
    failedTitle: 'Couldn’t delete everything',
    failed: 'Some data couldn’t be removed from this phone. Try again.',
  },
  tr: {
    title: 'Tüm verileri sil',
    heading: 'Bu telefondaki her şey silinsin mi?',
    body: (cycles: number, logs: number) => `${cycles} döngü ve ${logs} günlük kayıt kalıcı olarak silinir. Bu işlem geri alınamaz.`,
    copyFirst: 'Önce bir kopya ister misin? Silmeden önce verilerini dışa aktar.',
    export: 'Dışa aktar',
    failedTitle: 'Her şey silinemedi',
    failed: 'Bazı veriler bu telefondan kaldırılamadı. Tekrar dene.',
  },
});

// H5 Delete all data: the second step after the row on Your data. Clears logs and settings,
// deletes the data file, its key and any export left in the cache, then starts again from
// onboarding. Says so if any of that fails instead of claiming it's gone.
export default function DeleteAll() {
  const c = useCopy(COPY);
  const common = useCommon();
  const { periods, days } = useLog();
  const logged = Object.keys(days).length;
  const [failed, setFailed] = useState(false);

  return (
    <Page
      title={c.title}
      onBack={router.back}
      footer={
        <>
          <Button
            label={c.title}
            type="Destructive"
            fullWidth
            onPress={async () => {
              resetLog();
              resetOnboarding();
              resetLock();
              try {
                await wipe();
                // Keeps only the language choice, in a new file with a new key.
                await flush();
              } catch {
                setFailed(true);
                return;
              }
              router.dismissAll();
              router.replace('/');
            }}
          />
          <Button label={common.cancel} type="Ghost" fullWidth onPress={router.back} />
        </>
      }
    >
      <View style={styles.badge}>
        <Icon name="trash" size={28} color="feedback/danger" />
      </View>
      <Text accessibilityRole="header" style={[type('Title/Medium', 'Bold'), { color: color['text/primary'] }]}>{c.heading}</Text>
      <Text style={[type('Body/Medium'), { color: color['text/secondary'] }]}>
        {c.body(periods.length, logged)}
      </Text>
      {failed ? <Banner kind="Error" title={c.failedTitle} message={c.failed} /> : null}
      <Banner message={c.copyFirst} action={c.export} onAction={() => router.push('/data/export')} />
    </Page>
  );
}

const styles = StyleSheet.create({
  badge: { width: 56, height: 56, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: color['feedback/danger-subtle'] },
});
