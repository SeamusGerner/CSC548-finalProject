// Supabase queries for the split builder. Each function throws on error.

import type { PostgrestError } from '@supabase/supabase-js';

import type { Exercise, Split, SplitDay, SplitDayExercise } from '../types';
import { supabase } from './supabase';

/** A planned exercise with its exercise details joined in. */
export interface PlannedExercise extends SplitDayExercise {
  exercise: Exercise;
}

function unwrap<T>({ data, error }: { data: T | null; error: PostgrestError | null }): T {
  if (error) throw new Error(error.message);
  return data as T;
}

function check({ error }: { error: PostgrestError | null }): void {
  if (error) throw new Error(error.message);
}

// Splits

export async function listSplits(): Promise<Split[]> {
  return unwrap(await supabase.from('splits').select('*').order('name'));
}

export async function getSplit(id: string): Promise<Split> {
  return unwrap(await supabase.from('splits').select('*').eq('id', id).single());
}

export async function createSplit(name: string): Promise<Split> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error('You need to be signed in.');
  return unwrap(
    await supabase
      .from('splits')
      .insert({ user_id: data.session.user.id, name })
      .select()
      .single(),
  );
}

export async function renameSplit(id: string, name: string): Promise<void> {
  check(await supabase.from('splits').update({ name }).eq('id', id));
}

export async function deleteSplit(id: string): Promise<void> {
  check(await supabase.from('splits').delete().eq('id', id));
}

// Split days

export async function listDays(splitId: string): Promise<SplitDay[]> {
  return unwrap(
    await supabase.from('split_days').select('*').eq('split_id', splitId).order('day_order'),
  );
}

export async function getDay(id: string): Promise<SplitDay> {
  return unwrap(await supabase.from('split_days').select('*').eq('id', id).single());
}

export async function addDay(splitId: string, name: string, dayOrder: number): Promise<SplitDay> {
  return unwrap(
    await supabase
      .from('split_days')
      .insert({ split_id: splitId, name, day_order: dayOrder })
      .select()
      .single(),
  );
}

export async function renameDay(id: string, name: string): Promise<void> {
  check(await supabase.from('split_days').update({ name }).eq('id', id));
}

export async function deleteDay(id: string): Promise<void> {
  check(await supabase.from('split_days').delete().eq('id', id));
}

/**
 * Saves the given order (index = new day_order) in one upsert. The unique
 * constraint on (split_id, day_order) is deferrable, so swaps don't conflict.
 */
export async function saveDayOrder(days: readonly SplitDay[]): Promise<void> {
  const rows = days.map((day, index) => ({
    id: day.id,
    split_id: day.split_id,
    name: day.name,
    day_order: index,
  }));
  check(await supabase.from('split_days').upsert(rows, { onConflict: 'id' }));
}

// Planned exercises

export async function listPlannedExercises(splitDayId: string): Promise<PlannedExercise[]> {
  return unwrap(
    await supabase
      .from('split_day_exercises')
      .select('*, exercise:exercises(*)')
      .eq('split_day_id', splitDayId)
      .order('position'),
  );
}

export async function addPlannedExercise(
  splitDayId: string,
  exerciseId: string,
  position: number,
): Promise<void> {
  check(
    await supabase
      .from('split_day_exercises')
      .insert({ split_day_id: splitDayId, exercise_id: exerciseId, position }),
  );
}

export async function updateTargets(
  id: string,
  targetSets: number,
  targetReps: number,
): Promise<void> {
  check(
    await supabase
      .from('split_day_exercises')
      .update({ target_sets: targetSets, target_reps: targetReps })
      .eq('id', id),
  );
}

export async function removePlannedExercise(id: string): Promise<void> {
  check(await supabase.from('split_day_exercises').delete().eq('id', id));
}

/** Saves the given order (index = new position) in one upsert, like saveDayOrder. */
export async function savePlannedOrder(items: readonly PlannedExercise[]): Promise<void> {
  const rows = items.map((item, index) => ({
    id: item.id,
    split_day_id: item.split_day_id,
    exercise_id: item.exercise_id,
    position: index,
    target_sets: item.target_sets,
    target_reps: item.target_reps,
  }));
  check(await supabase.from('split_day_exercises').upsert(rows, { onConflict: 'id' }));
}

// Exercise library

export async function listExercises(): Promise<Exercise[]> {
  return unwrap(await supabase.from('exercises').select('*').order('name'));
}
