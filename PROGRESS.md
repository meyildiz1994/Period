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

- [x] Step 3 · I1 Splash (`src/app/index.tsx`) → A1 Welcome → A2–A6 setup steps → A7 All set (`src/app/onboarding/`). Shared frame `OnboardingStep`, day/month/year `DateWheel` (also for C2), answers in an in-memory store `src/state/onboarding.ts` (symptom list in `src/state/symptoms.ts`). Token preview moved to `/tokens`; `/home` is a temporary landing until step 4.

## Open
- Step 3 PR on `claude/eager-newton-ippaxr`. Merge it, then start step 4 from main.
- Loose ends from step 3, to wire later: A1 "Sign in" link → F3 (step 8). A6 "Turn on reminders" only saves the choice; permission prompt + scheduling in step 9. Onboarding answers are not persisted yet (step 9), so the app restarts at onboarding.

## Next
- [ ] Step 4 · Home B1–B4 (no scroll, fits 844) + Cycle Ring.
- [ ] Step 5 · Log C1–C5 (Quick Log sheet, Period start/end, Daily Log).
- [ ] Step 6 · History D1–D4.
- [ ] Step 7 · Insights E1–E2.
- [ ] Step 8 · Me / settings / data F*, G*, H* (destructive actions two-step).
- [ ] Step 9 · Local data layer (encrypted on device) + local notifications (I2 copy).
- [ ] Step 10 · App icon (I3), EAS build, TestFlight / Play internal test.

## Notes for the next session
- Figma MCP is on the Starter plan and its monthly call quota ran out on 2026-10-06. Build from `docs/screens.md`; the user can send more screenshots if something is missing.
- Lint is not set up yet (`npx expo lint` would install ESLint config); only typecheck runs.
- In the cloud container `api.expo.dev` is blocked: use `EXPO_OFFLINE=1 npx expo install <pkg>`. Verify with `npx tsc --noEmit` and `EXPO_OFFLINE=1 npx expo export --platform ios`. Visual check: `EXPO_OFFLINE=1 npx expo export --platform web`, serve the folder, screenshot at 390×844 with Playwright.
- Figma pink naming trap: Figma script's `C.p100` = pink/200 = `surface/muted`, `C.p200` = pink/300 = `surface/strong`, `C.p50` = pink/100 = `surface/subtle`, `C.p300` = pink/400 = `border/default`.
