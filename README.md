# Vector

**A mobile workout tracker for your split, every set, and how it felt.**

Vector helps gym-goers plan, log, and review their lifting in one place. It's built for beginner to intermediate lifters who follow a training split and want a simple, free way to track their progress over weeks and months.

## Why Vector?

- **Notes apps and notebooks get messy.** Tracking workouts on paper or in a phone note works for a week, then comparing sessions turns into guesswork.
- **Popular apps are cluttered or paywalled.** Many trackers push subscriptions, social feeds, or cardio features. Vector sticks to lifting.
- **"How it felt" rarely gets recorded.** Weight and reps show what you did, but not how hard it was. Vector lets you rate your effort, which helps you decide when to add weight.

## What it does

- **Plan your split:** Set up a weekly routine (for example, Push / Pull / Legs) and choose exercises for each day.
- **Log every set:** Record weight and reps quickly between sets. The app fills in your numbers from last time.
- **Rate your effort:** Score each set by how many reps you had left, and add a short note per exercise.
- **Rest timer:** Starts automatically after each set and buzzes when it's time to go again.
- **See your progress:** Charts show how your lifts improve over time.
- **Celebrate personal records:** Vector spots new bests automatically.
- **Use it on any phone:** Sign in on any phone and your history comes with you.

## Team

- Seamus Gerner
- Jake Lee

Final project for **CSC 548 – Software Engineering**, Fall 2026.

## Tech Stack

- **Frontend:** React Native + Expo (TypeScript)
- **Backend:** Supabase (email auth, PostgreSQL, Row Level Security)
- **Exercise data:** seeded from the open-source [wger](https://wger.de) exercise database

## Getting Started

### 1. Install

```bash
npm install
```

You'll also need the **Expo Go** app on your phone (Google Play / App Store).

### 2. Set up Supabase

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. In **SQL Editor**, run `supabase/schema.sql` (tables, Row Level Security, and the
   trigger that creates a profile row on sign-up), then `supabase/seed.sql` (starter
   exercise library).
   - If your database was created from an older `schema.sql`, run the files in
     `supabase/migrations/` instead of re-running `schema.sql`.
3. Optional for development: turn off **Authentication → Sign In / Providers → Email →
   Confirm email** so new accounts can sign in right away from Expo Go.

### 3. Add your keys

Copy `.env.example` to `.env` and fill in the values from **Project Settings → API Keys**
and **Data API**:

```
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<publishable / anon key>
```

Use the base URL (no `/rest/v1/`) and the publishable or anon key, never the secret or
service-role key. `.env` is gitignored; don't commit it.

### 4. Run

```bash
npx expo start
```

Scan the QR code with Expo Go (same Wi-Fi as your computer). If your network blocks
that, try `npx expo start --tunnel`.

Other scripts:

```bash
npm run typecheck   # TypeScript check (tsc --noEmit)
npm test            # Jest unit tests
```

## Project Structure

```
app/                   # Expo Router routes: (auth) sign-in/up, (tabs) Splits / Log / History
src/screens/           # screen components (route files re-export these)
src/components/        # reusable UI
src/lib/               # Supabase client, auth context, queries, pure logic (+ tests)
src/types/             # shared TypeScript types mirroring the database schema
supabase/schema.sql    # full database schema + RLS policies
supabase/migrations/   # incremental SQL for databases created from an older schema
supabase/seed.sql      # starter exercise library
docs/timeline.md       # sprint timeline
```
