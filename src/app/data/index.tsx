import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Divider, Icon, ListRow, Page } from '../../components';
import { useLog } from '../../state/log';
import { color, radius, type } from '../../theme';

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

// H1 Your data. Export and account backup arrive in step 8b (rows shown, not wired yet);
// Delete account appears once accounts exist.
export default function YourData() {
  const { periods, days } = useLog();
  const logged = Object.keys(days).length;

  return (
    <Page title="Your data" onBack={router.back}>
      <View style={styles.stored}>
        <View style={styles.phone}>
          <Icon name="smartphone" color="text/brand" />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[type('Body/Large', 'SemiBold'), { color: color['text/primary'] }]}>Stored on this phone</Text>
          <Text style={[type('Body/Medium'), { color: color['text/secondary'] }]}>
            {plural(periods.length, 'cycle', 'cycles')} · {plural(logged, 'daily log', 'daily logs')}
          </Text>
        </View>
      </View>

      <Text accessibilityRole="header" style={[type('Body/Large', 'SemiBold'), styles.section]}>Keep a copy</Text>
      <View style={styles.card}>
        <ListRow title="Export data" subtitle="Download a CSV or JSON file" icon="download" />
        <Divider inset={0} />
        <ListRow title="Account backup" subtitle="Restore on a new phone" icon="refresh" trailing="Value" value="Off" />
      </View>

      <Text accessibilityRole="header" style={[type('Body/Large', 'SemiBold'), styles.section]}>Delete</Text>
      <View style={styles.card}>
        <ListRow title="Delete all data" subtitle="Removes every log from this phone" icon="trash" destructive onPress={() => router.push('/data/delete')} />
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
