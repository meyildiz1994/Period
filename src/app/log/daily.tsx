import { router, useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BottomSheet, Button, Choice, FLOW_LEVELS, FlowLevel, Input, Page, Tag, TextArea, Toast, type FlowLevelName } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { useCommon } from '../../i18n/common';
import { diffDays, formatDay, fromISODate, toISODate } from '../../lib/dates';
import { periodSpan, useCycleSettings } from '../../state/cycle';
import { getLog, saveDay, type Energy, type Mood, type Pain } from '../../state/log';
import { getOnboarding, setOnboarding, useOnboarding } from '../../state/onboarding';
import { usePremium } from '../../state/premium';
import { flush } from '../../state/persist';
import { SYMPTOMS } from '../../state/symptoms';
import { color, type, type IconName } from '../../theme';

const PAIN: Pain[] = ['None', 'Mild', 'Moderate', 'Severe'];
const MOODS: { mood: Mood; icon: IconName }[] = [
  { mood: 'Good', icon: 'laugh' },
  { mood: 'Okay', icon: 'meh' },
  { mood: 'Low', icon: 'frown' },
  { mood: 'Irritable', icon: 'angry' },
  { mood: 'Anxious', icon: 'help' },
];
const ENERGY: { energy: Energy; icon: IconName }[] = [
  { energy: 'High', icon: 'sun' },
  { energy: 'Medium', icon: 'activity' },
  { energy: 'Low', icon: 'moon' },
];
const NOTE_MAX = 250;
const SYMPTOM_MAX = 30;

const COPY = defineCopy({
  en: {
    title: 'Daily log',
    saveFailed: 'Couldn’t save. Your entries are kept on this screen.',
    retry: 'Retry',
    cycleDay: (n: number) => `Cycle day ${n}`,
    period: 'Period',
    flow: 'Flow',
    pain: 'Pain',
    mood: 'Mood',
    energy: 'Energy',
    symptoms: 'Symptoms',
    add: 'Add',
    newSymptom: 'New symptom',
    newTitle: 'Add your own symptom',
    newLabel: 'Symptom name',
    newHelper: 'Saved for future logs too. Premium.',
    note: 'Note',
  },
  tr: {
    title: 'Günlük kayıt',
    saveFailed: 'Kaydedilemedi. Girdiklerin bu ekranda duruyor.',
    retry: 'Tekrar dene',
    cycleDay: (n: number) => `Döngünün ${n}. günü`,
    period: 'Adet',
    flow: 'Akış',
    pain: 'Ağrı',
    mood: 'Ruh hali',
    energy: 'Enerji',
    symptoms: 'Belirtiler',
    add: 'Ekle',
    newSymptom: 'Yeni belirti',
    newTitle: 'Kendi belirtini ekle',
    newLabel: 'Belirti adı',
    newHelper: 'Sonraki kayıtlarda da çıkar. Premium.',
    note: 'Not',
  },
});

// C3 Daily log for today, or for `?date=YYYY-MM-DD`. Every field is optional.
export default function DailyLog() {
  const c = useCopy(COPY);
  const common = useCommon();
  const params = useLocalSearchParams<{ date?: string }>();
  const [dateKey] = useState(() => params.date ?? toISODate(new Date()));
  const date = fromISODate(dateKey);
  const settings = useCycleSettings();
  const { symptoms: quick, customSymptoms } = useOnboarding();
  const { premium } = usePremium();

  const [saved] = useState(() => getLog().days[dateKey]);
  const [flow, setFlow] = useState<FlowLevelName | null>(saved?.flow ?? null);
  const [pain, setPain] = useState<Pain | null>(saved?.pain ?? null);
  const [mood, setMood] = useState<Mood | null>(saved?.mood ?? null);
  const [energy, setEnergy] = useState<Energy | null>(saved?.energy ?? null);
  const [symptoms, setSymptoms] = useState<string[]>(saved?.symptoms ?? []);
  const [note, setNote] = useState(saved?.note ?? '');
  const [showAll, setShowAll] = useState(false);
  const [failed, setFailed] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  const cycleDay = settings.lastPeriodStart ? diffDays(fromISODate(settings.lastPeriodStart), date) + 1 : 0;
  const inPeriod = cycleDay >= 1 && cycleDay <= periodSpan(settings);
  // Quick options from onboarding plus anything already logged; "Add" reveals the full list.
  const offered = SYMPTOMS.filter((s) => showAll || quick.includes(s.label) || symptoms.includes(s.label));
  // The user's own symptoms (Premium) follow the built-in ones; once logged they stay visible.
  const own = customSymptoms.filter((s) => showAll || symptoms.includes(s));
  const toggle = (s: string) => setSymptoms((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  const save = async () => {
    try {
      saveDay(dateKey, { flow, pain, mood, energy, symptoms, note: note.trim() });
      await flush();
      router.back();
    } catch {
      setFailed(true);
    }
  };

  const addOwn = () => {
    const name = draft.trim().replace(/\s+/g, ' ');
    if (!name) return;
    const known = [...SYMPTOMS.map((s) => s.label), ...getOnboarding().customSymptoms].find((s) => s.toLocaleLowerCase() === name.toLocaleLowerCase());
    if (!known) setOnboarding({ customSymptoms: [...getOnboarding().customSymptoms, name] });
    const label = known ?? name;
    setSymptoms((cur) => (cur.includes(label) ? cur : [...cur, label]));
    setDraft('');
    setAdding(false);
  };

  return (
    <Page
      title={c.title}
      onBack={router.back}
      footer={<Button label={common.save} iconLeft="check" fullWidth disabled={note.length > NOTE_MAX} onPress={save} />}
      overlay={failed ? <Toast kind="Error" message={c.saveFailed} action={c.retry} onAction={() => { setFailed(false); save(); }} /> : null}
    >
      <View style={styles.head}>
        <Text accessibilityRole="header" style={[type('Headline', 'SemiBold'), styles.title]}>{formatDay(date)}</Text>
        {cycleDay >= 1 ? <Tag label={c.cycleDay(cycleDay)} /> : null}
        {inPeriod ? <Tag label={c.period} tone="Strong" /> : null}
      </View>

      <Section title={c.flow}>
        <View style={styles.flows} accessibilityRole="radiogroup">
          {FLOW_LEVELS.map((f) => (
            <FlowLevel key={f.level} level={f.level} selected={flow === f.level} onPress={() => setFlow(flow === f.level ? null : f.level)} />
          ))}
        </View>
      </Section>

      <Section title={c.pain}>
        <View style={styles.chips}>
          {PAIN.map((p) => <Choice key={p} label={common.pain[p]} selected={pain === p} onPress={() => setPain(pain === p ? null : p)} />)}
        </View>
      </Section>

      <Section title={c.mood}>
        <View style={styles.chips}>
          {MOODS.map((m) => <Choice key={m.mood} label={common.mood[m.mood]} icon={m.icon} selected={mood === m.mood} onPress={() => setMood(mood === m.mood ? null : m.mood)} />)}
        </View>
      </Section>

      <Section title={c.energy}>
        <View style={styles.chips}>
          {ENERGY.map((e) => <Choice key={e.energy} label={common.energy[e.energy]} icon={e.icon} selected={energy === e.energy} onPress={() => setEnergy(energy === e.energy ? null : e.energy)} />)}
        </View>
      </Section>

      <Section title={c.symptoms}>
        <View style={styles.chips}>
          {offered.map((s) => <Choice key={s.label} label={common.symptom[s.label] ?? s.label} icon={s.icon} selected={symptoms.includes(s.label)} onPress={() => toggle(s.label)} />)}
          {own.map((s) => <Choice key={s} label={s} icon="dot-sm" selected={symptoms.includes(s)} onPress={() => toggle(s)} />)}
          {showAll ? (
            <Choice label={c.newSymptom} icon={premium ? 'plus' : 'lock'} onPress={() => (premium ? setAdding(true) : router.push('/premium'))} />
          ) : (
            <Choice label={c.add} icon="plus" onPress={() => setShowAll(true)} />
          )}
        </View>
      </Section>

      <Section title={c.note}>
        <TextArea value={note} onChangeText={setNote} max={NOTE_MAX} />
      </Section>
      <BottomSheet visible={adding} title={c.newTitle} onClose={() => setAdding(false)}>
        <View style={styles.sheet}>
          <Input label={c.newLabel} helper={c.newHelper} value={draft} onChangeText={setDraft} maxLength={SYMPTOM_MAX} autoFocus returnKeyType="done" onSubmitEditing={addOwn} />
          <Button label={c.add} fullWidth disabled={!draft.trim()} onPress={addOwn} />
        </View>
      </BottomSheet>
    </Page>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={[type('Body/Large', 'SemiBold'), { color: color['text/primary'] }]}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  title: { flex: 1, color: color['text/primary'] },
  section: { gap: 12, marginTop: 8 },
  flows: { flexDirection: 'row', justifyContent: 'space-between' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sheet: { gap: 16, paddingTop: 8 },
});
