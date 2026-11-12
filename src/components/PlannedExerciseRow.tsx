import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import type { PlannedExercise } from '../lib/splits';
import { MAX_TARGET, parseTarget } from '../lib/validation';
import SmallButton from './SmallButton';

interface PlannedExerciseRowProps {
  item: PlannedExercise;
  isFirst: boolean;
  isLast: boolean;
  disabled: boolean;
  onChangeTargets: (targetSets: number, targetReps: number) => void;
  onInvalidTarget: (message: string) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}

export default function PlannedExerciseRow({
  item,
  isFirst,
  isLast,
  disabled,
  onChangeTargets,
  onInvalidTarget,
  onMove,
  onRemove,
}: PlannedExerciseRowProps) {
  const [setsText, setSetsText] = useState(String(item.target_sets));
  const [repsText, setRepsText] = useState(String(item.target_reps));

  // Keep the inputs in sync if the saved targets change (e.g. after a reload).
  useEffect(() => {
    setSetsText(String(item.target_sets));
    setRepsText(String(item.target_reps));
  }, [item.target_sets, item.target_reps]);

  function commit() {
    const sets = parseTarget(setsText);
    const reps = parseTarget(repsText);
    if (sets === null || reps === null) {
      setSetsText(String(item.target_sets));
      setRepsText(String(item.target_reps));
      onInvalidTarget(`Sets and reps must be whole numbers from 1 to ${MAX_TARGET}.`);
      return;
    }
    if (sets !== item.target_sets || reps !== item.target_reps) {
      onChangeTargets(sets, reps);
    }
  }

  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.name}>{item.exercise.name}</Text>
        <View style={styles.targets}>
          <TextInput
            style={styles.input}
            value={setsText}
            onChangeText={setSetsText}
            onEndEditing={commit}
            keyboardType="number-pad"
            maxLength={2}
            selectTextOnFocus
            accessibilityLabel={`${item.exercise.name} target sets`}
          />
          <Text style={styles.label}>sets ×</Text>
          <TextInput
            style={styles.input}
            value={repsText}
            onChangeText={setRepsText}
            onEndEditing={commit}
            keyboardType="number-pad"
            maxLength={2}
            selectTextOnFocus
            accessibilityLabel={`${item.exercise.name} target reps`}
          />
          <Text style={styles.label}>reps</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <View style={styles.moveButtons}>
          <SmallButton
            label="▲"
            accessibilityLabel={`Move ${item.exercise.name} up`}
            onPress={() => onMove(-1)}
            disabled={disabled || isFirst}
          />
          <SmallButton
            label="▼"
            accessibilityLabel={`Move ${item.exercise.name} down`}
            onPress={() => onMove(1)}
            disabled={disabled || isLast}
          />
        </View>
        <SmallButton
          label="Remove"
          accessibilityLabel={`Remove ${item.exercise.name}`}
          onPress={onRemove}
          disabled={disabled}
          color="#d93025"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    marginBottom: 8,
  },
  targets: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    width: 44,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingVertical: 4,
    textAlign: 'center',
    fontSize: 16,
  },
  label: {
    marginHorizontal: 6,
    color: '#555',
  },
  actions: {
    alignItems: 'flex-end',
  },
  moveButtons: {
    flexDirection: 'row',
  },
});
