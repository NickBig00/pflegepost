import { HandHelping, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import type { ColorToken } from '../tokens';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { Card } from './Card';
import { DeadlineBadge, deadlineAccessibilityLabel } from './DeadlineBadge';
import { Icon } from './Icon';
import { IconTile } from './ListItem';
import { Text } from './Text';

export type TaskTone = 'primary' | 'accent' | 'ochre' | 'info' | 'muted';

const iconColor: Record<TaskTone, ColorToken> = {
  primary: 'onPrimarySoft',
  accent: 'onAccentSoft',
  ochre: 'onOchreSoft',
  info: 'onInfoSoft',
  muted: 'fgMuted',
};

export type TaskCardProps = {
  title: string;
  /** Context line, e.g. "AOK Pflegekasse · Antrag auf Höherstufung". */
  meta: string;
  icon: LucideIcon;
  tone?: TaskTone;
  due: string | null;
  /** Who took the task. `label` is "Du" for the current user. */
  assignee?: { name: string; label: string };
  onClaim?: () => void;
  onPress?: () => void;
};

/** A task as a calm card: what, from where, until when, and who. */
export function TaskCard({
  title,
  meta,
  icon,
  tone = 'primary',
  due,
  assignee,
  onClaim,
  onPress,
}: TaskCardProps) {
  const a11y = [
    title,
    meta,
    due ? deadlineAccessibilityLabel(due) : null,
    assignee ? `Übernommen von ${assignee.label}` : 'Noch nicht übernommen',
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <Card onPress={onPress} accessibilityLabel={a11y}>
      <View className="gap-4">
        <View className="flex-row gap-3.5">
          <IconTile tone={tone}>
            <Icon icon={icon} size={20} color={iconColor[tone]} />
          </IconTile>
          <View className="flex-1 gap-1">
            <Text variant="bodyStrong">{title}</Text>
            <Text variant="callout" tone="muted">
              {meta}
            </Text>
          </View>
        </View>
        <View className="min-h-[36px] flex-row flex-wrap items-center justify-between gap-2">
          {due ? <DeadlineBadge due={due} /> : <View />}
          {assignee ? (
            <View className="flex-row items-center gap-2">
              <Avatar name={assignee.name} size="sm" />
              <Text variant="calloutStrong" tone="muted">
                {assignee.label}
              </Text>
            </View>
          ) : onClaim ? (
            <Button label="Übernehmen" icon={HandHelping} size="sm" variant="secondary" onPress={onClaim} />
          ) : null}
        </View>
      </View>
    </Card>
  );
}
