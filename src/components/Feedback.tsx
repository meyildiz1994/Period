import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useCommon } from '../i18n/common';
import { useLock } from '../state/lock';
import { color, elevation, type, type ColorToken } from '../theme';
import type { IconName } from '../theme/icons';
import { Button } from './Button';
import { Icon } from './Icon';

// Figma: Banner (Type). Inline message tied to the page. Error banners must offer a way forward.
type BannerType = 'Info' | 'Success' | 'Warning' | 'Error';
const BANNER: Record<BannerType, { icon: IconName; fg: ColorToken; bg: ColorToken }> = {
  Info: { icon: 'info', fg: 'text/brand', bg: 'surface/muted' },
  Success: { icon: 'check-circle', fg: 'feedback/success', bg: 'feedback/success-subtle' },
  Warning: { icon: 'alert', fg: 'feedback/warning', bg: 'feedback/warning-subtle' },
  Error: { icon: 'alert-circle', fg: 'feedback/danger', bg: 'feedback/danger-subtle' },
};

export function Banner({ kind = 'Info', title, message, action, onAction }: {
  kind?: BannerType; title?: string; message: string; action?: string; onAction?: () => void;
}) {
  const b = BANNER[kind];
  return (
    <View style={[styles.banner, { backgroundColor: color[b.bg] }]} accessibilityRole={kind === 'Error' ? 'alert' : undefined}>
      <Icon name={b.icon} size={20} color={b.fg} />
      <View style={{ flex: 1, gap: 4 }}>
        {title ? <Text style={[type('Body/Default', 'SemiBold'), { color: color[kind === 'Info' ? 'text/primary' : b.fg] }]}>{title}</Text> : null}
        <Text style={[type('Body/Small'), { color: color['text/secondary'] }]}>{message}</Text>
        {action ? (
          <Pressable accessibilityRole="button" onPress={onAction} hitSlop={12} style={{ alignSelf: 'flex-start' }}>
            <Text style={[type('Body/Small', 'SemiBold'), { color: color[kind === 'Info' ? 'text/brand' : b.fg] }]}>{action}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

// Figma: Toast (Type). Short confirmation shown above the tab bar for 4 s.
const TOAST: Record<'Success' | 'Error' | 'Info', { icon: IconName; fg: ColorToken }> = {
  Success: { icon: 'check-circle', fg: 'feedback/success-subtle' },
  Error: { icon: 'alert-circle', fg: 'feedback/danger-subtle' },
  Info: { icon: 'info', fg: 'surface/strong' },
};

export function Toast({ kind = 'Success', message, action, onAction }: { kind?: keyof typeof TOAST; message: string; action?: string; onAction?: () => void }) {
  const t = TOAST[kind];
  return (
    <View style={[styles.toast, elevation.overlay]} accessibilityLiveRegion="polite">
      <Icon name={t.icon} size={20} color={t.fg} />
      <Text style={[type('Body/Small', 'Medium'), { flex: 1, color: color['text/on-brand'] }]}>{message}</Text>
      {action ? (
        <Pressable accessibilityRole="button" onPress={onAction} hitSlop={12}>
          <Text style={[type('Body/Small', 'SemiBold'), { color: color['text/decor'] }]}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// Figma: Dialog (Type). Modal confirmation; the safe option is always present.
export function Dialog({ visible, destructive, title, body, confirmLabel, cancelLabel, onConfirm, onCancel }: {
  visible: boolean; destructive?: boolean; title: string; body: string; confirmLabel: string; cancelLabel?: string;
  onConfirm: () => void; onCancel: () => void;
}) {
  const { cancel } = useCommon();
  const lock = useLock();
  const shut = lock.enabled && lock.locked;
  return (
    // Native modals sit above the lock overlay, so they close while the app is locked.
    <Modal visible={visible && !shut} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.scrim}>
        <View style={[styles.dialog, elevation.overlay]} accessibilityViewIsModal>
          <View style={[styles.badge56, { backgroundColor: color[destructive ? 'feedback/danger-subtle' : 'surface/muted'] }]}>
            <Icon name={destructive ? 'alert' : 'info'} color={destructive ? 'feedback/danger' : 'text/brand'} />
          </View>
          <Text style={[type('Headline', 'SemiBold'), styles.centerText, { color: color['text/primary'] }]}>{title}</Text>
          <Text style={[type('Body/Default'), styles.centerText, { color: color['text/secondary'] }]}>{body}</Text>
          <View style={{ height: 4 }} />
          <Button label={confirmLabel} type={destructive ? 'Destructive' : 'Primary'} fullWidth onPress={onConfirm} />
          <Button label={cancelLabel ?? cancel} type="Ghost" fullWidth onPress={onCancel} />
        </View>
      </View>
    </Modal>
  );
}

// Figma: Empty State. Says what will appear here and the one action that fills it.
export function EmptyState({ icon = 'calendar-plus', title, body, action, onAction }: {
  icon?: IconName; title: string; body: string; action?: string; onAction?: () => void;
}) {
  return (
    <View style={styles.empty}>
      <View style={[styles.badge72]}>
        <Icon name={icon} size={32} color="text/brand" />
      </View>
      <Text style={[type('Headline', 'SemiBold'), styles.centerText, { color: color['text/primary'] }]}>{title}</Text>
      <Text style={[type('Body/Default'), styles.centerText, { color: color['text/secondary'] }]}>{body}</Text>
      {action ? <View style={{ marginTop: 4 }}><Button label={action} size="Medium" onPress={onAction} /></View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  centerText: { textAlign: 'center' },
  banner: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 16, borderRadius: 16 },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16, backgroundColor: color['surface/inverse'] },
  scrim: { flex: 1, backgroundColor: color.scrim, alignItems: 'center', justifyContent: 'center', padding: 24 },
  dialog: { width: '100%', maxWidth: 342, padding: 24, gap: 12, borderRadius: 24, alignItems: 'center', backgroundColor: color['surface/default'] },
  badge56: { width: 56, height: 56, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  empty: {
    paddingVertical: 32, paddingHorizontal: 24, gap: 12, alignItems: 'center', borderRadius: 24,
    backgroundColor: color['surface/default'], borderWidth: 1, borderColor: color['border/subtle'],
  },
  badge72: { width: 72, height: 72, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: color['surface/muted'] },
});
