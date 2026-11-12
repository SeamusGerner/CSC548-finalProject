-- Run once on databases created from the original schema.sql (before split_day_exercises).
-- Fresh setups get all of this from schema.sql and don't need it.

-- Make day ordering deferrable so reordering can swap day_order values in one statement.
alter table public.split_days
  drop constraint split_days_split_id_day_order_key;
alter table public.split_days
  add constraint split_days_split_id_day_order_key
    unique (split_id, day_order) deferrable initially immediate;

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

create index on public.split_day_exercises (split_day_id);
create index on public.split_day_exercises (exercise_id);

alter table public.split_day_exercises enable row level security;

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
