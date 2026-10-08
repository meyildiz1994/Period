import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCommon } from '../i18n/common';
import { useLock } from '../state/lock';
import { color, radius, type } from '../theme';
import type { IconName } from '../theme/icons';
import { IconButton } from './Controls';
import { Icon } from './Icon';

// Figma: Bottom Sheet. Scrim fades in, the sheet slides up; tapping the scrim or the close button dismisses.
export function BottomSheet({ visible, title, onClose, children }: { visible: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const { close } = useCommon();
  const lock = useLock();
  const shut = lock.enabled && lock.locked;
  const [slide] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (visible) Animated.timing(slide, { toValue: 1, duration: 240, useNativeDriver: true }).start();
    else slide.setValue(0);
  }, [visible, slide]);

  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [400, 0] });

  return (
    // Native modals sit above the lock overlay, so they close while the app is locked.
    <Modal visible={visible && !shut} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel={close} onPress={onClose}>
          <View style={styles.scrim} />
        </Pressable>
        <Animated.View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16), transform: [{ translateY }] }]} accessibilityViewIsModal>
          <View style={styles.grabber} />
          <View style={styles.head}>
            <Text accessibilityRole="header" style={[type('Title/Small', 'SemiBold'), { color: color['text/primary'] }]}>{title}</Text>
            <IconButton icon="x" label={close} type="Tonal" onPress={onClose} />
          </View>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

// Row inside a sheet: leading badge, title, subtitle, chevron.
export function SheetOption({ icon, brand, title, subtitle, onPress }: {
  icon: IconName; brand?: boolean; title: string; subtitle: string; onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      onPress={onPress}
      style={({ pressed }) => [styles.option, pressed && { backgroundColor: color['surface/muted'] }]}
    >
      <View style={[styles.badge, { backgroundColor: color[brand ? 'surface/brand' : 'surface/strong'] }]}>
        <Icon name={icon} color={brand ? 'text/on-brand' : 'text/brand'} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[type('Headline', 'SemiBold'), { color: color['text/primary'] }]}>{title}</Text>
        <Text style={[type('Body/Small'), { color: color['text/secondary'] }]}>{subtitle}</Text>
      </View>
      <Icon name="chevron-right" size={20} color="text/tertiary" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: { flex: 1, backgroundColor: color.scrim },
  sheet: {
    paddingHorizontal: 20, paddingTop: 12, gap: 16,
    borderTopLeftRadius: radius['2xl'], borderTopRightRadius: radius['2xl'], backgroundColor: color['surface/default'],
  },
  grabber: { alignSelf: 'center', width: 40, height: 6, borderRadius: 3, backgroundColor: color['surface/strong'] },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, borderRadius: radius.xl, backgroundColor: color['surface/subtle'] },
  badge: { width: 48, height: 48, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
});
