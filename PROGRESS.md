# Period · progress

Read this first when resuming. Update it in every PR.

## Context
- App: Period, menstrual cycle tracker. Track → Understand → Manage. Calm, premium, soft pink/plum. No medical claims; predictions are labelled "estimate". UI language English (v1).
- Stack: Expo SDK 57 + TypeScript + Expo Router (routes in `src/app/`). iOS + Android from one codebase.
- Design source of truth: Figma "Period Final" `gDwelAeecf9MfEk6wpAYDI` (pages 1 · Temeller, 2 · Akışlar, 3 · Ekranlar; screen codes A1–I3). Handoff notes: `docs/handoff-notes.md`.
- V1 data: on device only, encrypted. No cloud account. Local notifications only.
- Process: small steps, one PR each, commit + push often.

## Done
- [x] Step 1 · Scaffold + tokens: Expo app, colour/space/radius/elevation tokens (`src/theme/tokens.ts`), Plus Jakarta Sans type roles (`src/theme/typography.ts`), 102 icons (`src/theme/icons.ts`, `src/components/Icon.tsx`), temporary token preview screen (`src/app/index.tsx`).
- [x] Step 2 · Core components (`src/components/`, all exported from `index.ts`): Button, IconButton, Choice, Toggle, Checkbox, Radio, OptionCard, Stepper, Input, TextArea, Card, Tag, IconBadge, Avatar, ListRow, Divider, SectionHeader, StatTile, Skeleton, Banner, Toast, Dialog, EmptyState, TopBar, TabBar, ProgressSteps, CycleRing, DayCell, FlowLevel, PasscodeDot, KeypadKey. Dev gallery at `src/app/gallery.tsx` (temporary). Bottom sheet is still to do (comes with Quick Log in step 5).

## Open
- PR #1 (branch `step-2-components`): Step 2 core components + dev gallery. Merge it first, then start Step 3.

## Next
- [ ] Step 3 · Onboarding A1… + I1 Splash.
- [ ] Step 4 · Home B1–B4 (no scroll, fits 844) + Cycle Ring.
- [ ] Step 5 · Log C1–C5 (Quick Log sheet, Period start/end, Daily Log).
- [ ] Step 6 · History D1–D4.
- [ ] Step 7 · Insights E1–E2.
- [ ] Step 8 · Me / settings / data F*, G*, H* (destructive actions two-step).
- [ ] Step 9 · Local data layer (encrypted on device) + local notifications (I2 copy).
- [ ] Step 10 · App icon (I3), EAS build, TestFlight / Play internal test.

## Notes for the next session
- In the cloud container `api.expo.dev` is blocked: use `EXPO_OFFLINE=1 npx expo install <pkg>`. Verify with `npx tsc --noEmit` and `EXPO_OFFLINE=1 npx expo export --platform ios`. Visual check: `EXPO_OFFLINE=1 npx expo export --platform web`, serve the folder, screenshot at 390×844 with Playwright.
- Figma pink naming trap: Figma script's `C.p100` = pink/200 = `surface/muted`, `C.p200` = pink/300 = `surface/strong`, `C.p50` = pink/100 = `surface/subtle`, `C.p300` = pink/400 = `border/default`.
