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
  -- Deferrable so a single statement can swap day_order values when reordering.
  constraint split_days_split_id_day_order_key
    unique (split_id, day_order) deferrable initially immediate
);

-- Shared exercise library (seeded from wger)
create table public.exercises (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique,
  muscle_group text,
  equipment    text
);

-- Planned exercises for a split day, with targets
create table public.split_day_exercises (
  id           uuid primary key default gen_random_uuid(),
  split_day_id uuid not null references public.split_days (id) on delete cascade,
  exercise_id  uuid not null references public.exercises (id) on delete restrict,
  position     integer not null check (position >= 0),
  target_sets  integer not null default 3 check (target_sets > 0),
  target_reps  integer not null default 10 check (target_reps > 0),
  constraint split_day_exercises_split_day_id_position_key
    unique (split_day_id, position) deferrable initially immediate
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
create index on public.split_day_exercises (split_day_id);
create index on public.split_day_exercises (exercise_id);
create index on public.workouts (user_id, date);
create index on public.sets (workout_id);
create index on public.sets (exercise_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.users      enable row level security;
alter table public.splits     enable row level security;
alter table public.split_days enable row level security;
alter table public.split_day_exercises enable row level security;
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

-- split_day_exercises: owned through split_day -> split
create policy "Users manage own split day exercises" on public.split_day_exercises
  for all
  using (exists (
    select 1 from public.split_days d
    join public.splits s on s.id = d.split_id
    where d.id = split_day_id and s.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.split_days d
    join public.splits s on s.id = d.split_id
    where d.id = split_day_id and s.user_id = (select auth.uid())
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

-- ---------------------------------------------------------------------------
-- Profile row on sign-up
-- ---------------------------------------------------------------------------

-- Creates the public.users profile row whenever a new auth user signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
