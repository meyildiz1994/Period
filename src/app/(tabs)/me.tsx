import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, EmptyState, TopBar, useTabBarSpace } from '../../components';
import { resetLog } from '../../state/log';
import { resetOnboarding } from '../../state/onboarding';
import { color, layout } from '../../theme';

// Placeholder until G1 Me in step 8. Keeps the temporary dev links.
export default function Me() {
  const insets = useSafeAreaInsets();
  const bottom = useTabBarSpace();
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <TopBar kind="Root" title="Me" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottom }]}>
        <EmptyState icon="user-circle" title="Me comes in step 8" body="Settings, reminders, your data and app lock will live here." />
        <Button label="See components" type="Secondary" size="Medium" onPress={() => router.push('/gallery')} />
        <Button label="See tokens" type="Secondary" size="Medium" onPress={() => router.push('/tokens')} />
        <Button
          label="Restart onboarding"
          type="Ghost"
          size="Medium"
          onPress={() => {
            resetOnboarding();
            resetLog();
            router.replace('/');
          }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color['bg/canvas'] },
  content: { paddingHorizontal: layout.gutter, gap: 12 },
});
