import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, IconBadge, OnboardingStep } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { savePeriod } from '../../state/log';
import { getOnboarding, setOnboarding } from '../../state/onboarding';
import { color, type, type IconName } from '../../theme';

const COPY = defineCopy({
  en: {
    title: 'You’re all set',
    body: 'Here’s how Nilemy handles what you log.',
    goHome: 'Go to Home',
    points: [
      { title: 'Saved on this phone', body: 'Your logs never leave this phone unless you export them.' },
      { title: 'Export anytime', body: 'Download a copy of your logs from Your data.' },
      { title: 'Never sold or shared', body: 'No ads and no selling of your data.' },
    ],
  },
  tr: {
    title: 'Her şey hazır',
    body: 'Nilemy kaydettiklerini şöyle korur.',
    goHome: 'Ana sayfaya git',
    points: [
      { title: 'Bu telefonda saklanır', body: 'Sen dışa aktarmadıkça kayıtların bu telefondan çıkmaz.' },
      { title: 'İstediğin zaman dışa aktar', body: 'Kayıtlarının bir kopyasını Verilerin bölümünden indir.' },
      { title: 'Asla satılmaz ya da paylaşılmaz', body: 'Reklam yok, verilerin satılmaz.' },
    ],
  },
});

// Same order as COPY.points.
const ICONS: IconName[] = ['smartphone', 'download', 'shield-check'];

// A7 All set. Ends onboarding and replaces the stack with Home.
export default function Done() {
  const c = useCopy(COPY);
  return (
    <OnboardingStep
      step={5}
      done
      hero={<IconBadge icon="check" tone="Brand" size={64} />}
      title={c.title}
      body={c.body}
      footer={
        <Button
          label={c.goHome}
          fullWidth
          onPress={() => {
            const { lastPeriodStart } = getOnboarding();
            if (lastPeriodStart) savePeriod({ start: lastPeriodStart, end: null });
            setOnboarding({ done: true });
            router.replace('/home');
          }}
        />
      }
    >
      <Card padded={false} style={styles.card}>
        {c.points.map((p, i) => (
          <View key={ICONS[i]} style={styles.row}>
            <IconBadge icon={ICONS[i]} />
            <View style={{ flex: 1 }}>
              <Text style={[type('Body/Medium', 'SemiBold'), { color: color['text/primary'] }]}>{p.title}</Text>
              <Text style={[type('Body/Small'), { color: color['text/secondary'] }]}>{p.body}</Text>
            </View>
          </View>
        ))}
      </Card>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  card: { padding: 20, gap: 20, borderWidth: 1, borderColor: color['border/subtle'] },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
});
