import { View } from 'react-native';

/** "Schritt 2 von 3" as calm dots. */
export function StepDots({ count, active }: { count: number; active: number }) {
  return (
    <View
      className="flex-row items-center gap-2"
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Schritt ${active + 1} von ${count}`}
    >
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          className={`h-2 rounded-full ${i === active ? 'w-6 bg-primary' : 'w-2 bg-border-strong'}`}
        />
      ))}
    </View>
  );
}
