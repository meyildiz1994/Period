import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Icon, ListRow, Page } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { useLog } from '../../state/log';
import { color, radius, type } from '../../theme';

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

const COPY = defineCopy({
  en: {
    title: 'Your data',
    stored: 'Stored on this phone',
    counts: (cycles: number, logs: number) => `${plural(cycles, 'cycle', 'cycles')} · ${plural(logs, 'daily log', 'daily logs')}`,
    keepCopy: 'Keep a copy',
    export: 'Export data',
    exportSub: 'Download a CSV or JSON file',
    delete: 'Delete',
    deleteAll: 'Delete all data',
    deleteSub: 'Removes every log from this phone',
  },
  tr: {
    title: 'Verilerin',
    stored: 'Bu telefonda saklanıyor',
    counts: (cycles: number, logs: number) => `${cycles} döngü · ${logs} günlük kayıt`,
    keepCopy: 'Bir kopya sakla',
    export: 'Verileri dışa aktar',
    exportSub: 'CSV ya da JSON dosyası indir',
    delete: 'Sil',
    deleteAll: 'Tüm verileri sil',
    deleteSub: 'Bu telefondaki tüm kayıtları siler',
  },
});

// H1 Your data. v1 has no accounts, so Account backup and Delete account are left out.
export default function YourData() {
  const c = useCopy(COPY);
  const { periods, days } = useLog();
  const logged = Object.keys(days).length;

  return (
    <Page title={c.title} onBack={router.back}>
      <View style={styles.stored}>
        <View style={styles.phone}>
          <Icon name="smartphone" color="text/brand" />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[type('Body/Large', 'SemiBold'), { color: color['text/primary'] }]}>{c.stored}</Text>
          <Text style={[type('Body/Medium'), { color: color['text/secondary'] }]}>
            {c.counts(periods.length, logged)}
          </Text>
        </View>
      </View>

      <Text accessibilityRole="header" style={[type('Body/Large', 'SemiBold'), styles.section]}>{c.keepCopy}</Text>
      <View style={styles.card}>
        <ListRow title={c.export} subtitle={c.exportSub} icon="download" onPress={() => router.push('/data/export')} />
      </View>

      <Text accessibilityRole="header" style={[type('Body/Large', 'SemiBold'), styles.section]}>{c.delete}</Text>
      <View style={styles.card}>
        <ListRow title={c.deleteAll} subtitle={c.deleteSub} icon="trash" destructive onPress={() => router.push('/data/delete')} />
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  stored: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20, borderRadius: radius.xl, backgroundColor: color['surface/muted'] },
  phone: { width: 48, height: 48, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: color['surface/default'] },
  section: { marginTop: 8, color: color['text/primary'] },
  card: { borderRadius: radius.xl, borderWidth: 1, borderColor: color['border/subtle'], backgroundColor: color['surface/default'], overflow: 'hidden' },
});
