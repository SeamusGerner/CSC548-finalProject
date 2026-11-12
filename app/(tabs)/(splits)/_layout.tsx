import { Stack } from 'expo-router';

import SignOutButton from '../../../src/components/SignOutButton';

export default function SplitsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: 'Splits', headerRight: () => <SignOutButton /> }}
      />
      <Stack.Screen name="split/[splitId]" options={{ title: 'Split' }} />
      <Stack.Screen name="day/[dayId]" options={{ title: 'Day' }} />
    </Stack>
  );
}
