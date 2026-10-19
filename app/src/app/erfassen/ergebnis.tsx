import { router } from 'expo-router';
import { Check, FileText, UserRound, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import type { Task } from '@/demo/schemas';
import { useDemo } from '@/demo/store';
import { useCapture } from '@/features/capture/CaptureContext';
import { formatLongDate, formatShortDate, isoInDays, parseDay } from '@/lib/dates';
import { firstName } from '@/lib/greeting';
import {
  AiNotice,
  Avatar,
  BottomSheet,
  Button,
  Card,
  CheckRow,
  Chip,
  DeadlineBadge,
  haptics,
  Icon,
  IconButton,
  ListGroup,
  ListItem,
  Screen,
  Text,
  useTheme,
  useToast,
} from '@/ui';

type Choice = { selected: boolean; assigneeId: string | null };

function CardLabel({ children, tone = 'subtle' }: { children: string; tone?: 'subtle' | 'onPrimarySoft' }) {
  return (
    <Text variant="eyebrow" tone={tone}>
      {children}
    </Text>
  );
}

function daysBefore(isoDay: string, days: number): string {
  return isoInDays(-days, parseDay(isoDay));
}

export default function ResultScreen() {
  const { colors } = useTheme();
  const toast = useToast();
  const { careCase, currentUser, addDocument } = useDemo();
  const { letter, document, analysis } = useCapture();
  const deadline = analysis.deadline;

  const [choices, setChoices] = useState<Record<string, Choice>>(() =>
    Object.fromEntries(analysis.suggestedTasks.map((t) => [t.id, { selected: true, assigneeId: null }])),
  );
  const [keepDeadline, setKeepDeadline] = useState(true);
  const [sheetFor, setSheetFor] = useState<string | null>(null);

  const update = (id: string, patch: Partial<Choice>) =>
    setChoices((all) => ({ ...all, [id]: { ...all[id]!, ...patch } }));

  const assigneeLabel = (id: string | null) => {
    if (!id) return 'Offen';
    if (id === currentUser.id) return 'Du';
    const m = careCase.members.find((x) => x.id === id);
    return m ? firstName(m.displayName) : 'Offen';
  };

  const selectedCount = analysis.suggestedTasks.filter((t) => choices[t.id]?.selected).length;
  const confirmLabel =
    selectedCount === 0
      ? 'Nur den Brief speichern'
      : selectedCount === 1
        ? '1 Aufgabe übernehmen'
        : `${selectedCount} Aufgaben übernehmen`;

  const confirm = () => {
    const tasks: Task[] = analysis.suggestedTasks
      .filter((t) => choices[t.id]?.selected)
      .map((t) => ({
        id: `${document.id}-${t.id}`,
        caseId: document.caseId,
        documentId: document.id,
        title: t.title,
        dueDate: deadline && keepDeadline ? daysBefore(deadline.dueDate, t.daysBeforeDeadline) : null,
        assigneeId: choices[t.id]!.assigneeId,
        status: 'open',
        completedAt: null,
      }));
    addDocument(document, tasks, { letter, highlight: deadline?.sourceQuote });
    haptics.success();
    router.dismissTo('/');
    toast({
      message:
        tasks.length === 0
          ? 'Der Brief ist gespeichert.'
          : `Gespeichert. ${tasks.length === 1 ? '1 Aufgabe steht' : `${tasks.length} Aufgaben stehen`} jetzt an.`,
    });
  };

  const meta = [
    `Brief vom ${formatShortDate(analysis.letterDate)}`,
    analysis.pageCount === 1 ? '1 Seite' : `${analysis.pageCount} Seiten`,
    analysis.referenceNumber ? `Az. ${analysis.referenceNumber}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      <Screen
        eyebrow={document.sender}
        title={document.title}
        headerAccessory={
          <IconButton
            icon={X}
            accessibilityLabel="Schließen, ohne zu speichern"
            onPress={() => router.dismissTo('/')}
          />
        }
        footer={<Button label={confirmLabel} icon={Check} size="lg" align="stretch" onPress={confirm} />}
      >
        <View className="-mt-3 gap-1">
          <Text variant="callout" tone="muted">
            {meta}
          </Text>
          <Button
            label="Original ansehen"
            icon={FileText}
            variant="ghost"
            size="sm"
            className="-ml-3.5"
            onPress={() => router.push('/erfassen/original')}
          />
        </View>

        <Card tone="primary">
          <View className="gap-3">
            <CardLabel tone="onPrimarySoft">Worum geht es?</CardLabel>
            <Text variant="body" tone="onPrimarySoft">
              {analysis.summaryPlain}
            </Text>
            <AiNotice />
          </View>
        </Card>

        <Card>
          <View className="gap-5">
            <View className="gap-1">
              <CardLabel>Was ist zu tun?</CardLabel>
              <Text variant="callout" tone="muted">
                Mein Vorschlag. Hake ab, was ihr übernehmen wollt.
              </Text>
            </View>
            {analysis.suggestedTasks.map((t) => {
              const choice = choices[t.id]!;
              return (
                <CheckRow
                  key={t.id}
                  label={t.title}
                  checked={choice.selected}
                  onToggle={() => update(t.id, { selected: !choice.selected })}
                >
                  {choice.selected ? (
                    <Chip
                      label={`Für: ${assigneeLabel(choice.assigneeId)}`}
                      icon={UserRound}
                      onPress={() => setSheetFor(t.id)}
                    />
                  ) : null}
                </CheckRow>
              );
            })}
          </View>
        </Card>

        {deadline ? (
          <Card>
            <View className="gap-4">
              <CardLabel>Bis wann?</CardLabel>
              <View className="gap-2">
                <Text variant="title3">{formatLongDate(deadline.dueDate)}</Text>
                <DeadlineBadge due={deadline.dueDate} />
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Zitat aus dem Brief: ${deadline.sourceQuote}`}
                accessibilityHint="Zeigt die Stelle im Original"
                onPress={() => router.push('/erfassen/original')}
              >
                {({ pressed }) => (
                  <View
                    className={`flex-row gap-3 rounded-md bg-surface-muted p-4 ${pressed ? 'opacity-80' : ''}`}
                  >
                    <View className="w-1 rounded-full" style={{ backgroundColor: colors.accent }} />
                    <View className="flex-1 gap-2">
                      <Text variant="callout">„{deadline.sourceQuote}“</Text>
                      <Text variant="caption" tone="subtle">
                        Aus dem Brief, Seite {deadline.page} · Im Original zeigen
                      </Text>
                    </View>
                  </View>
                )}
              </Pressable>
              <CheckRow
                label="Frist übernehmen"
                description="Wir erinnern euch 7 Tage und 2 Tage vorher und am Tag selbst."
                checked={keepDeadline}
                onToggle={() => setKeepDeadline((k) => !k)}
              />
            </View>
          </Card>
        ) : null}

        <AiNotice variant="block" />
      </Screen>

      <BottomSheet
        visible={sheetFor !== null}
        onClose={() => setSheetFor(null)}
        title="Wer kümmert sich?"
        description="Ihr könnt das später jederzeit ändern."
      >
        <ListGroup>
          {[...careCase.members.map((m) => m.id), null].map((id) => {
            const member = careCase.members.find((m) => m.id === id);
            const selected = sheetFor !== null && choices[sheetFor]?.assigneeId === id;
            return (
              <ListItem
                key={id ?? 'open'}
                title={id ? assigneeLabel(id) : 'Später entscheiden'}
                leading={
                  member ? (
                    <Avatar name={member.displayName} size="sm" />
                  ) : (
                    <View className="h-7 w-7 items-center justify-center rounded-full bg-surface-muted">
                      <Icon icon={UserRound} size={16} color="fgMuted" />
                    </View>
                  )
                }
                trailing={
                  selected ? <Icon icon={Check} size={20} color="primary" strokeWidth={2.5} /> : <View />
                }
                onPress={() => {
                  if (sheetFor) update(sheetFor, { assigneeId: id });
                  haptics.select();
                  setSheetFor(null);
                }}
              />
            );
          })}
        </ListGroup>
      </BottomSheet>
    </>
  );
}
