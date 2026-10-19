import { View } from 'react-native';

import type { Letter } from '@/demo/incoming';
import { Text, useTheme } from '@/ui';

/** The full letter as it would look scanned; optionally highlights a quote. */
export function LetterPaper({ letter, highlight }: { letter: Letter; highlight?: string }) {
  const { colors, shadows } = useTheme();

  const paragraph = (text: string, i: number) => {
    const at = highlight ? text.indexOf(highlight) : -1;
    if (!highlight || at < 0) {
      return (
        <Text key={i} variant="callout" tone="paperInk">
          {text}
        </Text>
      );
    }
    return (
      <Text key={i} variant="callout" tone="paperInk">
        {text.slice(0, at)}
        <Text
          variant="calloutStrong"
          tone="paperInk"
          style={{ backgroundColor: colors.paperHighlight }}
          accessibilityLabel={`Hervorgehoben: ${highlight}`}
        >
          {highlight}
        </Text>
        {text.slice(at + highlight.length)}
      </Text>
    );
  };

  return (
    <View
      className="gap-5 rounded-md p-6"
      style={{ backgroundColor: colors.paper, boxShadow: shadows.raised }}
    >
      <View className="flex-row justify-between gap-4">
        <View className="flex-1">
          <Text variant="calloutStrong" tone="paperInk">
            {letter.sender.name}
          </Text>
          {letter.sender.lines.map((l) => (
            <Text key={l} variant="caption" tone="paperInkMuted">
              {l}
            </Text>
          ))}
        </View>
        <View className="h-7 w-14 rounded-sm" style={{ backgroundColor: colors.paperAccent }} />
      </View>
      <View>
        {letter.recipient.map((l) => (
          <Text key={l} variant="callout" tone="paperInk">
            {l}
          </Text>
        ))}
      </View>
      <Text variant="caption" tone="paperInkMuted" className="text-right">
        {letter.place}
      </Text>
      <Text variant="calloutStrong" tone="paperInk">
        {letter.subject}
      </Text>
      <Text variant="callout" tone="paperInk">
        {letter.salutation}
      </Text>
      {letter.paragraphs.map(paragraph)}
      <View>
        {letter.closing.map((l) => (
          <Text key={l} variant="callout" tone="paperInk">
            {l}
          </Text>
        ))}
      </View>
    </View>
  );
}
