import { Check, CircleCheck, HandHelping, type LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { haptics } from '../haptics';
import { useTheme } from '../theme';
import { motion } from '../tokens';

import type { ColorToken } from '../tokens';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { Card } from './Card';
import { Chip } from './Chip';
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
  /** Shows a round check to mark the task as done. */
  onToggleDone?: () => void;
  done?: boolean;
  /** e.g. "Erledigt am 17. Okt." */
  doneLabel?: string;
};

function DoneCheck({ done, title, onToggle }: { done: boolean; title: string; onToggle: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={done ? `${title}: wieder öffnen` : `${title}: als erledigt markieren`}
      hitSlop={10}
      onPress={() => {
        if (done) haptics.select();
        else haptics.success();
        onToggle();
      }}
      className="-mr-1 -mt-1 h-11 w-11 items-center justify-center"
    >
      {done ? (
        <Animated.View
          entering={ZoomIn.duration(motion.fast)}
          className="h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.primary }}
        >
          <Icon icon={Check} size={18} color="onPrimary" strokeWidth={2.75} />
        </Animated.View>
      ) : (
        <View className="h-8 w-8 rounded-full border-2 border-border-strong" />
      )}
    </Pressable>
  );
}

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
  onToggleDone,
  done = false,
  doneLabel,
}: TaskCardProps) {
  const a11y = [
    title,
    meta,
    done ? (doneLabel ?? 'Erledigt') : due ? deadlineAccessibilityLabel(due) : null,
    assignee ? `Übernommen von ${assignee.label}` : 'Noch nicht übernommen',
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <Card>
      <View className="gap-4">
        <View className="flex-row gap-3.5">
          {/* Only the content area opens details, so the check and claim buttons are never nested in it. */}
          <Pressable
            accessibilityRole={onPress ? 'button' : undefined}
            accessibilityLabel={a11y}
            accessibilityHint={onPress ? 'Öffnet den zugehörigen Brief' : undefined}
            disabled={!onPress}
            onPress={onPress}
            className="flex-1 flex-row gap-3.5"
          >
            {({ pressed }) => (
              <>
                <IconTile tone={tone}>
                  <Icon icon={icon} size={20} color={iconColor[tone]} />
                </IconTile>
                <View className={`flex-1 gap-1 ${pressed ? 'opacity-70' : ''}`}>
                  <Text variant="bodyStrong" tone={done ? 'muted' : 'default'}>
                    {title}
                  </Text>
                  <Text variant="callout" tone="muted">
                    {meta}
                  </Text>
                </View>
              </>
            )}
          </Pressable>
          {onToggleDone ? <DoneCheck done={done} title={title} onToggle={onToggleDone} /> : null}
        </View>
        <View className="min-h-[36px] flex-row flex-wrap items-center justify-between gap-2">
          {done ? (
            <Chip label={doneLabel ?? 'Erledigt'} icon={CircleCheck} tone="success" />
          ) : due ? (
            <DeadlineBadge due={due} />
          ) : (
            <View />
          )}
          {assignee ? (
            <View className="flex-row items-center gap-2">
              <Avatar name={assignee.name} size="sm" />
              <Text variant="calloutStrong" tone="muted">
                {assignee.label}
              </Text>
            </View>
          ) : onClaim && !done ? (
            <Button label="Übernehmen" icon={HandHelping} size="sm" variant="secondary" onPress={onClaim} />
          ) : null}
        </View>
      </View>
    </Card>
  );
}
