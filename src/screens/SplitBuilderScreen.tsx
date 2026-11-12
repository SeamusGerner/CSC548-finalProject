import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import Button from '../components/Button';
import TextField from '../components/TextField';
import { errorMessage } from '../lib/errors';
import { createSplit, listSplits } from '../lib/splits';
import type { Split } from '../types';

export default function SplitBuilderScreen() {
  const router = useRouter();
  const [splits, setSplits] = useState<Split[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reload whenever the screen comes back into focus (e.g. after renaming a split).
  useFocusEffect(
    useCallback(() => {
      listSplits()
        .then((data) => {
          setSplits(data);
          setError(null);
        })
        .catch((e) => setError(errorMessage(e)))
        .finally(() => setLoading(false));
    }, []),
  );

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Enter a name for your split.');
      return;
    }

    setCreating(true);
    try {
      const split = await createSplit(trimmed);
      setName('');
      setError(null);
      router.push(`/split/${split.id}`);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setCreating(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <TextField
        label="New split"
        value={name}
        onChangeText={setName}
        placeholder="e.g. Push/Pull/Legs"
        returnKeyType="done"
        onSubmitEditing={handleCreate}
      />
      <Button title="Create Split" onPress={handleCreate} loading={creating} />

      {error && <Text style={styles.error}>{error}</Text>}

      <Text style={styles.heading}>Your splits</Text>
      {loading ? (
        <ActivityIndicator style={styles.spinner} />
      ) : splits.length === 0 ? (
        <Text style={styles.empty}>No splits yet. Create one above to plan your week.</Text>
      ) : (
        splits.map((split) => (
          <Pressable
            key={split.id}
            accessibilityRole="button"
            onPress={() => router.push(`/split/${split.id}`)}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <Text style={styles.rowText}>{split.name}</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))
      )}
      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  error: {
    color: '#d93025',
    marginBottom: 12,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  spinner: {
    marginTop: 16,
  },
  empty: {
    color: '#666',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  rowPressed: {
    backgroundColor: '#f1f3f4',
  },
  rowText: {
    fontSize: 16,
  },
  chevron: {
    fontSize: 22,
    color: '#999',
  },
  bottomSpace: {
    height: 24,
  },
});
