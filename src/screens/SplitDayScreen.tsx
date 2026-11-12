import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import Button from '../components/Button';
import ExercisePicker from '../components/ExercisePicker';
import PlannedExerciseRow from '../components/PlannedExerciseRow';
import TextField from '../components/TextField';
import { errorMessage } from '../lib/errors';
import { moveItem, nextPosition } from '../lib/ordering';
import {
  addPlannedExercise,
  deleteDay,
  getDay,
  listPlannedExercises,
  removePlannedExercise,
  renameDay,
  savePlannedOrder,
  updateTargets,
  type PlannedExercise,
} from '../lib/splits';
import type { Exercise, SplitDay } from '../types';

export default function SplitDayScreen() {
  const { dayId } = useLocalSearchParams<{ dayId: string }>();
  const router = useRouter();
  const [day, setDay] = useState<SplitDay | null>(null);
  const [dayName, setDayName] = useState('');
  const [planned, setPlanned] = useState<PlannedExercise[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [dayData, plannedData] = await Promise.all([getDay(dayId), listPlannedExercises(dayId)]);
      setDay(dayData);
      setDayName(dayData.name);
      setPlanned(plannedData);
      setError(null);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [dayId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  /** Runs a save, shows any error, and reloads from the server if it fails. */
  async function run(action: () => Promise<void>) {
    setBusy(true);
    try {
      await action();
      setError(null);
    } catch (e) {
      setError(errorMessage(e));
      load();
    } finally {
      setBusy(false);
    }
  }

  function handleRename() {
    const trimmed = dayName.trim();
    if (!day || !trimmed) {
      setError('Day name can’t be empty.');
      return;
    }
    run(async () => {
      await renameDay(day.id, trimmed);
      setDay({ ...day, name: trimmed });
      setDayName(trimmed);
    });
  }

  function handleSelectExercise(exercise: Exercise) {
    setPickerOpen(false);
    run(async () => {
      await addPlannedExercise(dayId, exercise.id, nextPosition(planned.map((p) => p.position)));
      setPlanned(await listPlannedExercises(dayId));
    });
  }

  function handleChangeTargets(item: PlannedExercise, targetSets: number, targetReps: number) {
    setPlanned(
      planned.map((p) =>
        p.id === item.id ? { ...p, target_sets: targetSets, target_reps: targetReps } : p,
      ),
    );
    run(() => updateTargets(item.id, targetSets, targetReps));
  }

  function handleMove(index: number, direction: -1 | 1) {
    const reordered = moveItem(planned, index, direction);
    setPlanned(reordered);
    run(() => savePlannedOrder(reordered));
  }

  function handleRemove(item: PlannedExercise) {
    setPlanned(planned.filter((p) => p.id !== item.id));
    run(() => removePlannedExercise(item.id));
  }

  function confirmDeleteDay() {
    Alert.alert('Delete day?', `“${day?.name}” and its planned exercises will be deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDay(dayId);
            router.back();
          } catch (e) {
            setError(errorMessage(e));
          }
        },
      },
    ]);
  }

  if (loading) {
    return <ActivityIndicator style={styles.spinner} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: day?.name ?? 'Day' }} />

      {error && <Text style={styles.error}>{error}</Text>}

      <TextField label="Day name" value={dayName} onChangeText={setDayName} />
      <Button
        title="Save Name"
        variant="secondary"
        onPress={handleRename}
        disabled={busy || dayName.trim() === day?.name}
      />

      <Text style={styles.heading}>Exercises</Text>
      {planned.length === 0 && (
        <Text style={styles.empty}>No exercises yet. Add some to plan this day.</Text>
      )}
      {planned.map((item, index) => (
        <PlannedExerciseRow
          key={item.id}
          item={item}
          isFirst={index === 0}
          isLast={index === planned.length - 1}
          disabled={busy}
          onChangeTargets={(sets, reps) => handleChangeTargets(item, sets, reps)}
          onInvalidTarget={setError}
          onMove={(direction) => handleMove(index, direction)}
          onRemove={() => handleRemove(item)}
        />
      ))}

      <Button title="Add Exercise" onPress={() => setPickerOpen(true)} loading={busy} />

      <View style={styles.danger}>
        <Button title="Delete Day" variant="danger" onPress={confirmDeleteDay} />
      </View>

      <ExercisePicker
        visible={pickerOpen}
        excludeIds={planned.map((p) => p.exercise_id)}
        onSelect={handleSelectExercise}
        onClose={() => setPickerOpen(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  spinner: {
    marginTop: 32,
  },
  error: {
    color: '#d93025',
    marginBottom: 12,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
  },
  empty: {
    color: '#666',
    marginBottom: 8,
  },
  danger: {
    marginTop: 24,
  },
});
