import { Sparkles } from 'lucide-react-native';
import { View } from 'react-native';

import { Icon } from './Icon';
import { Text } from './Text';

export type AiNoticeProps = {
  /** "inline" for a one-line label under AI content, "block" for the full hint. */
  variant?: 'inline' | 'block';
  text?: string;
};

const defaultInline = 'Von der KI erklärt · bitte mit dem Original prüfen';
const defaultBlock =
  'Diese Erklärung hat die KI geschrieben. Sie ersetzt keine Rechts- oder Pflegeberatung. Im Zweifel hilft dir ein Pflegestützpunkt in deiner Nähe.';

/** Transparent labeling of AI-generated content (EU AI Act, no legal advice). */
export function AiNotice({ variant = 'inline', text }: AiNoticeProps) {
  if (variant === 'inline') {
    return (
      <View className="flex-row items-center gap-1.5" accessible accessibilityRole="text">
        <Icon icon={Sparkles} size={14} color="info" strokeWidth={2} />
        <Text variant="caption" tone="info" className="flex-1">
          {text ?? defaultInline}
        </Text>
      </View>
    );
  }
  return (
    <View className="flex-row gap-3 rounded-lg bg-info-soft p-4" accessible accessibilityRole="text">
      <Icon icon={Sparkles} size={18} color="onInfoSoft" strokeWidth={2} />
      <Text variant="callout" tone="onInfoSoft" className="flex-1">
        {text ?? defaultBlock}
      </Text>
    </View>
  );
}
