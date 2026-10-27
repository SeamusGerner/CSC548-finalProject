import { StyleSheet, Text, View } from 'react-native';

export default function WorkoutLoggerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workout Logger</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
});
