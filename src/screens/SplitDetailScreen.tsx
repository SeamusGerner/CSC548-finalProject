import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Button from '../components/Button';
import SmallButton from '../components/SmallButton';
import TextField from '../components/TextField';
import { errorMessage } from '../lib/errors';
import { moveItem, nextPosition } from '../lib/ordering';
import { addDay, deleteSplit, getSplit, listDays, renameSplit, saveDayOrder } from '../lib/splits';
import type { Split, SplitDay } from '../types';

export default function SplitDetailScreen() {
  const { splitId } = useLocalSearchParams<{ splitId: string }>();
  const router = useRouter();
  const [split, setSplit] = useState<Split | null>(null);
  const [days, setDays] = useState<SplitDay[]>([]);
  const [splitName, setSplitName] = useState('');
  const [newDayName, setNewDayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [splitData, dayData] = await Promise.all([getSplit(splitId), listDays(splitId)]);
      setSplit(splitData);
      setSplitName(splitData.name);
      setDays(dayData);
      setError(null);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [splitId]);

  // Reload on focus so day renames made on the day screen show up here.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleRename() {
    const trimmed = splitName.trim();
    if (!split || !trimmed) {
      setError('Split name can’t be empty.');
      return;
    }
    setBusy(true);
    try {
      await renameSplit(split.id, trimmed);
      setSplit({ ...split, name: trimmed });
      setSplitName(trimmed);
      setError(null);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleAddDay() {
    const trimmed = newDayName.trim();
    if (!trimmed) {
      setError('Enter a name for the day.');
      return;
    }
    setBusy(true);
    try {
      const day = await addDay(splitId, trimmed, nextPosition(days.map((d) => d.day_order)));
      setDays([...days, day]);
      setNewDayName('');
      setError(null);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const reordered = moveItem(days, index, direction);
    setDays(reordered);
    setBusy(true);
    try {
      await saveDayOrder(reordered);
      setError(null);
    } catch (e) {
      setError(errorMessage(e));
      load();
    } finally {
      setBusy(false);
    }
  }

  function confirmDelete() {
    Alert.alert('Delete split?', `“${split?.name}” and all of its days will be deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSplit(splitId);
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
      <Stack.Screen options={{ title: split?.name ?? 'Split' }} />

      {error && <Text style={styles.error}>{error}</Text>}

      <TextField label="Split name" value={splitName} onChangeText={setSplitName} />
      <Button
        title="Save Name"
        variant="secondary"
        onPress={handleRename}
        disabled={busy || splitName.trim() === split?.name}
      />

      <Text style={styles.heading}>Days</Text>
      {days.length === 0 && <Text style={styles.empty}>No days yet. Add your first one below.</Text>}
      {days.map((day, index) => (
        <View key={day.id} style={styles.row}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(`/day/${day.id}`)}
            style={styles.rowMain}
          >
            <Text style={styles.dayNumber}>Day {index + 1}</Text>
            <Text style={styles.rowText}>{day.name}</Text>
          </Pressable>
          <SmallButton
            label="▲"
            accessibilityLabel={`Move ${day.name} up`}
            onPress={() => handleMove(index, -1)}
            disabled={busy || index === 0}
          />
          <SmallButton
            label="▼"
            accessibilityLabel={`Move ${day.name} down`}
            onPress={() => handleMove(index, 1)}
            disabled={busy || index === days.length - 1}
          />
        </View>
      ))}

      <View style={styles.addDay}>
        <TextField
          label="New day"
          value={newDayName}
          onChangeText={setNewDayName}
          placeholder="e.g. Push"
          returnKeyType="done"
          onSubmitEditing={handleAddDay}
        />
        <Button title="Add Day" onPress={handleAddDay} loading={busy} />
      </View>

      <View style={styles.danger}>
        <Button title="Delete Split" variant="danger" onPress={confirmDelete} />
      </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  rowMain: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dayNumber: {
    fontSize: 12,
    color: '#666',
  },
  rowText: {
    fontSize: 16,
  },
  addDay: {
    marginTop: 16,
  },
  danger: {
    marginTop: 24,
  },
});
