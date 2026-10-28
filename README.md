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

```bash
npm install
npx expo start
```

Copy `.env.example` to `.env` and fill in your Supabase project URL and anon key.
