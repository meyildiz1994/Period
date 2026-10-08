import { router } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheet, Icon, SheetOption, TabBar, type TabName } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { formatShort, fromISODate } from '../../lib/dates';
import { cycleStatus, useCycleSettings } from '../../state/cycle';
import { color, type } from '../../theme';

const ROUTES: Record<TabName, string> = { Home: 'home', History: 'history', Insights: 'insights', Me: 'me' };

const COPY = defineCopy({
  en: {
    title: 'Log',
    period: 'Period',
    periodSub: 'Log a start or end date',
    daily: 'Daily log',
    dailySub: 'Flow, pain, mood, symptoms or a note',
    started: (date: string) => `Period started ${date}`,
    lastStarted: (date: string) => `Last period started ${date}`,
    history: 'History',
  },
  tr: {
    title: 'Kaydet',
    period: 'Adet',
    periodSub: 'Başlangıç ya da bitiş tarihi kaydet',
    daily: 'Günlük kayıt',
    dailySub: 'Akış, ağrı, ruh hali, belirtiler ya da not',
    started: (date: string) => `Adet başladı: ${date}`,
    lastStarted: (date: string) => `Son adet başlangıcı: ${date}`,
    history: 'Geçmiş',
  },
});

// Main tabs. The bar floats over the screen (content scrolls under it), so screens add
// TAB_BAR_SPACE at the bottom of their content.
export default function TabsLayout() {
  const c = useCopy(COPY);
  const [logOpen, setLogOpen] = useState(false);
  const settings = useCycleSettings();
  const status = cycleStatus(settings, new Date());
  const inPeriod = status.kind === 'cycle' && status.periodDay !== null;
  const go = (path: '/log/period' | '/log/daily') => {
    setLogOpen(false);
    router.push(path);
  };

  return (
    <>
    <Tabs
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: color['bg/canvas'] } }}
      tabBar={({ state, navigation }) => {
        const current = state.routes[state.index].name;
        const active = (Object.keys(ROUTES) as TabName[]).find((t) => ROUTES[t] === current);
        return (
          <View style={styles.float} pointerEvents="box-none">
            <TabBar
              active={active}
              onTab={(t) => navigation.navigate(ROUTES[t])}
              onLog={() => setLogOpen(true)}
            />
          </View>
        );
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="insights" />
      <Tabs.Screen name="me" />
    </Tabs>

    {/* C1 Quick Log */}
    <BottomSheet visible={logOpen} title={c.title} onClose={() => setLogOpen(false)}>
      <SheetOption icon="drop" brand title={c.period} subtitle={c.periodSub} onPress={() => go('/log/period')} />
      <SheetOption icon="notes" title={c.daily} subtitle={c.dailySub} onPress={() => go('/log/daily')} />
      {settings.lastPeriodStart ? (
        <View style={styles.footer}>
          <Icon name="history" size={20} color="text/secondary" />
          <Text style={[type('Body/Small'), styles.footerText]}>
            {(inPeriod ? c.started : c.lastStarted)(formatShort(fromISODate(settings.lastPeriodStart)))}
          </Text>
          <Pressable
            accessibilityRole="button"
            hitSlop={12}
            onPress={() => {
              setLogOpen(false);
              router.navigate('/history');
            }}
          >
            <Text style={[type('Body/Medium', 'SemiBold'), { color: color['text/brand'] }]}>{c.history}</Text>
          </Pressable>
        </View>
      ) : null}
    </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  float: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  footerText: { flex: 1, color: color['text/secondary'] },
});
