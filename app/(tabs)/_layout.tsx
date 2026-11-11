import { Tabs } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';

import { supabase } from '../../src/lib/supabase';

function SignOutButton() {
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Sign out failed', error.message);
  }

  return (
    <Pressable accessibilityRole="button" onPress={signOut} style={styles.signOut}>
      <Text style={styles.signOutText}>Sign Out</Text>
    </Pressable>
  );
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerRight: () => <SignOutButton /> }}>
      <Tabs.Screen name="index" options={{ title: 'Splits' }} />
      <Tabs.Screen name="log" options={{ title: 'Log Workout' }} />
      <Tabs.Screen name="history" options={{ title: 'History' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  signOut: {
    paddingHorizontal: 16,
  },
  signOutText: {
    color: '#1a73e8',
    fontSize: 16,
  },
});
