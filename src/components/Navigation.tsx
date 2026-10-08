import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { defineCopy, useCopy } from '../i18n';
import { useCommon } from '../i18n/common';
import { color, elevation, type } from '../theme';
import type { IconName } from '../theme/icons';
import { Avatar } from './Display';
import { IconButton } from './Controls';
import { Icon } from './Icon';

const COPY = defineCopy({
  en: {
    me: 'Me',
    log: 'Log',
    tabs: { Home: 'Home', History: 'History', Insights: 'Insights', Me: 'Me' } as Record<TabName, string>,
  },
  tr: {
    me: 'Ben',
    log: 'Kaydet',
    tabs: { Home: 'Ana sayfa', History: 'Geçmiş', Insights: 'Analiz', Me: 'Ben' },
  },
});

// Figma: Top Bar (Type). Root = tab destinations (large title, avatar). Back = pushed pages. Modal = sheets.
// The bell was removed on 2026-10-06: there is no in-app notification centre.
type TopBarProps =
  | { kind: 'Root'; title: string; userName?: string; onAvatar?: () => void }
  | { kind: 'Back'; title: string; onBack: () => void; action?: { icon: IconName; label: string; onPress: () => void } }
  | { kind: 'Modal'; title: string; onClose: () => void };

export function TopBar(props: TopBarProps) {
  const c = useCopy(COPY);
  const common = useCommon();
  if (props.kind === 'Root') {
    return (
      <View style={[styles.bar, styles.root]}>
        <Text accessibilityRole="header" style={[type('Title/Medium', 'Bold'), { flex: 1, color: color['text/primary'] }]}>{props.title}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={c.me} onPress={props.onAvatar} hitSlop={4}>
          <Avatar name={props.userName} />
        </Pressable>
      </View>
    );
  }
  return (
    <View style={[styles.bar, styles.sub]}>
      <View style={styles.side}>
        {props.kind === 'Back' ? <IconButton icon="chevron-left" label={common.back} onPress={props.onBack} /> : null}
      </View>
      <Text accessibilityRole="header" numberOfLines={1} style={[type('Body/Large', 'SemiBold'), styles.title, { color: color['text/primary'] }]}>
        {props.title}
      </Text>
      <View style={styles.side}>
        {props.kind === 'Modal' ? <IconButton icon="x" label={common.close} type="Tonal" onPress={props.onClose} /> : null}
        {props.kind === 'Back' && props.action ? <IconButton icon={props.action.icon} label={props.action.label} onPress={props.action.onPress} /> : null}
      </View>
    </View>
  );
}

// Figma: Tab Bar (Active). Home | History | + (Log) | Insights | Me. Fixed at the bottom of every main screen.
export type TabName = 'Home' | 'History' | 'Insights' | 'Me';
const TABS: { name: TabName; icon: IconName }[] = [
  { name: 'Home', icon: 'home' },
  { name: 'History', icon: 'calendar-grid' },
  { name: 'Insights', icon: 'chart' },
  { name: 'Me', icon: 'user-circle' },
];

export function TabBar({ active, onTab, onLog }: { active?: TabName; onTab: (t: TabName) => void; onLog: () => void }) {
  const insets = useSafeAreaInsets();
  const c = useCopy(COPY);
  const tab = (t: (typeof TABS)[number]) => {
    const on = active === t.name;
    return (
      <Pressable
        key={t.name}
        accessibilityRole="tab"
        accessibilityLabel={c.tabs[t.name]}
        accessibilityState={{ selected: on }}
        onPress={() => onTab(t.name)}
        style={styles.tab}
      >
        <Icon name={t.icon} color={on ? 'text/brand' : 'text/secondary'} />
        <Text style={[type('Footnote', on ? 'SemiBold' : 'Medium'), { color: color[on ? 'text/brand' : 'text/secondary'] }]}>{c.tabs[t.name]}</Text>
      </Pressable>
    );
  };
  return (
    <View style={[styles.tabWrap, { paddingBottom: Math.max(insets.bottom, 24) }]}>
      <View style={[styles.tabBar, elevation.card]} accessibilityRole="tablist">
        {tab(TABS[0])}
        {tab(TABS[1])}
        <Pressable accessibilityRole="button" accessibilityLabel={c.log} onPress={onLog} style={({ pressed }) => [styles.fab, elevation.brand, pressed && { backgroundColor: color['surface/brand-pressed'] }]}>
          <Icon name="plus" color="text/on-brand" />
        </Pressable>
        {tab(TABS[2])}
        {tab(TABS[3])}
      </View>
    </View>
  );
}

/** Bottom padding a tab screen needs so its last content clears the floating Tab Bar. */
export function useTabBarSpace() {
  const insets = useSafeAreaInsets();
  return 8 + 68 + Math.max(insets.bottom, 24) + 12;
}

// Figma: Progress Steps (Step). Five-step onboarding progress.
export function ProgressSteps({ step, total = 5 }: { step: number; total?: number }) {
  return (
    <View style={styles.steps} accessibilityRole="progressbar" accessibilityValue={{ now: step, min: 0, max: total }}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.segment, { backgroundColor: color[i < step ? 'surface/brand' : 'surface/strong'] }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  root: { height: 64, paddingHorizontal: 20 },
  sub: { height: 56, paddingHorizontal: 8 },
  side: { width: 44, height: 44 },
  title: { flex: 1, textAlign: 'center', fontSize: 17 },
  tabWrap: { paddingTop: 8, paddingHorizontal: 16 },
  tabBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 68, paddingHorizontal: 8,
    borderRadius: 999, backgroundColor: color['surface/default'],
  },
  tab: { width: 64, height: 56, gap: 4, alignItems: 'center', justifyContent: 'center' },
  fab: { width: 56, height: 56, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: color['surface/brand'] },
  steps: { flexDirection: 'row', gap: 6 },
  segment: { width: 36, height: 6, borderRadius: 3 },
});
