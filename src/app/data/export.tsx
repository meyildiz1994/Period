import * as Sharing from 'expo-sharing';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Banner, Button, Checkbox, Choice, IconBadge, Page } from '../../components';
import { buildExport, formatSize, writeExport, type ExportFormat, type ExportInclude } from '../../lib/export';
import { defineCopy, useCopy } from '../../i18n';
import { useCommon } from '../../i18n/common';
import { useLog } from '../../state/log';
import { color, radius, type } from '../../theme';

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
type Ready = ReturnType<typeof writeExport>;

const COPY = defineCopy({
  en: {
    title: 'Export data',
    share: 'Share file',
    ready: 'Your file is ready',
    readyBody: 'Save it to Files or send it to yourself.',
    periods: 'Periods',
    cycles: (n: number) => plural(n, 'cycle', 'cycles'),
    days: 'Daily logs',
    daysSub: 'Flow, pain, mood, symptoms',
    notes: 'Notes',
    notesSub: (n: number) => plural(n, 'note', 'notes'),
    export: 'Export',
    failedTitle: 'Export failed',
    failedBody: 'The file couldn’t be saved on this phone. Check that there’s free space and try again.',
    include: 'Include',
    format: 'Format',
    csv: 'CSV · spreadsheet',
    notEncrypted: 'The exported file isn’t encrypted. Store it somewhere private.',
  },
  tr: {
    title: 'Verileri dışa aktar',
    share: 'Dosyayı paylaş',
    ready: 'Dosyan hazır',
    readyBody: 'Dosyalar’a kaydet ya da kendine gönder.',
    periods: 'Adetler',
    cycles: (n: number) => `${n} döngü`,
    days: 'Günlük kayıtlar',
    daysSub: 'Akış, ağrı, ruh hali, belirtiler',
    notes: 'Notlar',
    notesSub: (n: number) => `${n} not`,
    export: 'Dışa aktar',
    failedTitle: 'Dışa aktarılamadı',
    failedBody: 'Dosya bu telefona kaydedilemedi. Boş alan olduğundan emin ol ve tekrar dene.',
    include: 'Dahil et',
    format: 'Biçim',
    csv: 'CSV · tablo',
    notEncrypted: 'Dışa aktarılan dosya şifreli değil. Gizli bir yerde sakla.',
  },
});

// H2 Export data, H3 file ready, H4 export failed.
export default function ExportData() {
  const c = useCopy(COPY);
  const common = useCommon();
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
        title={c.title}
        onBack={router.back}
        footer={
          <>
            <Button label={c.share} iconLeft="share" fullWidth onPress={() => Sharing.shareAsync(ready.uri, { mimeType: ready.mimeType, dialogTitle: ready.name }).catch(() => {})} />
            <Button label={common.done} type="Ghost" fullWidth onPress={router.back} />
          </>
        }
      >
        <View style={styles.done}>
          <IconBadge icon="check" tone="Success" size={64} />
          <Text accessibilityRole="header" style={[type('Title/Medium', 'Bold'), styles.center]}>{c.ready}</Text>
          <Text style={[type('Body/Medium'), styles.center, { color: color['text/secondary'] }]}>{c.readyBody}</Text>
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
    { key: 'periods', title: c.periods, subtitle: c.cycles(periods.length) },
    { key: 'days', title: c.days, subtitle: c.daysSub },
    { key: 'notes', title: c.notes, subtitle: c.notesSub(notes) },
  ];

  return (
    <Page
      title={c.title}
      onBack={router.back}
      footer={<Button label={failed ? common.tryAgain : c.export} iconLeft="download" fullWidth disabled={nothing} onPress={run} />}
    >
      {failed ? (
        <Banner
          kind="Error"
          title={c.failedTitle}
          message={c.failedBody}
          action={common.tryAgain}
          onAction={run}
        />
      ) : null}
      <Text accessibilityRole="header" style={[type('Body/Large', 'SemiBold'), styles.section]}>{c.include}</Text>
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
      <Text accessibilityRole="header" style={[type('Body/Large', 'SemiBold'), styles.section]}>{c.format}</Text>
      <View style={styles.formats} accessibilityRole="radiogroup">
        <View style={{ flex: 3 }}><Choice label={c.csv} icon="file-text" selected={format === 'csv'} onPress={() => setFormat('csv')} /></View>
        <View style={{ flex: 2 }}><Choice label="JSON" icon="code" selected={format === 'json'} onPress={() => setFormat('json')} /></View>
      </View>
      <Banner message={c.notEncrypted} />
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
