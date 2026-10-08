import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { Platform } from 'react-native';

import { cycleSettings } from '../state/cycle';
import { pastCycles } from '../state/history';
import { latestPeriod, getLog, subscribeLog } from '../state/log';
import { getOnboarding, subscribeOnboarding } from '../state/onboarding';
import { addDays, fromISODate } from './dates';

// I2 local notifications. One period reminder (G3) made of up to three messages around the
// estimated start: the heads-up, "expected today" and "2 days late". Each opens a screen.
export type NotificationAccess = 'granted' | 'undetermined' | 'denied' | 'unsupported';

const CHANNEL = 'period-reminders';
const supported = Platform.OS !== 'web';

if (supported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
}

async function ensureChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL, {
    name: 'Period reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    // Lock screen shows only the app name unless the phone is unlocked.
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
  });
}

export async function notificationAccess(): Promise<NotificationAccess> {
  if (!supported) return 'unsupported';
  const p = await Notifications.getPermissionsAsync();
  if (p.granted) return 'granted';
  return p.canAskAgain ? 'undetermined' : 'denied';
}

/** Asks once if the system still allows asking; returns the resulting access. */
export async function requestNotificationAccess(): Promise<NotificationAccess> {
  if (!supported) return 'unsupported';
  await ensureChannel();
  const current = await notificationAccess();
  if (current !== 'undetermined') return current;
  const p = await Notifications.requestPermissionsAsync();
  return p.granted ? 'granted' : 'denied';
}

function at(day: Date, hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m);
}

/** Replaces all scheduled reminders with ones that match the current settings and logs. */
export async function rescheduleReminders() {
  if (!supported) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  const onboarding = getOnboarding();
  const { reminder, periodLength } = onboarding;
  const log = getLog();
  const latest = latestPeriod(log);
  if (!reminder.enabled || !latest || (await notificationAccess()) !== 'granted') return;

  // Irregular cycles: remind before the earliest expected day, count "late" from the latest.
  const { window } = cycleSettings(onboarding, log);
  const expected = addDays(fromISODate(latest.start), window.min);
  const latestExpected = addDays(fromISODate(latest.start), window.max);
  const cycles = pastCycles(log.periods, periodLength).length;
  const lead = reminder.daysBefore;
  const messages = [
    {
      when: at(addDays(expected, -lead), reminder.time),
      title: lead === 1 ? 'Your period may start tomorrow' : `Your period may start in ${lead} days`,
      body: cycles >= 2 ? `An estimate from your last ${Math.min(cycles, 6)} cycles.` : 'An estimate from your usual cycle length.',
      url: '/home',
    },
    { when: at(expected, reminder.time), title: window.min === window.max ? 'Your period is expected today' : 'Your period may start any day now', body: 'Log it in Period when it starts.', url: '/log/period' },
    { when: at(addDays(latestExpected, 2), reminder.time), title: 'Your period is 2 days late', body: 'Cycles often vary. Log it when it starts.', url: '/home' },
  ];
  const now = Date.now();
  await ensureChannel();
  for (const m of messages) {
    if (m.when.getTime() <= now) continue;
    await Notifications.scheduleNotificationAsync({
      content: { title: m.title, body: m.body, data: { url: m.url } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: m.when, channelId: CHANNEL },
    });
  }
}

let timer: ReturnType<typeof setTimeout> | null = null;
const soon = () => {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => rescheduleReminders().catch((e) => console.warn('Period: scheduling reminders failed', e)), 500);
};

/** After saved data is loaded: keep reminders in step with settings and logs, and open the
 * screen a tapped notification points to (also when the tap launched the app). */
let started = false;
export function startReminders() {
  if (!supported || started) return () => {};
  started = true;
  soon();
  const offOnboarding = subscribeOnboarding(soon);
  const offLog = subscribeLog(soon);
  const open = (r: Notifications.NotificationResponse | null) => {
    const url = r?.notification.request.content.data?.url;
    if (typeof url === 'string' && getOnboarding().done) router.push(url as never);
  };
  open(Notifications.getLastNotificationResponse());
  const sub = Notifications.addNotificationResponseReceivedListener(open);
  return () => {
    started = false;
    offOnboarding();
    offLog();
    sub.remove();
  };
}
