import { Pressable, StyleSheet, Text } from 'react-native';

interface SmallButtonProps {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
  color?: string;
}

/** Compact inline button for list rows (reorder, remove). */
export default function SmallButton({
  label,
  onPress,
  accessibilityLabel,
  disabled = false,
  color = '#1a73e8',
}: SmallButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      style={({ pressed }) => [styles.button, (pressed || disabled) && styles.dimmed]}
    >
      <Text style={[styles.text, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  dimmed: {
    opacity: 0.35,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
