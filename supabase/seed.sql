-- Starter exercise library. Temporary until the wger import replaces it.
-- Safe to re-run: existing names are skipped.

insert into public.exercises (name, muscle_group, equipment) values
  ('Barbell Bench Press',         'Chest',      'Barbell'),
  ('Incline Dumbbell Press',      'Chest',      'Dumbbell'),
  ('Push-Up',                     'Chest',      'Bodyweight'),
  ('Cable Fly',                   'Chest',      'Cable'),
  ('Overhead Press',              'Shoulders',  'Barbell'),
  ('Dumbbell Lateral Raise',      'Shoulders',  'Dumbbell'),
  ('Triceps Pushdown',            'Triceps',    'Cable'),
  ('Dip',                         'Triceps',    'Bodyweight'),
  ('Deadlift',                    'Back',       'Barbell'),
  ('Barbell Row',                 'Back',       'Barbell'),
  ('Pull-Up',                     'Back',       'Bodyweight'),
  ('Lat Pulldown',                'Back',       'Cable'),
  ('Seated Cable Row',            'Back',       'Cable'),
  ('Face Pull',                   'Shoulders',  'Cable'),
  ('Barbell Curl',                'Biceps',     'Barbell'),
  ('Dumbbell Hammer Curl',        'Biceps',     'Dumbbell'),
  ('Back Squat',                  'Quads',      'Barbell'),
  ('Leg Press',                   'Quads',      'Machine'),
  ('Romanian Deadlift',           'Hamstrings', 'Barbell'),
  ('Lying Leg Curl',              'Hamstrings', 'Machine'),
  ('Walking Lunge',               'Quads',      'Dumbbell'),
  ('Standing Calf Raise',         'Calves',     'Machine')
on conflict (name) do nothing;
