import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking, Platform, StyleSheet, View } from 'react-native';

import { randomUUID } from 'expo-crypto';

import { Banner, BottomSheet, Button, Choice, Divider, Input, ListRow, Page, ReminderTiming, SectionHeader } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { formatClock } from '../../lib/dates';
import { notificationAccess, requestNotificationAccess, type NotificationAccess } from '../../lib/notifications';
import { setOnboarding, useOnboarding, type CustomReminder } from '../../state/onboarding';
import { usePremium } from '../../state/premium';
import { color, radius } from '../../theme';

const TIMES = ['07:00', '08:00', '09:00', '12:00', '18:00', '20:00', '21:00'];
const OWN_TIMES = Array.from({ length: 18 }, (_, i) => `${String(i + 6).padStart(2, '0')}:00`);
const TITLE_MAX = 40;

const COPY = defineCopy({
  en: {
    title: 'Reminders',
    offTitle: 'Notifications are off for Nilemy',
    offMessage: (ios: boolean) => `Notifications are off for Nilemy in ${ios ? 'iPhone Settings' : 'your phone’s settings'}, so reminders can’t reach you.`,
    openSettings: 'Open Settings',
    period: 'Period reminder',
    periodHint: 'Before your estimated start date',
    remindAt: 'Remind me at',
    only: 'Nilemy only sends the reminders you turn on here. No marketing notifications.',
    pattern: 'Symptom heads-up',
    patternHint: 'Names what you usually log before your period',
    own: 'Your reminders',
    ownHint: 'Daily, at the time you pick. For vitamins, medication or anything else.',
    add: 'Add reminder',
    edit: 'Reminder',
    name: 'What to remind you about',
    namePlaceholder: 'e.g. Iron supplement',
    time: 'Time',
    save: 'Save',
    remove: 'Delete reminder',
    premium: 'Premium',
  },
  tr: {
    title: 'Hatırlatıcılar',
    offTitle: 'Nilemy için bildirimler kapalı',
    offMessage: (ios: boolean) => `${ios ? 'iPhone Ayarları’nda' : 'Telefonunun ayarlarında'} Nilemy için bildirimler kapalı, bu yüzden hatırlatıcılar sana ulaşamıyor.`,
    openSettings: 'Ayarları aç',
    period: 'Adet hatırlatıcısı',
    periodHint: 'Tahmini başlangıç tarihinden önce',
    remindAt: 'Hatırlatma saati',
    only: 'Nilemy yalnızca burada açtığın hatırlatıcıları gönderir. Pazarlama bildirimi yok.',
    pattern: 'Belirti uyarısı',
    patternHint: 'Adetinden önce genelde ne kaydettiğini söyler',
    own: 'Kendi hatırlatıcıların',
    ownHint: 'Her gün seçtiğin saatte. Vitamin, ilaç ya da başka bir şey için.',
    add: 'Hatırlatıcı ekle',
    edit: 'Hatırlatıcı',
    name: 'Neyi hatırlatalım',
    namePlaceholder: 'ör. Demir takviyesi',
    time: 'Saat',
    save: 'Kaydet',
    remove: 'Hatırlatıcıyı sil',
    premium: 'Premium',
  },
});

// G3 Reminders, and G4 when notifications are turned off for Period in the phone's settings.
export default function Reminders() {
  const c = useCopy(COPY);
  const { reminder, patternReminder, customReminders } = useOnboarding();
  const { premium } = usePremium();
  const [editing, setEditing] = useState<CustomReminder | null>(null);
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

      {on ? (
        <View style={styles.card}>
          <ListRow
            title={c.pattern}
            subtitle={premium ? c.patternHint : `${c.premium} · ${c.patternHint}`}
            icon={premium ? 'sparkles' : 'lock'}
            trailing="Toggle"
            toggled={premium && patternReminder}
            onToggle={(v) => (premium ? setOnboarding({ patternReminder: v }) : router.push('/premium'))}
          />
        </View>
      ) : null}

      <SectionHeader title={c.own} />
      <View style={styles.card}>
        {customReminders.map((r, i) => (
          <View key={r.id}>
            {i > 0 ? <Divider inset={0} /> : null}
            <ListRow
              title={r.title}
              subtitle={formatClock(r.time)}
              icon="bell"
              trailing="Toggle"
              toggled={r.enabled && !blocked}
              disabled={blocked}
              onToggle={async (v) => {
                if (v && (await requestNotificationAccess().then((a) => (setAccess(a), a))) === 'denied') return;
                setOnboarding({ customReminders: customReminders.map((x) => (x.id === r.id ? { ...x, enabled: v } : x)) });
              }}
              onPress={() => setEditing(r)}
            />
          </View>
        ))}
        {customReminders.length ? <Divider inset={0} /> : null}
        <ListRow
          title={c.add}
          subtitle={premium ? c.ownHint : `${c.premium} · ${c.ownHint}`}
          icon={premium ? 'plus' : 'lock'}
          onPress={() => (premium ? setEditing({ id: '', title: '', time: '09:00', enabled: true }) : router.push('/premium'))}
        />
      </View>

      <Banner message={c.only} />

      <OwnReminderSheet
        value={editing}
        onClose={() => setEditing(null)}
        onSave={async (r) => {
          await requestNotificationAccess().then(setAccess).catch(() => {});
          const next = r.id ? customReminders.map((x) => (x.id === r.id ? r : x)) : [...customReminders, { ...r, id: randomUUID() }];
          setOnboarding({ customReminders: next });
          setEditing(null);
        }}
        onDelete={(id) => {
          setOnboarding({ customReminders: customReminders.filter((x) => x.id !== id) });
          setEditing(null);
        }}
      />

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

function OwnReminderSheet({ value, onClose, onSave, onDelete }: {
  value: CustomReminder | null; onClose: () => void; onSave: (r: CustomReminder) => void; onDelete: (id: string) => void;
}) {
  const c = useCopy(COPY);
  return (
    <BottomSheet visible={!!value} title={c.edit} onClose={onClose}>
      {value ? <OwnReminderForm key={value.id || 'new'} value={value} onSave={onSave} onDelete={onDelete} /> : null}
    </BottomSheet>
  );
}

function OwnReminderForm({ value, onSave, onDelete }: { value: CustomReminder; onSave: (r: CustomReminder) => void; onDelete: (id: string) => void }) {
  const c = useCopy(COPY);
  const [title, setTitle] = useState(value.title);
  const [time, setTime] = useState(value.time);
  return (
    <View style={styles.sheet}>
      <Input label={c.name} placeholder={c.namePlaceholder} value={title} onChangeText={setTitle} maxLength={TITLE_MAX} />
      <View style={styles.times} accessibilityRole="radiogroup">
        {OWN_TIMES.map((t) => <Choice key={t} label={formatClock(t)} selected={time === t} onPress={() => setTime(t)} />)}
      </View>
      <Button label={c.save} fullWidth disabled={!title.trim()} onPress={() => onSave({ ...value, title: title.trim(), time, enabled: true })} />
      {value.id ? <Button label={c.remove} type="Ghost" fullWidth onPress={() => onDelete(value.id)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, borderWidth: 1, borderColor: color['border/subtle'], backgroundColor: color['surface/default'], overflow: 'hidden' },
  times: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 16 },
  sheet: { gap: 12, paddingBottom: 8 },
});
