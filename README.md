# Vector

A mobile workout tracker for your split, every set, and how it felt.

## Team

- Seamus Gerner
- Jake Lee

## Planned Features

- **Split builder** — plan a weekly split (e.g., Push/Pull/Legs)
- **Workout logger** — log every set with weight and reps
- **RPE & notes** — rate effort using the reps-in-reserve (RIR) scale and add notes per exercise
- **Rest timer** — built-in timer between sets
- **Progress charts** — visualize strength trends over time
- **PR detection** — automatically flag personal records
- **Accounts & cloud sync** — sign in and keep your data across devices

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
