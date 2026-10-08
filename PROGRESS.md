# Period · progress

Read this first when resuming. Update it in every PR.

## Context
- App: Period, menstrual cycle tracker. Track → Understand → Manage. Calm, premium, soft pink/plum. No medical claims; predictions are labelled "estimate". UI language English (v1).
- Stack: Expo SDK 57 + TypeScript + Expo Router (routes in `src/app/`). iOS + Android from one codebase.
- Design source of truth: Figma "Period Final" `gDwelAeecf9MfEk6wpAYDI` (pages 1 · Temeller, 2 · Akışlar, 3 · Ekranlar; screen codes A1–I3). Handoff notes: `docs/handoff-notes.md`. Screen-by-screen specs (copy, structure, sizes) written from screenshots: `docs/screens.md` — use it when Figma is not reachable.
- V1 data: on device only, encrypted. No cloud account. Local notifications only.
- Process: small steps, one PR each, commit + push often.

## Done
- [x] Step 1 · Scaffold + tokens: Expo app, colour/space/radius/elevation tokens (`src/theme/tokens.ts`), Plus Jakarta Sans type roles (`src/theme/typography.ts`), 102 icons (`src/theme/icons.ts`, `src/components/Icon.tsx`), temporary token preview screen (`src/app/index.tsx`).
- [x] Step 2 · Core components (`src/components/`, all exported from `index.ts`): Button, IconButton, Choice, Toggle, Checkbox, Radio, OptionCard, Stepper, Input, TextArea, Card, Tag, IconBadge, Avatar, ListRow, Divider, SectionHeader, StatTile, Skeleton, Banner, Toast, Dialog, EmptyState, TopBar, TabBar, ProgressSteps, CycleRing, DayCell, FlowLevel, PasscodeDot, KeypadKey. Dev gallery at `src/app/gallery.tsx` (temporary). Bottom sheet is still to do (comes with Quick Log in step 5).

- [x] Step 3 · I1 Splash (`src/app/index.tsx`) → A1 Welcome → A2–A6 setup steps → A7 All set (`src/app/onboarding/`). Shared frame `OnboardingStep`, day/month/year `DateWheel` (also for C2), answers in an in-memory store `src/state/onboarding.ts` (symptom list in `src/state/symptoms.ts`). Token preview moved to `/tokens`. ESLint added (`eslint.config.js`) and existing lint errors fixed.

- [x] Step 4 · Main tabs (`src/app/(tabs)/`, Expo Router `expo-router/js-tabs` with our floating `TabBar`) and Home B1 in cycle / B2 empty / B3 loading / B4 late (`(tabs)/home.tsx`, pieces in `src/components/Home.tsx`). Cycle maths in `src/state/cycle.ts` (cycle day, period day, phase, next start, late days, week strip), date helpers in `src/lib/dates.ts`. Cycle Ring stroke and text scale with size (220 on Home). History / Insights / Me are placeholders; Me keeps the dev links (gallery, tokens, restart onboarding).

- [x] Step 5 · Log: C1 Quick Log sheet (from "+", in `(tabs)/_layout.tsx`, generic `BottomSheet` + `SheetOption` in `src/components/Sheet.tsx`), C2 Log period (`src/app/log/period.tsx`: start wheel, "Has it ended?" with end date and end-before-start error, flow today), C3 Daily log (`src/app/log/daily.tsx`, optional `?date=`; flow, pain, mood, symptoms with "Add", note), C4/C5 error toast "Couldn't save…" with Retry on both. Shared pushed-page frame `Page`. Periods and daily logs live in `src/state/log.ts` (in memory); onboarding's last period becomes the first logged period; Home reads cycle settings via `useCycleSettings()` and shows today's log.

- [x] Step 6 · History: D1 calendar + selected day + past cycles (`(tabs)/history.tsx`, `MonthCalendar` in `src/components/Calendar.tsx`), D2 Day detail (`src/app/day/[date].tsx`, delete asks first), D3 Cycle details (`src/app/cycle/[start].tsx`: period-share ring, breakdown incl. flow per day, average banner, Edit dates → C2 `?start=`, Delete cycle asks first), D4 empty. Derivations in `src/state/history.ts`. New `GhostDanger` button, `CycleRing` options `knob` / `dayRole` / optional label. `showPredicted` setting in the store (G2 will toggle it).

- [x] Step 7 · Insights: E1 (`(tabs)/insights.tsx`: averages, range and count tiles, cycle length bars for the last 6 cycles, most logged symptoms, not-medical-advice banner) and E2 (fewer than 2 completed cycles: progress "n of 2"). Maths in `src/state/insights.ts` on top of `pastCycles`.

- [x] Step 8a · Me and settings: G1 Me (`(tabs)/me.tsx`, dev links only in `__DEV__`), G2 Cycle settings (`src/app/settings/cycle.tsx`: lengths with "Your average", show predicted days, week starts Sunday/Monday), G3 Reminders (`settings/reminders.tsx`: toggle, timing, time picker sheet), G7–G9 About / Privacy / Terms (`src/app/about/`), H1 Your data (`src/app/data/index.tsx`), H5 Delete all data (`data/delete.tsx`, resets everything and returns to onboarding). Shared `LengthRow` (A4, G2) and `ReminderTiming` (A6, G3).

- [x] Step 8b · No accounts in v1 (user's decision, see `docs/screens.md` › v1 decisions): account entry points removed. App lock: G5 (`settings/lock.tsx`), passcode setup/change (`settings/passcode.tsx`), G6 lock screen over the whole app (`LockGate` in the root layout, locks again after the chosen background time; 5 wrong tries → 30 s wait), Face ID / Touch ID / fingerprint via `expo-local-authentication` (`src/lib/biometrics.ts`). Export H2–H4 (`data/export.tsx`, `src/lib/export.ts`: CSV or JSON written with `expo-file-system`, shared with `expo-sharing`; fails on web by design). Lock settings in `src/state/lock.ts`.

- [x] Step 9a · Encrypted on-device storage (`src/state/persist.ts`): onboarding/settings, log and lock saved as one AES-256-GCM file (`@noble/ciphers`) in the document folder; the key lives in the Keychain/Keystore via `expo-secure-store` (this device only). Loads at launch (`hydrate()` in the root layout; Splash waits; lock shows if on), saves 300 ms after any change; C2/C3 and Delete all await `flush()` so failures show. Passcode stored only as a salted SHA-256 hash (`expo-crypto`). Web preview falls back to plain localStorage.

- [x] Step 9b · Local notifications (`src/lib/notifications.ts`, `expo-notifications`): permission asked from A6 "Turn on reminders" and the G3 toggle; G4 state (warning banner + Open Settings, disabled toggle) when notifications are blocked; reminders rescheduled whenever settings or logs change: heads-up N days before at the chosen time, "expected today", "2 days late" (I2 copy). Tapping one opens Home or Log period, also from a cold start. Android channel "Period reminders" with private lock-screen visibility.

- [x] Step 10a · Icons and launch screen: `assets/` replaced the Expo placeholders with the I3 teardrop on #80244E (store icon 1024 RGB without alpha, Android adaptive foreground/background/monochrome, favicon) and the I1 mark as `splash-icon.png`; `expo-splash-screen` shows it at 88 pt on #80244E and the in-app Splash uses the same image. Teardrop path (bbox x −1..1, y −1.82..1, tip rounded with a 0.12 stroke): `M0 -1.82 C0.38 -1.32 1 -0.72 1 0 A1 1 0 0 1 -1 0 C-1 -0.72 -0.38 -1.32 0 -1.82 Z`. `eas.json` with `preview` (internal, Android APK) and `production` (auto-increment) profiles.

- [x] Step 11 · Flexible cycles (`cycleSettings` in `src/state/cycle.ts`): after 2 logged cycles the average of the last 6 replaces the onboarding cycle length (Home, History calendar, reminders). Irregular = spread over 7 days across ≥3 cycles, or the user said so (A2 goal / A3 regularity) before that. Irregular cycles show a window ("In 17–27 days", "Any day now") and a Neutral ring ("Irregular cycle", no phase estimates); late counts from the end of the window. The late ring keeps counting ("Day 41 · 2 days late").

## Open
- Step 10b needs the user's accounts: Expo (free) for `eas build`, Apple Developer (99 USD/yr) for TestFlight, Google Play Console (25 USD once) for internal testing. Asked which ones exist / which platform first.
- Greeting is "Hi there" because no name is collected yet (`name` in the store).
- Web preview artifact (private): https://claude.ai/artifact/Ae7vuqSM5nrqfPPCKDzQuv. Republish it from a web export after each step: copy `_expo/static/js/web/entry-*.js` to `app/period.js` with `"/assets/` rewritten to `"assets/` (the service rejects paths starting with `_`), keep the page's base/replaceState snippet. The splash image is now an asset: publish `assets/assets/splash-icon*.png` too.
- The user runs the app in Expo Go on their phone (`git pull`, `npm install`, `npx expo start` in the cloned folder). Expo Go shows its own icon and launch screen; ours appear in an EAS build.

## Next
Product roadmap agreed 2026-10-08 (user's feedback, order 11 → 14):
- [ ] Step 12 · "I don't get periods right now" mode (pregnancy, breastfeeding, menopause, hormonal contraception): ring replaced by daily logging, period reminders off, a gentle "consider talking to a doctor" note after 90 days without a period.
- [ ] Step 13 · Goal personalisation: trying to conceive / avoiding pregnancy / just tracking. Daily log gains sex (protected / unprotected), contraception method, ovulation test. Fertile window shown to both; for "avoiding" with a "not reliable as contraception" warning (Terms).
- [ ] Step 14 · Monthly summary in Insights (cycle length, top symptoms, mood mix, change vs last month), optional notification on the 1st.
- [ ] Step 10b · EAS build (`npx eas-cli@latest build --profile preview`), TestFlight / Play internal test.

## Notes for the next session
- Figma MCP is on the Starter plan and its monthly call quota ran out on 2026-10-06. Build from `docs/screens.md`; the user can send more screenshots if something is missing.
- Before every push: `npx expo lint` and `npx tsc --noEmit` must both be clean (ESLint with `eslint-config-expo`, set up in step 3).
- In the cloud container `api.expo.dev` is blocked: use `EXPO_OFFLINE=1 npx expo install <pkg>`. Verify with `npx tsc --noEmit` and `EXPO_OFFLINE=1 npx expo export --platform ios`. Visual check: `EXPO_OFFLINE=1 npx expo export --platform web`, serve the folder, screenshot at 390×844 with Playwright.
- Figma pink naming trap: Figma script's `C.p100` = pink/200 = `surface/muted`, `C.p200` = pink/300 = `surface/strong`, `C.p50` = pink/100 = `surface/subtle`, `C.p300` = pink/400 = `border/default`.
