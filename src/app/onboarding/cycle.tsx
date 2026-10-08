import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Card, CYCLE_RANGE, LengthRow, OnboardingStep, PERIOD_RANGE, Radio } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { setOnboarding, useOnboarding, type Regularity } from '../../state/onboarding';
import { color, type } from '../../theme';

const COPY = defineCopy({
  en: {
    title: 'Your usual cycle',
    body: 'We start with common defaults. Change them if you know your numbers.',
    continue: 'Continue',
    cycleTitle: 'Cycle length',
    cycleSubtitle: 'First day of one period to the next',
    cycleHint: 'Most cycles are 21–35 days',
    periodTitle: 'Period length',
    periodSubtitle: 'Days of bleeding',
    periodHint: 'Usually 3–7 days',
    regularQuestion: 'Is your cycle regular?',
    regularity: {
      regular: { title: 'Regular', subtitle: 'Varies by a few days' },
      irregular: { title: 'Irregular', subtitle: 'Varies by a week or more' },
      unsure: { title: 'Not sure', subtitle: 'We’ll learn from your logs' },
    } as Record<Regularity, { title: string; subtitle: string }>,
  },
  tr: {
    title: 'Olağan döngün',
    body: 'Yaygın değerlerle başlıyoruz. Kendi değerlerini biliyorsan değiştir.',
    continue: 'Devam',
    cycleTitle: 'Döngü süresi',
    cycleSubtitle: 'Bir adetin ilk gününden sonrakine',
    cycleHint: 'Çoğu döngü 21–35 gündür',
    periodTitle: 'Adet süresi',
    periodSubtitle: 'Kanamalı gün sayısı',
    periodHint: 'Genellikle 3–7 gün',
    regularQuestion: 'Döngün düzenli mi?',
    regularity: {
      regular: { title: 'Düzenli', subtitle: 'Birkaç gün değişir' },
      irregular: { title: 'Düzensiz', subtitle: 'Bir hafta ya da daha fazla değişir' },
      unsure: { title: 'Emin değilim', subtitle: 'Kayıtlarından öğreneceğiz' },
    },
  },
});

const REGULARITY: Regularity[] = ['regular', 'irregular', 'unsure'];

// A4 · Step 4 of 6. Starts from common defaults (28 / 5).
export default function CycleStep() {
  const { cycleLength, periodLength, regularity } = useOnboarding();
  const next = () => router.push('/onboarding/symptoms');
  const c = useCopy(COPY);

  return (
    <OnboardingStep
      step={4}
      title={c.title}
      body={c.body}
      onBack={router.back}
      onSkip={next}
      footer={<Button label={c.continue} fullWidth onPress={next} />}
    >
      <Card padded={false} style={styles.card}>
        <LengthRow
          title={c.cycleTitle}
          subtitle={c.cycleSubtitle}
          hint={c.cycleHint}
          value={cycleLength}
          min={CYCLE_RANGE.min}
          max={CYCLE_RANGE.max}
          onChange={(v) => setOnboarding({ cycleLength: v })}
        />
        <View style={styles.divider} />
        <LengthRow
          title={c.periodTitle}
          subtitle={c.periodSubtitle}
          hint={c.periodHint}
          value={periodLength}
          min={PERIOD_RANGE.min}
          max={PERIOD_RANGE.max}
          onChange={(v) => setOnboarding({ periodLength: v })}
        />
      </Card>

      <Text accessibilityRole="header" style={[type('Body/Large', 'SemiBold'), styles.section]}>{c.regularQuestion}</Text>
      <Card padded={false} style={[styles.card, styles.radioCard]}>
        <View accessibilityRole="radiogroup">
          {REGULARITY.map((id) => ({ id, ...c.regularity[id] })).map((r, i) => (
            <View key={r.id}>
              {i > 0 ? <View style={styles.radioDivider} /> : null}
              <Pressable
                accessibilityRole="radio"
                accessibilityLabel={`${r.title}. ${r.subtitle}`}
                accessibilityState={{ selected: regularity === r.id }}
                onPress={() => setOnboarding({ regularity: r.id })}
                style={styles.radioRow}
              >
                <Radio selected={regularity === r.id} />
                <View style={{ flex: 1 }}>
                  <Text style={[type('Body/Medium', 'Medium'), { color: color['text/primary'] }]}>{r.title}</Text>
                  <Text style={[type('Body/Small'), { color: color['text/secondary'] }]}>{r.subtitle}</Text>
                </View>
              </Pressable>
            </View>
          ))}
        </View>
      </Card>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: color['border/subtle'] },
  divider: { height: 1, marginHorizontal: 20, backgroundColor: color['surface/divider'] },
  section: { marginTop: 24, marginBottom: 12, color: color['text/primary'] },
  radioCard: { paddingVertical: 4 },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, minHeight: 56 },
  radioDivider: { height: 1, marginHorizontal: 16, backgroundColor: color['surface/divider'] },
});
