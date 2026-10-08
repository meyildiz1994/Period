import { useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { defineCopy, useCopy } from '../i18n';
import { useCommon } from '../i18n/common';
import { color, layout, overline, type } from '../theme';
import { IconButton } from './Controls';
import { ProgressSteps } from './Navigation';
import { ScrollLockContext } from './ScrollLock';

/** Onboarding steps: name, goal, last period, cycle, symptoms, reminders. */
export const ONBOARDING_STEPS = 6;

const COPY = defineCopy({
  en: { step: (n: number) => `Step ${n} of ${ONBOARDING_STEPS}` },
  tr: { step: (n: number) => `Adım ${n} / ${ONBOARDING_STEPS}` },
});

// Shared frame for the onboarding steps (name, A2–A7): back · progress · Skip header, step overline, title, intro,
// scrolling content and a footer pinned above the home indicator.
type Props = {
  /** 1-based; 0 shows no progress (the name step asked on its own). */
  step: number;
  title: string;
  body?: string;
  children: ReactNode;
  footer: ReactNode;
  onBack?: () => void;
  onSkip?: () => void;
  /** A7: centred title block and a header without back or Skip. */
  done?: boolean;
  /** Mark shown above the title (A7 check badge). */
  hero?: ReactNode;
};

export function OnboardingStep({ step, title, body, children, footer, onBack, onSkip, done, hero }: Props) {
  const insets = useSafeAreaInsets();
  const c = useCopy(COPY);
  const common = useCommon();
  const [locked, setLocked] = useState(false);
  return (
    // The footer rides above the keyboard (A1b name field).
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.screen, { paddingTop: insets.top }]}>
      {done ? (
        <View style={styles.doneHeader}>
          <ProgressSteps step={step} total={ONBOARDING_STEPS} />
        </View>
      ) : (
        <View style={styles.header}>
          <View style={styles.side}>{onBack ? <IconButton icon="chevron-left" label={common.back} onPress={onBack} /> : null}</View>
          <View style={styles.steps}>
            {step > 0 ? <ProgressSteps step={step} total={ONBOARDING_STEPS} /> : null}
          </View>
          <View style={styles.skip}>
            {onSkip ? (
              <Pressable accessibilityRole="button" onPress={onSkip} hitSlop={8} style={styles.skipButton}>
                <Text style={[type('Body/Medium', 'SemiBold'), { color: color['text/brand'] }]}>{common.skip}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      )}
      <ScrollView scrollEnabled={!locked} contentContainerStyle={[styles.content, done && styles.doneContent]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {hero ? <View style={styles.hero}>{hero}</View> : null}
        {done || step === 0 ? null : <Text style={[overline(13), { color: color['text/brand'] }]}>{c.step(step)}</Text>}
        <Text accessibilityRole="header" style={[type('Title/Medium', 'Bold'), styles.title, done && styles.center, hero ? { marginTop: 32 } : null]}>{title}</Text>
        {body ? <Text style={[type('Body/Medium'), styles.body, done && styles.center]}>{body}</Text> : null}
        <View style={[styles.slot, done && { marginTop: 32 }]}>
          <ScrollLockContext.Provider value={setLocked}>{children}</ScrollLockContext.Provider>
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>{footer}</View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color['bg/canvas'] },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', paddingLeft: 8, paddingRight: 12 },
  doneHeader: { height: 40, alignItems: 'center', justifyContent: 'center' },
  side: { width: 44, height: 44 },
  steps: { flex: 1, alignItems: 'center' },
  skip: { width: 54, alignItems: 'flex-end' },
  skipButton: { paddingHorizontal: 12, minHeight: layout.minTouch, justifyContent: 'center' },
  content: { paddingHorizontal: layout.gutter, paddingTop: 4, paddingBottom: 24 },
  doneContent: { paddingTop: 0 },
  title: { marginTop: 12, color: color['text/primary'] },
  body: { marginTop: 12, color: color['text/secondary'] },
  center: { textAlign: 'center' },
  hero: { alignItems: 'center', marginTop: 40 },
  slot: { marginTop: 28 },
  footer: { paddingHorizontal: layout.gutter, paddingTop: 12, gap: 12 },
});
