import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { color, layout, type } from '../theme';
import { TopBar } from './Navigation';

// Frame for pushed pages: Back top bar, optional intro line, scrolling content and a
// footer pinned above the home indicator. `overlay` sits on top (e.g. an error toast).
export function Page({ title, onBack, intro, children, footer, overlay }: {
  title: string; onBack: () => void; intro?: string; children: ReactNode; footer?: ReactNode; overlay?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <TopBar kind="Back" title={title} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets showsVerticalScrollIndicator={false}>
        {intro ? <Text style={[type('Body/Medium'), styles.intro]}>{intro}</Text> : null}
        {children}
      </ScrollView>
      {footer ? <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>{footer}</View> : null}
      {overlay ? <View style={[styles.overlay, { top: insets.top + 56 }]} pointerEvents="box-none">{overlay}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color['bg/canvas'] },
  content: { paddingHorizontal: layout.gutter, paddingTop: 8, paddingBottom: 24, gap: 16 },
  intro: { color: color['text/secondary'] },
  footer: { paddingHorizontal: layout.gutter, paddingTop: 12, gap: 12 },
  overlay: { position: 'absolute', left: layout.gutter, right: layout.gutter },
});
