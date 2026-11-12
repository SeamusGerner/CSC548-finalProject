# CLAUDE.md

## Project

Vector is a mobile workout tracker for planning a training split, logging every set
(weight, reps, effort), and reviewing progress over time. The target user is a
beginner–intermediate lifter following a split who wants a simple, free tracker
without paywalls or clutter. Final project for CSC 548 (Software Engineering),
Fall 2026, by Seamus Gerner and Jake Lee.

## Tech Stack

- React Native + Expo SDK 58, TypeScript (strict), Expo Router (file-based routing)
- Supabase (`@supabase/supabase-js`): email auth, PostgreSQL, Row Level Security;
  sessions persisted with AsyncStorage
- Jest via the `jest-expo` preset
- Exercise library seeded from the open-source wger database (planned)

## Folder Structure

```
app/                   # Expo Router routes (entry: "expo-router/entry")
  _layout.tsx          # AuthProvider + Stack.Protected: auth group when signed out, tabs when signed in
  (auth)/              # sign-in, sign-up
  (tabs)/              # (splits) stack, log, history; headers have Sign Out
    (splits)/          # index (split list) -> split/[splitId] -> day/[dayId]
src/screens/           # screen components; route files just re-export these
src/components/        # reusable UI (Button, TextField, SmallButton, ExercisePicker, ...)
src/lib/               # supabase.ts (client), auth.tsx (useAuth), splits.ts (queries),
                       # pure logic: validation.ts, ordering.ts (+ *.test.ts)
src/types/index.ts     # data model types mirroring supabase/schema.sql
supabase/schema.sql    # full schema: tables, indexes, RLS, sign-up profile trigger
supabase/migrations/   # incremental SQL for the live DB (YYYYMMDD_name.sql)
supabase/seed.sql      # starter exercise library (22 exercises, re-runnable)
docs/timeline.md       # sprint timeline
```

## Commands

```bash
npm install          # install dependencies
npx expo start       # dev server; open in Expo Go (Android) via QR or exp://<LAN-IP>:8081
npm run typecheck    # tsc --noEmit
npm test             # Jest
npx expo install <pkg>     # add deps (picks SDK-compatible versions)
npx expo install --check   # verify deps match the Expo SDK
```

## Data Model

Defined in `supabase/schema.sql`; types in `src/types/index.ts` must stay in sync.

- `users`: profile row keyed to `auth.users.id`, created by the `on_auth_user_created`
  trigger on sign-up; `unit` is `'lb' | 'kg'`.
- `splits`: a user's routine (e.g. "PPL"), owned by `user_id`.
- `split_days`: ordered days in a split (`day_order`, unique per split, deferrable).
- `split_day_exercises`: planned exercises for a day: `exercise_id`, `position`
  (unique per day, deferrable), `target_sets`, `target_reps` (defaults 3 × 10).
- `exercises`: shared library; read-only to signed-in users.
- `workouts`: one session on a `date`, owned by `user_id`, optionally linked to a
  `split_day_id`, with `notes`.
- `sets`: `exercise_id`, `set_no`, `weight`, `reps`, `rpe` (1–10); unique per
  (workout, exercise, set_no).

Relationships: User → Split → SplitDay → SplitDayExercise → Exercise (planning).
User → Workout (for a SplitDay) → Set → Exercise (logging).

RLS: `splits`/`workouts` check `user_id = auth.uid()`; `split_days`, `sets`, and
`split_day_exercises` check ownership through the parent row(s); `users` checks
`id = auth.uid()`.

Reordering: save the whole new order in one `upsert` (see `saveDayOrder`). The
ordering constraints are deferrable so swapped values don't conflict mid-statement.

## Conventions

- TypeScript strict; functional components with hooks; one default-exported
  component per screen file.
- `PascalCase.tsx` for components/screens (screens end in `Screen`), `camelCase.ts`
  for logic, `*.test.ts` next to the code under test. Route files are kebab-case.
- Styles via `StyleSheet.create` at the bottom of the file.
- Keep logic pure in `src/lib/` (e.g. `validation.ts`) so Jest can test it.
- DB columns are snake_case; types use the same field names.

## Rules

- Never commit `.env` or keys. Each developer keeps their own `.env`; share values
  outside the repo. Only `.env.example` (empty values) is tracked.
- Supabase config comes from `EXPO_PUBLIC_SUPABASE_URL` (base URL, no `/rest/v1/`)
  and `EXPO_PUBLIC_SUPABASE_ANON_KEY` (publishable key). Never the secret/service-role key.
- Every user-owned table has RLS with ownership policies, added in the same change.
- Schema changes update `schema.sql`, `src/types/index.ts`, and add a file in
  `supabase/migrations/` for the live DB (re-running `schema.sql` fails with
  "already exists"). Tell the user exactly what SQL to run.
- Small conventional commits (`feat:`, `fix:`, `docs:`, `chore:`, `test:`), one
  logical change each. Feature branches + PRs for anything beyond small fixes.
- No `Co-Authored-By` or "Generated with Claude Code" lines in commits or PRs.
- Jest tests for logic such as validation, PR detection, and estimated 1RM.
- Run `npm run typecheck` and `npm test` before committing.

## Gotchas

- TypeScript 6 doesn't auto-include `@types/*`; tsconfig lists `"types": ["jest"]`.
- `react-dom` is pinned to match `react` (19.3.0) to avoid an ERESOLVE conflict from
  Expo Router's web deps. Use `npx expo install` rather than `npm install <pkg>`.

## Scope Guardrails

Lifting only. No social feeds, sharing, followers, or cardio/run/step tracking.
Prefer fewer, polished features over breadth.

## Current Status (Nov 11, 2026)

Branch `feature/auth-and-split-builder` (Sprint 1 catch-up, not merged yet):
- Done, tested in Expo Go on Android: Expo Router nav, Supabase client,
  email/password sign up / sign in / sign out, profile trigger.
- Done, not yet tested on device: split builder (create/rename/delete splits;
  add/rename/reorder/delete days; add/remove/reorder exercises with target sets × reps),
  `split_day_exercises` table + migration, exercise seed.
- Supabase project is set up and `schema.sql` (with trigger) has been run. The
  `20261111_split_day_exercises.sql` migration and `seed.sql` still need to be run.
- Next: on-device test of the split builder, then push + PR for Seamus to review.
- Not started: workout logger, rest timer, history, charts, PR detection, wger import.

## Before Final Submission

- [ ] Re-enable **Confirm email** (Supabase → Authentication → Sign In / Providers →
  Email). It was turned off for easier testing in Expo Go.

## Timeline (docs/timeline.md)

| Phase    | Dates           | Goals                                         |
| -------- | --------------- | --------------------------------------------- |
| Phase 1  | Sep 29 – Oct 9  | Proposal, repo, wireframes, DB schema         |
| Sprint 1 | Oct 12 – Oct 23 | Expo + Supabase setup, sign-in, split builder |
| Sprint 2 | Oct 26 – Nov 6  | Workout logger, RPE & notes, rest timer       |
| Sprint 3 | Nov 9 – Nov 20  | History, charts, PR detection, wger import    |
| Sprint 4 | Nov 23 – Dec 4  | Testing, bug fixes, polish                    |
| Final    | Early Dec       | Demo, report, presentation                    |
