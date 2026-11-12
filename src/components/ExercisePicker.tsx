import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '../lib/errors';
import { listExercises } from '../lib/splits';
import type { Exercise } from '../types';

interface ExercisePickerProps {
  visible: boolean;
  /** Exercises already on the day, hidden from the list. */
  excludeIds: readonly string[];
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}

export default function ExercisePicker({
  visible,
  excludeIds,
  onSelect,
  onClose,
}: ExercisePickerProps) {
  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load the library the first time the picker opens.
  useEffect(() => {
    if (!visible || exercises) return;
    listExercises()
      .then(setExercises)
      .catch((e) => setError(errorMessage(e)));
  }, [visible, exercises]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (exercises ?? []).filter(
      (exercise) =>
        !excludeIds.includes(exercise.id) &&
        (!q ||
          exercise.name.toLowerCase().includes(q) ||
          exercise.muscle_group?.toLowerCase().includes(q)),
    );
  }, [exercises, excludeIds, query]);

  function handleClose() {
    setQuery('');
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Exercise</Text>
          <Pressable accessibilityRole="button" onPress={handleClose} hitSlop={8}>
            <Text style={styles.close}>Close</Text>
          </Pressable>
        </View>

        <TextInput
          style={styles.search}
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name or muscle"
          placeholderTextColor="#999"
          autoCorrect={false}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        {!exercises && !error ? (
          <ActivityIndicator style={styles.spinner} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={styles.empty}>
                {exercises?.length === 0
                  ? 'The exercise library is empty. Run supabase/seed.sql.'
                  : 'No matching exercises.'}
              </Text>
            }
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setQuery('');
                  onSelect(item);
                }}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              >
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>
                  {[item.muscle_group, item.equipment].filter(Boolean).join(' · ')}
                </Text>
              </Pressable>
            )}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  close: {
    color: '#1a73e8',
    fontSize: 16,
  },
  search: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  error: {
    color: '#d93025',
    marginHorizontal: 16,
  },
  spinner: {
    marginTop: 32,
  },
  empty: {
    color: '#666',
    textAlign: 'center',
    marginTop: 32,
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  rowPressed: {
    backgroundColor: '#f1f3f4',
  },
  name: {
    fontSize: 16,
  },
  meta: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
});
