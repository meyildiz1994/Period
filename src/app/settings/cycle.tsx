import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Banner, Button, CYCLE_RANGE, Divider, LengthRow, ListRow, Page, PERIOD_RANGE } from '../../components';
import { pastCycles } from '../../state/history';
import { insights } from '../../state/insights';
import { getLog } from '../../state/log';
import { getOnboarding, setOnboarding } from '../../state/onboarding';
import { color, radius, type } from '../../theme';

// G2 Cycle settings. Edits a draft; Save changes applies it.
export default function CycleSettings() {
  const [draft, setDraft] = useState(() => {
    const s = getOnboarding();
    return { cycleLength: s.cycleLength, periodLength: s.periodLength, showPredicted: s.showPredicted, weekStartsOn: s.weekStartsOn };
  });
  const [avg] = useState(() => {
    const { periods, days } = getLog();
    return insights(pastCycles(periods, draft.periodLength), days, new Date());
  });
  const patch = (p: Partial<typeof draft>) => setDraft((d) => ({ ...d, ...p }));

  return (
    <Page
      title="Cycle settings"
      onBack={router.back}
      intro="Used for estimates until you’ve logged enough cycles. After that, your own history takes over."
      footer={
        <Button
          label="Save changes"
          fullWidth
          onPress={() => {
            setOnboarding(draft);
            router.back();
          }}
        />
      }
    >
      <View style={styles.card}>
        <LengthRow
          title="Cycle length"
          subtitle={avg ? `Your average: ${avg.avgCycle} days` : 'Most cycles are 21–35 days'}
          value={draft.cycleLength}
          {...CYCLE_RANGE}
          onChange={(v) => patch({ cycleLength: v })}
        />
        <View style={styles.divider} />
        <LengthRow
          title="Period length"
          subtitle={avg ? `Your average: ${avg.avgPeriod} days` : 'Usually 3–7 days'}
          value={draft.periodLength}
          {...PERIOD_RANGE}
          onChange={(v) => patch({ periodLength: v })}
        />
      </View>

      <Text accessibilityRole="header" style={[type('Body/Large', 'SemiBold'), styles.section]}>Calendar</Text>
      <View style={[styles.card, { overflow: 'hidden' }]}>
        <ListRow
          title="Show predicted days"
          subtitle="Dashed outline on the calendar"
          icon="calendar"
          trailing="Toggle"
          toggled={draft.showPredicted}
          onToggle={(v) => patch({ showPredicted: v })}
        />
        <Divider inset={0} />
        <ListRow
          title="Week starts on"
          icon="calendar-grid"
          trailing="Value"
          value={draft.weekStartsOn === 0 ? 'Sunday' : 'Monday'}
          onPress={() => patch({ weekStartsOn: draft.weekStartsOn === 0 ? 1 : 0 })}
        />
      </View>

      <Banner message="Changing these doesn’t edit periods you’ve already logged." />
    </Page>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, borderWidth: 1, borderColor: color['border/subtle'], backgroundColor: color['surface/default'] },
  divider: { height: 1, marginHorizontal: 20, backgroundColor: color['surface/divider'] },
  section: { marginTop: 8, color: color['text/primary'] },
});
