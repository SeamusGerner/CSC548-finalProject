-- Vector database schema (Supabase / PostgreSQL)

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.users (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text not null unique,
  display_name text,
  unit         text not null default 'lb' check (unit in ('lb', 'kg'))
);

create table public.splits (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  name    text not null
);

create table public.split_days (
  id        uuid primary key default gen_random_uuid(),
  split_id  uuid not null references public.splits (id) on delete cascade,
  name      text not null,
  day_order integer not null check (day_order >= 0),
  unique (split_id, day_order)
);

-- Shared exercise library (seeded from wger)
create table public.exercises (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique,
  muscle_group text,
  equipment    text
);

create table public.workouts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users (id) on delete cascade,
  split_day_id uuid references public.split_days (id) on delete set null,
  date         date not null default current_date,
  notes        text
);

create table public.sets (
  id          uuid primary key default gen_random_uuid(),
  workout_id  uuid not null references public.workouts (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  set_no      integer not null check (set_no > 0),
  weight      numeric check (weight >= 0),
  reps        integer check (reps >= 0),
  rpe         numeric check (rpe between 1 and 10),
  unique (workout_id, exercise_id, set_no)
);

create index on public.splits (user_id);
create index on public.split_days (split_id);
create index on public.workouts (user_id, date);
create index on public.sets (workout_id);
create index on public.sets (exercise_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.users      enable row level security;
alter table public.splits     enable row level security;
alter table public.split_days enable row level security;
alter table public.exercises  enable row level security;
alter table public.workouts   enable row level security;
alter table public.sets       enable row level security;

-- users: each user manages only their own profile row
create policy "Users manage own profile" on public.users
  for all
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- splits: owned directly by user_id
create policy "Users manage own splits" on public.splits
  for all
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- split_days: owned through their parent split
create policy "Users manage own split days" on public.split_days
  for all
  using (exists (
    select 1 from public.splits s
    where s.id = split_id and s.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.splits s
    where s.id = split_id and s.user_id = (select auth.uid())
  ));

-- exercises: read-only library for signed-in users
create policy "Authenticated users can read exercises" on public.exercises
  for select
  to authenticated
  using (true);

-- workouts: owned directly by user_id
create policy "Users manage own workouts" on public.workouts
  for all
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- sets: owned through their parent workout
create policy "Users manage own sets" on public.sets
  for all
  using (exists (
    select 1 from public.workouts w
    where w.id = workout_id and w.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.workouts w
    where w.id = workout_id and w.user_id = (select auth.uid())
  ));
