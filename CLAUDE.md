# CLAUDE.md

## Project

Vector is a mobile workout tracker for planning a training split, logging every set
(weight, reps, effort), and reviewing progress over time. The target user is a
beginner–intermediate lifter following a split who wants a simple, free tracker
without paywalls or clutter. Final project for CSC 548 (Software Engineering),
Fall 2026, by Seamus Gerner and Jake Lee.

## Tech Stack

- React Native + Expo SDK 58, TypeScript (strict)
- Supabase: email auth, PostgreSQL, Row Level Security
- Jest via the `jest-expo` preset
- Exercise library seeded from the open-source wger database

## Folder Structure

```
App.tsx              # root component (still the Expo template; not yet wired to screens)
index.ts             # registerRootComponent entry
src/screens/         # screen components: SplitBuilder, WorkoutLogger, History (stubs)
src/types/index.ts   # data model types mirroring supabase/schema.sql
supabase/schema.sql  # tables, indexes, RLS policies
docs/timeline.md     # sprint timeline
assets/              # icons and splash
.env.example         # EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY
```

Planned locations (create as needed): `src/components/` for reusable UI,
`src/lib/` for the Supabase client and pure logic (PR detection, estimated 1RM).

## Commands

```bash
npm install          # install dependencies
npx expo start       # start Metro / Expo dev server (npm start)
npm run typecheck    # tsc --noEmit
npm test             # Jest (passes with no tests until tests are added)
npx expo install --check   # verify deps match the Expo SDK
```

## Data Model

Defined in `supabase/schema.sql`; types in `src/types/index.ts` must stay in sync.

- `users` — profile row keyed to `auth.users.id`; `unit` is `'lb' | 'kg'`.
- `splits` — a user's routine (e.g. "PPL"), owned by `user_id`.
- `split_days` — ordered days in a split (`day_order`, unique per split).
- `exercises` — shared library (wger-seeded); read-only to signed-in users.
- `workouts` — one session on a `date`, owned by `user_id`, optionally linked to a
  `split_day_id` (set null if the day is deleted), with `notes`.
- `sets` — one set in a workout: `exercise_id`, `set_no`, `weight`, `reps`, `rpe` (1–10).
  Unique per (workout, exercise, set_no).

Relationships: User → Split → SplitDay (planning side). Logging happens as
User → Workout (for a SplitDay) → Set, and each Set references an Exercise.
There is no split_day ↔ exercise join table yet, so a day's planned exercise list
is not modeled in the schema.

RLS: `splits` and `workouts` check `user_id = auth.uid()`; `split_days` and `sets`
check ownership through their parent row; `users` checks `id = auth.uid()`.

## Conventions

- TypeScript strict mode; no `any` without a reason in a comment.
- Functional components with hooks only; default-export one component per screen file.
- File naming: `PascalCase.tsx` for components/screens (screens end in `Screen`),
  `camelCase.ts` for logic modules, `*.test.ts` next to the code under test.
- Styles via `StyleSheet.create` at the bottom of the file, matching existing screens.
- Screens → `src/screens/`, reusable components → `src/components/`,
  shared types → `src/types/`, Supabase client and pure logic → `src/lib/`.
- Database columns are snake_case and types use the same field names.

## Rules

- Never commit `.env` or any real keys. `.env` is gitignored; only `.env.example`
  (with empty values) is tracked.
- Supabase config comes from `EXPO_PUBLIC_SUPABASE_URL` and
  `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Only the anon key goes in the app, never the
  service-role key.
- Every user-owned table has RLS enabled with ownership policies. New tables need RLS
  in the same change.
- Schema changes update both `supabase/schema.sql` and `src/types/index.ts`.
- Small commits with conventional messages (`feat:`, `fix:`, `docs:`, `chore:`,
  `test:`, `refactor:`), one logical change each.
- Use feature branches + PRs for anything beyond small fixes.
- Write Jest tests for logic such as PR detection and estimated 1RM. Keep that logic
  pure (in `src/lib/`) so it's testable without React Native.
- Run `npm run typecheck` and `npm test` before committing.

## Scope Guardrails

Vector is for lifting only. Don't add social feeds, sharing, follower systems, or
cardio/run/step tracking. Prefer fewer, polished features over breadth.

## Current Status (Nov 11, 2026)

Scaffold stage: Expo TS project, schema with RLS, types, and three stub screens.
Not yet implemented: Supabase client, auth/sign-in, navigation, split builder,
logger, rest timer, history, charts, PR detection, wger import. The schedule has us
in Sprint 3, so Sprint 1–2 features are behind.

## Timeline (docs/timeline.md)

| Phase    | Dates           | Goals                                       |
| -------- | --------------- | ------------------------------------------- |
| Phase 1  | Sep 29 – Oct 9  | Proposal, repo, wireframes, DB schema       |
| Sprint 1 | Oct 12 – Oct 23 | Expo + Supabase setup, sign-in, split builder |
| Sprint 2 | Oct 26 – Nov 6  | Workout logger, RPE & notes, rest timer     |
| Sprint 3 | Nov 9 – Nov 20  | History, charts, PR detection, wger import  |
| Sprint 4 | Nov 23 – Dec 4  | Testing, bug fixes, polish                  |
| Final    | Early Dec       | Demo, report, presentation                  |
