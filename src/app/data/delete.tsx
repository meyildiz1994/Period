import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Banner, Button, Icon, Page } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { useCommon } from '../../i18n/common';
import { resetLock } from '../../state/lock';
import { resetLog, useLog } from '../../state/log';
import { resetOnboarding } from '../../state/onboarding';
import { flush } from '../../state/persist';
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
  },
  tr: {
    title: 'Tüm verileri sil',
    heading: 'Bu telefondaki her şey silinsin mi?',
    body: (cycles: number, logs: number) => `${cycles} döngü ve ${logs} günlük kayıt kalıcı olarak silinir. Bu işlem geri alınamaz.`,
    copyFirst: 'Önce bir kopya ister misin? Silmeden önce verilerini dışa aktar.',
    export: 'Dışa aktar',
  },
});

// H5 Delete all data: the second step after the row on Your data. Clears logs and settings,
// then starts again from onboarding.
export default function DeleteAll() {
  const c = useCopy(COPY);
  const common = useCommon();
  const { periods, days } = useLog();
  const logged = Object.keys(days).length;

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
              await flush().catch(() => {});
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
      <Banner message={c.copyFirst} action={c.export} onAction={() => router.push('/data/export')} />
    </Page>
  );
}

const styles = StyleSheet.create({
  badge: { width: 56, height: 56, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: color['feedback/danger-subtle'] },
});
