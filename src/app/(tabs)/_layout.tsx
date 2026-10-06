import { Tabs } from 'expo-router/js-tabs';
import { StyleSheet, View } from 'react-native';

import { TabBar, type TabName } from '../../components';
import { color } from '../../theme';

const ROUTES: Record<TabName, string> = { Home: 'home', History: 'history', Insights: 'insights', Me: 'me' };

// Main tabs. The bar floats over the screen (content scrolls under it), so screens add
// TAB_BAR_SPACE at the bottom of their content.
export default function TabsLayout() {
  return (
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
              // C1 Quick Log sheet arrives in step 5.
              onLog={() => {}}
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
  );
}

const styles = StyleSheet.create({
  float: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});
