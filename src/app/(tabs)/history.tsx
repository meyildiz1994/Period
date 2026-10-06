import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, TopBar } from '../../components';
import { color, layout } from '../../theme';

// Placeholder until step 6.
export default function History() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <TopBar kind="Root" title="History" />
      <View style={styles.content}>
        <EmptyState icon="calendar-grid" title="History comes in step 6" body="This tab is built in a later step." />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color['bg/canvas'] },
  content: { paddingHorizontal: layout.gutter },
});
