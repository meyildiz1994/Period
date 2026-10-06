import * as Sharing from 'expo-sharing';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Banner, Button, Checkbox, Choice, IconBadge, Page } from '../../components';
import { buildExport, formatSize, writeExport, type ExportFormat, type ExportInclude } from '../../lib/export';
import { useLog } from '../../state/log';
import { color, radius, type } from '../../theme';

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
type Ready = ReturnType<typeof writeExport>;

// H2 Export data, H3 file ready, H4 export failed.
export default function ExportData() {
  const { periods, days } = useLog();
  const [include, setInclude] = useState<ExportInclude>({ periods: true, days: true, notes: true });
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [ready, setReady] = useState<Ready | null>(null);
  const [failed, setFailed] = useState(false);
  const notes = Object.values(days).filter((d) => d.note).length;
  const nothing = !include.periods && !include.days && !include.notes;

  const run = () => {
    try {
      setReady(writeExport(buildExport(periods, days, include, format), format));
      setFailed(false);
    } catch {
      setFailed(true);
    }
  };

  if (ready) {
    return (
      <Page
        title="Export data"
        onBack={router.back}
        footer={
          <>
            <Button label="Share file" iconLeft="share" fullWidth onPress={() => Sharing.shareAsync(ready.uri, { mimeType: ready.mimeType, dialogTitle: ready.name }).catch(() => {})} />
            <Button label="Done" type="Ghost" fullWidth onPress={router.back} />
          </>
        }
      >
        <View style={styles.done}>
          <IconBadge icon="check" tone="Success" size={64} />
          <Text accessibilityRole="header" style={[type('Title/Medium', 'Bold'), styles.center]}>Your file is ready</Text>
          <Text style={[type('Body/Medium'), styles.center, { color: color['text/secondary'] }]}>Save it to Files or send it to yourself.</Text>
        </View>
        <View style={[styles.card, styles.file]}>
          <IconBadge icon="file-text" />
          <View style={{ flex: 1 }}>
            <Text style={[type('Body/Medium', 'SemiBold'), { color: color['text/primary'] }]}>{ready.name}</Text>
            <Text style={[type('Body/Small'), { color: color['text/secondary'] }]}>{formatSize(ready.size)}</Text>
          </View>
        </View>
      </Page>
    );
  }

  const rows: { key: keyof ExportInclude; title: string; subtitle: string }[] = [
    { key: 'periods', title: 'Periods', subtitle: plural(periods.length, 'cycle', 'cycles') },
    { key: 'days', title: 'Daily logs', subtitle: 'Flow, pain, mood, symptoms' },
    { key: 'notes', title: 'Notes', subtitle: plural(notes, 'note', 'notes') },
  ];

  return (
    <Page
      title="Export data"
      onBack={router.back}
      footer={<Button label={failed ? 'Try again' : 'Export'} iconLeft="download" fullWidth disabled={nothing} onPress={run} />}
    >
      {failed ? (
        <Banner
          kind="Error"
          title="Export failed"
          message="The file couldn’t be saved on this phone. Check that there’s free space and try again."
          action="Try again"
          onAction={run}
        />
      ) : null}
      <Text accessibilityRole="header" style={[type('Body/Large', 'SemiBold'), styles.section]}>Include</Text>
      <View style={styles.card}>
        {rows.map((r, i) => (
          <View key={r.key}>
            {i > 0 ? <View style={styles.divider} /> : null}
            <View style={styles.row}>
              <Checkbox checked={include[r.key]} label={r.title} onChange={(v) => setInclude((s) => ({ ...s, [r.key]: v }))} />
              <View style={{ flex: 1 }}>
                <Text style={[type('Body/Large', 'Medium'), { color: color['text/primary'] }]}>{r.title}</Text>
                <Text style={[type('Body/Small'), { color: color['text/secondary'] }]}>{r.subtitle}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
      <Text accessibilityRole="header" style={[type('Body/Large', 'SemiBold'), styles.section]}>Format</Text>
      <View style={styles.formats} accessibilityRole="radiogroup">
        <View style={{ flex: 3 }}><Choice label="CSV · spreadsheet" icon="file-text" selected={format === 'csv'} onPress={() => setFormat('csv')} /></View>
        <View style={{ flex: 2 }}><Choice label="JSON" icon="code" selected={format === 'json'} onPress={() => setFormat('json')} /></View>
      </View>
      <Banner message="The exported file isn’t encrypted. Store it somewhere private." />
    </Page>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 8, color: color['text/primary'] },
  card: { borderRadius: radius.xl, borderWidth: 1, borderColor: color['border/subtle'], backgroundColor: color['surface/default'] },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 16, paddingHorizontal: 20 },
  divider: { height: 1, marginHorizontal: 20, backgroundColor: color['surface/divider'] },
  formats: { flexDirection: 'row', gap: 8 },
  done: { alignItems: 'center', gap: 12, marginTop: 48, marginBottom: 16 },
  center: { textAlign: 'center', color: color['text/primary'] },
  file: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20 },
});
