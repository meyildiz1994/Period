# Period · progress

Read this first when resuming. Update it in every PR.

## Context
- App: Period, menstrual cycle tracker. Track → Understand → Manage. Calm, premium, soft pink/plum. No medical claims; predictions are labelled "estimate". UI language English (v1).
- Stack: Expo SDK 57 + TypeScript + Expo Router (routes in `src/app/`). iOS + Android from one codebase.
- Design source of truth: Figma "Period Final" `gDwelAeecf9MfEk6wpAYDI` (pages 1 · Temeller, 2 · Akışlar, 3 · Ekranlar; screen codes A1–I3). Handoff notes: `docs/handoff-notes.md`.
- V1 data: on device only, encrypted. No cloud account. Local notifications only.
- Process: small steps, one PR each, commit + push often.

## Done
- [x] Step 1 · Scaffold + tokens: Expo app, colour/space/radius/elevation tokens (`src/theme/tokens.ts`), Plus Jakarta Sans type roles (`src/theme/typography.ts`), 89 icons (`src/theme/icons.ts`, `src/components/Icon.tsx`), temporary token preview screen (`src/app/index.tsx`).

## Next
- [ ] Step 2 · Core components from 1 · Temeller › 05 Bileşenler: Button, IconButton, Card, ListRow, Field, Chip/Segmented, Sheet, TabBar (Home | History | + | Insights | Me, fixed), Cycle Ring (Phase variants incl. Empty).
- [ ] Step 3 · Onboarding A1… + I1 Splash.
- [ ] Step 4 · Home B1–B4 (no scroll, fits 844) + Cycle Ring.
- [ ] Step 5 · Log C1–C5 (Quick Log sheet, Period start/end, Daily Log).
- [ ] Step 6 · History D1–D4.
- [ ] Step 7 · Insights E1–E2.
- [ ] Step 8 · Me / settings / data F*, G*, H* (destructive actions two-step).
- [ ] Step 9 · Local data layer (encrypted on device) + local notifications (I2 copy).
- [ ] Step 10 · App icon (I3), EAS build, TestFlight / Play internal test.

## Notes for the next session
- Figma has 102 icons; the source script only carried 89 named SVGs. Add missing ones when a screen needs them.
- In the cloud container `api.expo.dev` is blocked: use `EXPO_OFFLINE=1 npx expo install <pkg>`. Verify with `npx tsc --noEmit` and `EXPO_OFFLINE=1 npx expo export --platform ios`.
