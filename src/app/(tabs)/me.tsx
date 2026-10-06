import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Button, Divider, ListRow, SectionHeader, TopBar, useTabBarSpace } from '../../components';
import { APP_VERSION } from '../../lib/app';
import { resetLog } from '../../state/log';
import { resetOnboarding, useOnboarding } from '../../state/onboarding';
import { color, layout, radius, type } from '../../theme';

// G1 Me. Account backup, app lock and export land in step 8b; their rows are shown but not wired yet.
export default function Me() {
  const insets = useSafeAreaInsets();
  const bottom = useTabBarSpace();
  const { name, reminder } = useOnboarding();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <TopBar kind="Root" title="Me" userName={name ?? undefined} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottom }]} showsVerticalScrollIndicator={false}>
        <View style={styles.profile}>
          <Avatar name={name ?? undefined} size="Large" />
          {name ? <Text style={[type('Headline', 'SemiBold'), { color: color['text/primary'] }]}>{name}</Text> : null}
          <View style={styles.pill}>
            <View style={styles.dot} />
            <Text style={[type('Body/Small', 'Medium'), { color: color['text/primary'] }]}>Saved on this device</Text>
          </View>
          <Button label="Back up with an account" iconLeft="refresh" size="Medium" />
        </View>

        <SectionHeader title="Settings" />
        <View style={styles.list}>
          <ListRow title="Cycle settings" subtitle="Cycle and period length" icon="drop" onPress={() => router.push('/settings/cycle')} />
          <Divider inset={0} />
          <ListRow title="Reminders" icon="bell-ring" trailing="Value" value={reminder.enabled ? 'On' : 'Off'} onPress={() => router.push('/settings/reminders')} />
          <Divider inset={0} />
          <ListRow title="Your data" subtitle="Export, backup or delete" icon="folder-user" onPress={() => router.push('/data')} />
          <Divider inset={0} />
          <ListRow title="App lock" icon="lock" trailing="Value" value="Off" />
        </View>

        <SectionHeader title="About" />
        <View style={styles.list}>
          <ListRow title="About Period" icon="info" trailing="Value" value={APP_VERSION.replace(/\.0$/, '')} onPress={() => router.push('/about')} />
          <Divider inset={0} />
          <ListRow title="Privacy policy" icon="shield" onPress={() => router.push('/about/privacy')} />
          <Divider inset={0} />
          <ListRow title="Terms of service" icon="file-text" onPress={() => router.push('/about/terms')} />
        </View>

        {__DEV__ ? (
          <View style={styles.dev}>
            <Text style={[type('Caption'), { color: color['text/tertiary'] }]}>Developer</Text>
            <Button label="See components" type="Secondary" size="Small" onPress={() => router.push('/gallery')} />
            <Button label="See tokens" type="Secondary" size="Small" onPress={() => router.push('/tokens')} />
            <Button
              label="Restart onboarding"
              type="Ghost"
              size="Small"
              onPress={() => {
                resetOnboarding();
                resetLog();
                router.replace('/');
              }}
            />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color['bg/canvas'] },
  content: { paddingHorizontal: layout.gutter, gap: 12 },
  profile: { alignItems: 'center', gap: 12, paddingVertical: 24, paddingHorizontal: 20, borderRadius: radius.xl, backgroundColor: color['surface/muted'] },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: color['surface/default'] },
  dot: { width: 6, height: 6, borderRadius: 999, backgroundColor: color['text/primary'] },
  list: { borderRadius: radius.xl, borderWidth: 1, borderColor: color['border/subtle'], backgroundColor: color['surface/default'], overflow: 'hidden' },
  dev: { marginTop: 12, gap: 8, alignItems: 'flex-start' },
});
