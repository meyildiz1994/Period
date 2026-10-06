import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Avatar, Banner, Button, Card, Checkbox, Choice, CycleRing, DayCell, Dialog, Divider, EmptyState, FLOW_LEVELS, FlowLevel,
  IconBadge, IconButton, Input, KeypadKey, ListRow, OptionCard, PasscodeDot, ProgressSteps, SectionHeader, Skeleton,
  StatTile, Stepper, TabBar, Tag, TextArea, Toast, Toggle, TopBar, type FlowLevelName,
} from '../components';
import { color, layout, overline, space } from '../theme';

// Temporary dev screen: every component from 1 · Temeller › 05 Bileşenler, to check on a phone.
export default function Gallery() {
  const [flow, setFlow] = useState<FlowLevelName>('Medium');
  const [mood, setMood] = useState('Calm');
  const [toggle, setToggle] = useState(true);
  const [check, setCheck] = useState(true);
  const [option, setOption] = useState(0);
  const [cycle, setCycle] = useState(28);
  const [note, setNote] = useState('');
  const [dialog, setDialog] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar kind="Back" title="Components" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <H>Cycle Ring</H>
        <View style={styles.center}>
          <CycleRing phase="Menstrual" progress={39 / 360} label="Period" day="Day 3" caption="Period day 3 of 5" />
        </View>
        <View style={styles.rowWrap}>
          <CycleRing size={160} phase="Luteal" progress={283 / 360} label="Luteal" day="22" caption="estimate" />
          <CycleRing size={160} phase="Empty" progress={0} label="No data" day="–" caption="Log to begin" />
        </View>

        <H>Buttons</H>
        <Button label="Save period" fullWidth />
        <Button label="Secondary" type="Secondary" size="Medium" />
        <View style={styles.rowWrap}>
          <Button label="Outline" type="Outline" size="Small" />
          <Button label="Ghost" type="Ghost" size="Small" />
          <Button label="Loading" size="Small" loading />
          <Button label="Disabled" size="Small" disabled />
        </View>
        <Button label="Delete all data" type="Destructive" size="Medium" iconLeft="trash" onPress={() => setDialog(true)} />
        <View style={styles.rowWrap}>
          <IconButton icon="chevron-left" label="Back" type="Tonal" />
          <IconButton icon="x" label="Close" type="Surface" />
          <IconButton icon="plus" label="Add" type="Brand" />
          <IconButton icon="more" label="More" size="Small" />
        </View>

        <H>Selection</H>
        <View style={styles.rowWrap}>
          {FLOW_LEVELS.map((l) => <FlowLevel key={l.level} level={l.level} selected={flow === l.level} onPress={() => setFlow(l.level)} />)}
        </View>
        <View style={styles.rowWrap}>
          {['Calm', 'Happy', 'Tired', 'Irritable'].map((m) => <Choice key={m} label={m} selected={mood === m} onPress={() => setMood(m)} />)}
          <Choice label="Disabled" disabled />
        </View>
        <View style={styles.rowWrap}>
          <Toggle value={toggle} onChange={setToggle} label="Toggle" />
          <Checkbox checked={check} onChange={setCheck} label="Checkbox" />
          <Stepper value={cycle} unit="days" onChange={setCycle} />
        </View>
        {['Track my period', 'Understand my cycle'].map((t, i) => (
          <OptionCard key={t} title={t} subtitle="Short helper line" selected={option === i} onPress={() => setOption(i)} />
        ))}

        <H>Inputs</H>
        <Input label="Email" placeholder="name@example.com" iconLeft="mail" helper="We never share your email." />
        <Input label="Email" defaultValue="nilu@" iconLeft="mail" error="Enter a full email address, like name@example.com." />
        <TextArea value={note} onChangeText={setNote} />

        <H>Display</H>
        <View style={styles.rowWrap}>
          <Tag label="Estimate" />
          <Tag label="Neutral" tone="Neutral" />
          <Tag label="Late" tone="Warning" size="Small" dot />
          <Tag label="Saved" tone="Success" size="Small" icon="check" />
        </View>
        <View style={styles.rowWrap}>
          <Avatar name="Nilü" />
          <Avatar />
          <IconBadge icon="drop" />
          <IconBadge icon="heart" tone="Brand" size={48} />
          <IconBadge icon="alert" tone="Danger" size={48} />
        </View>
        <SectionHeader title="Settings" action="See all" />
        <Card padded={false}>
          <ListRow title="Cycle settings" subtitle="28 days · period 5 days" icon="calendar" onPress={() => {}} />
          <Divider />
          <ListRow title="Reminders" icon="bell" trailing="Toggle" toggled={toggle} onToggle={setToggle} />
          <Divider />
          <ListRow title="Language" icon="book" trailing="Value" value="English" onPress={() => {}} />
          <Divider />
          <ListRow title="Delete all data" icon="trash" destructive onPress={() => setDialog(true)} />
        </Card>
        <View style={styles.row}>
          <StatTile label="Avg. cycle" value="28" unit="days" />
          <StatTile label="Avg. period" value="5" unit="days" icon="drop" />
        </View>
        <Skeleton />
        <Skeleton shape="Block" width="100%" />

        <H>Calendar</H>
        <View style={styles.rowWrap}>
          <DayCell day={12} state="Period" />
          <DayCell day={13} state="Today" />
          <DayCell day={14} state="Selected" />
          <DayCell day={15} state="Logged" />
          <DayCell day={16} state="Predicted" />
          <DayCell day={17} state="Muted" />
        </View>

        <H>Feedback</H>
        <Banner title="Your period may start in 2 days" message="This is an estimate based on your last cycles." />
        <Banner kind="Error" title="Something went wrong" message="We couldn't save your log." action="Try again" />
        <Toast message="Period saved" action="Undo" />
        <EmptyState title="Nothing here yet" body="Log your first period and your history will appear here." action="Log period" />

        <H>Onboarding and lock</H>
        <ProgressSteps step={2} />
        <View style={styles.rowWrap}>
          <PasscodeDot state="Filled" />
          <PasscodeDot state="Filled" />
          <PasscodeDot state="Empty" />
          <PasscodeDot state="Error" />
        </View>
        <View style={styles.rowWrap}>
          <KeypadKey digit="1" />
          <KeypadKey />
          <KeypadKey icon="delete-left" label="Delete" />
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
      <TabBar active="Home" onTab={() => {}} onLog={() => {}} />
      <Dialog
        visible={dialog}
        destructive
        title="Delete all data?"
        body="This removes every log from this phone. You can't undo it."
        confirmLabel="Delete"
        onConfirm={() => setDialog(false)}
        onCancel={() => setDialog(false)}
      />
    </SafeAreaView>
  );
}

function H({ children }: { children: string }) {
  return <Text style={[overline(12), { color: color['text/tertiary'], marginTop: space[16] }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: color['bg/canvas'] },
  content: { padding: layout.gutter, gap: space[12] },
  center: { alignItems: 'center' },
  row: { flexDirection: 'row', gap: space[12] },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space[8] },
});
