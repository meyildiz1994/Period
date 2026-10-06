import { router } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheet, Icon, SheetOption, TabBar, type TabName } from '../../components';
import { formatShort, fromISODate } from '../../lib/dates';
import { cycleStatus, useCycleSettings } from '../../state/cycle';
import { color, type } from '../../theme';

const ROUTES: Record<TabName, string> = { Home: 'home', History: 'history', Insights: 'insights', Me: 'me' };

// Main tabs. The bar floats over the screen (content scrolls under it), so screens add
// TAB_BAR_SPACE at the bottom of their content.
export default function TabsLayout() {
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
    <BottomSheet visible={logOpen} title="Log" onClose={() => setLogOpen(false)}>
      <SheetOption icon="drop" brand title="Period" subtitle="Log a start or end date" onPress={() => go('/log/period')} />
      <SheetOption icon="notes" title="Daily log" subtitle="Flow, pain, mood, symptoms or a note" onPress={() => go('/log/daily')} />
      {settings.lastPeriodStart ? (
        <View style={styles.footer}>
          <Icon name="history" size={20} color="text/secondary" />
          <Text style={[type('Body/Small'), styles.footerText]}>
            {inPeriod ? 'Period started' : 'Last period started'} {formatShort(fromISODate(settings.lastPeriodStart))}
          </Text>
          <Pressable
            accessibilityRole="button"
            hitSlop={12}
            onPress={() => {
              setLogOpen(false);
              router.navigate('/history');
            }}
          >
            <Text style={[type('Body/Medium', 'SemiBold'), { color: color['text/brand'] }]}>History</Text>
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
