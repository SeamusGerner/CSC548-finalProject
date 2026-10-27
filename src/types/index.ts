// Core data model types, mirroring supabase/schema.sql.

export type WeightUnit = 'lb' | 'kg';

export interface User {
  id: string;
  email: string;
  display_name: string | null;
  unit: WeightUnit;
}

export interface Split {
  id: string;
  user_id: string;
  name: string;
}

export interface SplitDay {
  id: string;
  split_id: string;
  name: string;
  day_order: number;
}

export interface Exercise {
  id: string;
  name: string;
  muscle_group: string | null;
  equipment: string | null;
}

export interface Workout {
  id: string;
  user_id: string;
  split_day_id: string | null;
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  notes: string | null;
}

export interface WorkoutSet {
  id: string;
  workout_id: string;
  exercise_id: string;
  set_no: number;
  weight: number | null;
  reps: number | null;
  /** Rate of perceived exertion, 1–10 (reps-in-reserve scale) */
  rpe: number | null;
}
