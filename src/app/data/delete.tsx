import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Banner, Button, Icon, Page } from '../../components';
import { resetLog, useLog } from '../../state/log';
import { resetOnboarding } from '../../state/onboarding';
import { color, type } from '../../theme';

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

// H5 Delete all data: the second step after the row on Your data. Clears logs and settings,
// then starts again from onboarding.
export default function DeleteAll() {
  const { periods, days } = useLog();
  const logged = Object.keys(days).length;

  return (
    <Page
      title="Delete all data"
      onBack={router.back}
      footer={
        <>
          <Button
            label="Delete all data"
            type="Destructive"
            fullWidth
            onPress={() => {
              resetLog();
              resetOnboarding();
              router.dismissAll();
              router.replace('/');
            }}
          />
          <Button label="Cancel" type="Ghost" fullWidth onPress={router.back} />
        </>
      }
    >
      <View style={styles.badge}>
        <Icon name="trash" size={28} color="feedback/danger" />
      </View>
      <Text accessibilityRole="header" style={[type('Title/Medium', 'Bold'), { color: color['text/primary'] }]}>Delete everything on this phone?</Text>
      <Text style={[type('Body/Medium'), { color: color['text/secondary'] }]}>
        This permanently removes {plural(periods.length, 'cycle', 'cycles')} and {plural(logged, 'daily log', 'daily logs')}. It can’t be undone.
      </Text>
      <Banner message="Want a copy first? Export your data before deleting." />
    </Page>
  );
}

const styles = StyleSheet.create({
  badge: { width: 56, height: 56, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: color['feedback/danger-subtle'] },
});
