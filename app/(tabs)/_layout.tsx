import { Tabs } from 'expo-router';

import SignOutButton from '../../src/components/SignOutButton';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerRight: () => <SignOutButton /> }}>
      {/* The Splits tab has its own stack (and header), so hide the tab header. */}
      <Tabs.Screen name="(splits)" options={{ title: 'Splits', headerShown: false }} />
      <Tabs.Screen name="log" options={{ title: 'Log Workout' }} />
      <Tabs.Screen name="history" options={{ title: 'History' }} />
    </Tabs>
  );
}
