import { Alert, Pressable, StyleSheet, Text } from 'react-native';

import { supabase } from '../lib/supabase';

export default function SignOutButton() {
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Sign out failed', error.message);
  }

  return (
    <Pressable accessibilityRole="button" onPress={signOut} style={styles.button}>
      <Text style={styles.text}>Sign Out</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
  },
  text: {
    color: '#1a73e8',
    fontSize: 16,
  },
});
