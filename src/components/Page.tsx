import { useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { color, layout, type } from '../theme';
import { TopBar } from './Navigation';
import { ScrollLockContext } from './ScrollLock';

// Frame for pushed pages: Back top bar, optional intro line, scrolling content and a
// footer pinned above the home indicator, riding above the keyboard while one is open
// (C3 note field). `overlay` sits on top (e.g. an error toast).
export function Page({ title, onBack, intro, children, footer, overlay }: {
  title: string; onBack: () => void; intro?: string; children: ReactNode; footer?: ReactNode; overlay?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const [locked, setLocked] = useState(false);
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.screen, { paddingTop: insets.top }]}>
      <TopBar kind="Back" title={title} onBack={onBack} />
      <ScrollView scrollEnabled={!locked} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'} showsVerticalScrollIndicator={false}>
        {intro ? <Text style={[type('Body/Medium'), styles.intro]}>{intro}</Text> : null}
        <ScrollLockContext.Provider value={setLocked}>{children}</ScrollLockContext.Provider>
      </ScrollView>
      {footer ? <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>{footer}</View> : null}
      {overlay ? <View style={[styles.overlay, { top: insets.top + 56 }]} pointerEvents="box-none">{overlay}</View> : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color['bg/canvas'] },
  content: { paddingHorizontal: layout.gutter, paddingTop: 8, paddingBottom: 24, gap: 16 },
  intro: { color: color['text/secondary'] },
  footer: { paddingHorizontal: layout.gutter, paddingTop: 12, gap: 12 },
  overlay: { position: 'absolute', left: layout.gutter, right: layout.gutter },
});
