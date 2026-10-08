import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking, Platform, StyleSheet, View } from 'react-native';

import { Banner, BottomSheet, Choice, ListRow, Page, ReminderTiming } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { formatClock } from '../../lib/dates';
import { notificationAccess, requestNotificationAccess, type NotificationAccess } from '../../lib/notifications';
import { setOnboarding, useOnboarding } from '../../state/onboarding';
import { color, radius } from '../../theme';

const TIMES = ['07:00', '08:00', '09:00', '12:00', '18:00', '20:00', '21:00'];

const COPY = defineCopy({
  en: {
    title: 'Reminders',
    offTitle: 'Notifications are off for Nilemy',
    offMessage: (ios: boolean) => `Notifications are off for Nilemy in ${ios ? 'iPhone Settings' : 'your phone’s settings'}, so reminders can’t reach you.`,
    openSettings: 'Open Settings',
    period: 'Period reminder',
    periodHint: 'Before your estimated start date',
    remindAt: 'Remind me at',
    only: 'This is the only reminder Nilemy sends. No marketing notifications.',
  },
  tr: {
    title: 'Hatırlatıcılar',
    offTitle: 'Nilemy için bildirimler kapalı',
    offMessage: (ios: boolean) => `${ios ? 'iPhone Ayarları’nda' : 'Telefonunun ayarlarında'} Nilemy için bildirimler kapalı, bu yüzden hatırlatıcılar sana ulaşamıyor.`,
    openSettings: 'Ayarları aç',
    period: 'Adet hatırlatıcısı',
    periodHint: 'Tahmini başlangıç tarihinden önce',
    remindAt: 'Hatırlatma saati',
    only: 'Nilemy yalnızca bu hatırlatıcıyı gönderir. Pazarlama bildirimi yok.',
  },
});

// G3 Reminders, and G4 when notifications are turned off for Period in the phone's settings.
export default function Reminders() {
  const c = useCopy(COPY);
  const { reminder } = useOnboarding();
  const [picking, setPicking] = useState(false);
  const [access, setAccess] = useState<NotificationAccess>('undetermined');
  const update = (patch: Partial<typeof reminder>) => setOnboarding({ reminder: { ...reminder, ...patch } });

  // Check again whenever the app comes back, e.g. from the phone's settings.
  const refresh = useCallback(() => {
    notificationAccess().then(setAccess).catch(() => {});
  }, []);
  useEffect(() => {
    refresh();
    const sub = AppState.addEventListener('change', (s) => s === 'active' && refresh());
    return () => sub.remove();
  }, [refresh]);

  const blocked = access === 'denied';
  const on = reminder.enabled && !blocked;

  return (
    <Page title={c.title} onBack={router.back}>
      {blocked ? (
        <Banner
          kind="Warning"
          title={c.offTitle}
          message={c.offMessage(Platform.OS === 'ios')}
          action={c.openSettings}
          onAction={() => Linking.openSettings().catch(() => {})}
        />
      ) : null}

      <View style={styles.card}>
        <ListRow
          title={c.period}
          subtitle={c.periodHint}
          icon={blocked ? 'bell-off' : 'bell-ring'}
          trailing="Toggle"
          toggled={on}
          disabled={blocked}
          onToggle={async (v) => {
            if (!v) return update({ enabled: false });
            const result = await requestNotificationAccess();
            setAccess(result);
            if (result === 'granted' || result === 'unsupported') update({ enabled: true });
          }}
        />
      </View>

      {on ? (
        <>
          <ReminderTiming value={reminder.daysBefore} onChange={(n) => update({ daysBefore: n })} />
          <View style={styles.card}>
            <ListRow title={c.remindAt} icon="clock" trailing="Value" value={formatClock(reminder.time)} onPress={() => setPicking(true)} />
          </View>
        </>
      ) : null}

      <Banner message={c.only} />

      <BottomSheet visible={picking} title={c.remindAt} onClose={() => setPicking(false)}>
        <View style={styles.times} accessibilityRole="radiogroup">
          {TIMES.map((t) => (
            <Choice
              key={t}
              label={formatClock(t)}
              selected={reminder.time === t}
              onPress={() => {
                update({ time: t });
                setPicking(false);
              }}
            />
          ))}
        </View>
      </BottomSheet>
    </Page>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, borderWidth: 1, borderColor: color['border/subtle'], backgroundColor: color['surface/default'], overflow: 'hidden' },
  times: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 16 },
});
