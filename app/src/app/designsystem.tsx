import {
  Camera,
  FileText,
  Inbox,
  Mic,
  Plus,
  Send,
  Stethoscope,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react-native';
import { useEffect, useState, type ReactNode } from 'react';
import { View } from 'react-native';

import {
  AiNotice,
  Avatar,
  AvatarGroup,
  BottomSheet,
  Button,
  Card,
  Chip,
  DeadlineBadge,
  EmptyState,
  Icon,
  IconTile,
  ListGroup,
  ListItem,
  ProgressSteps,
  Screen,
  SectionHeader,
  SegmentedControl,
  Text,
  TextField,
  useTheme,
  useToast,
  type ColorToken,
  type Step,
} from '@/ui';
import { isoInDays } from '@/lib/dates';

// Developer showcase of the design system. Not part of the user-facing navigation.

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-4 pt-4">
      <Text variant="eyebrow" tone="subtle">
        {title}
      </Text>
      {children}
    </View>
  );
}

const swatches: { token: ColorToken; label: string }[] = [
  { token: 'canvas', label: 'Canvas' },
  { token: 'surface', label: 'Fläche' },
  { token: 'primary', label: 'Salbei' },
  { token: 'primarySoft', label: 'Salbei sanft' },
  { token: 'accent', label: 'Terrakotta' },
  { token: 'accentSoft', label: 'Terrakotta sanft' },
  { token: 'ochre', label: 'Ocker' },
  { token: 'info', label: 'Taubenblau' },
];

function Swatch({ token, label }: { token: ColorToken; label: string }) {
  const { colors } = useTheme();
  return (
    <View className="w-[23%] min-w-[72px] grow gap-1.5">
      <View className="h-14 rounded-md border border-border" style={{ backgroundColor: colors[token] }} />
      <Text variant="caption" tone="muted" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const analysisLabels = ['Ich lese den Brief…', 'Ich suche nach Fristen…', 'Ich formuliere eine Erklärung…'];

function useDemoSteps(): Step[] {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % (analysisLabels.length + 1)), 1600);
    return () => clearInterval(t);
  }, []);
  return analysisLabels.map((label, i) => ({
    label,
    state: i < active ? 'done' : i === active ? 'active' : 'pending',
  }));
}

function TaskCard({
  icon,
  tone,
  title,
  meta,
  due,
  people,
}: {
  icon: LucideIcon;
  tone: 'primary' | 'accent' | 'ochre' | 'info';
  title: string;
  meta: string;
  due: string;
  people: string[];
}) {
  const iconColor: Record<typeof tone, ColorToken> = {
    primary: 'onPrimarySoft',
    accent: 'onAccentSoft',
    ochre: 'onOchreSoft',
    info: 'onInfoSoft',
  };
  return (
    <Card onPress={() => {}} accessibilityLabel={`${title}, ${meta}`}>
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
        <View className="flex-row items-center justify-between">
          <DeadlineBadge due={due} />
          <AvatarGroup names={people} />
        </View>
      </View>
    </Card>
  );
}

export default function DesignSystemScreen() {
  const { scheme, setSchemeOverride } = useTheme();
  const toast = useToast();
  const steps = useDemoSteps();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'mine' | 'open'>('all');
  const [email, setEmail] = useState('');

  return (
    <Screen eyebrow="Pflegepost" title="Designsystem">
      <SegmentedControl
        accessibilityLabel="Darstellung"
        value={scheme}
        onChange={(v) => setSchemeOverride(v)}
        options={[
          { value: 'light', label: 'Hell' },
          { value: 'dark', label: 'Dunkel' },
        ]}
      />

      <Section title="Farben">
        <View className="flex-row flex-wrap gap-3">
          {swatches.map((s) => (
            <Swatch key={s.token} {...s} />
          ))}
        </View>
      </Section>

      <Section title="Typografie">
        <View className="gap-2">
          <Text variant="display">Guten Morgen, Anna</Text>
          <Text variant="title1">Das steht an</Text>
          <Text variant="title2">Brief der Pflegekasse</Text>
          <Text variant="title3">Was ist zu tun?</Text>
          <Text variant="body">
            Die Pflegekasse möchte wissen, ob sich der Pflegebedarf deiner Mutter verändert hat.
          </Text>
          <Text variant="callout" tone="muted">
            Eingegangen am Dienstag, 14. Oktober
          </Text>
          <Text variant="caption" tone="subtle">
            Aktenzeichen 4711-0815
          </Text>
        </View>
      </Section>

      <Section title="Buttons">
        <View className="gap-3">
          <Button
            label="Brief erfassen"
            icon={Camera}
            size="lg"
            align="stretch"
            accessibilityHint="Öffnet die Kamera"
          />
          <Button label="Sprachnotiz aufnehmen" icon={Mic} variant="secondary" size="lg" align="stretch" />
          <View className="flex-row flex-wrap gap-3">
            <Button label="Übernehmen" icon={Plus} />
            <Button label="Später" variant="outline" />
            <Button label="Original ansehen" variant="ghost" icon={FileText} />
          </View>
          <View className="flex-row flex-wrap gap-3">
            <Button label="Wird gespeichert" loading />
            <Button label="Fall verlassen" variant="danger" />
            <Button label="Einladen" icon={UserPlus} size="sm" variant="secondary" />
          </View>
        </View>
      </Section>

      <Section title="Karten">
        <SectionHeader title="Das steht an" action={{ label: 'Alle', onPress: () => {} }} />
        <TaskCard
          icon={Send}
          tone="accent"
          title="Unterlagen an die Pflegekasse schicken"
          meta="AOK · Antrag auf Höherstufung"
          due={isoInDays(2)}
          people={['Anna Weber']}
        />
        <TaskCard
          icon={Stethoscope}
          tone="ochre"
          title="Termin Medizinischer Dienst begleiten"
          meta="Hausbesuch bei Mama · 10:00 Uhr"
          due={isoInDays(6)}
          people={['Anna Weber', 'Thomas Weber']}
        />
        <Card tone="primary">
          <View className="gap-3">
            <Text variant="eyebrow" tone="onPrimarySoft">
              Worum geht es?
            </Text>
            <Text variant="body" tone="onPrimarySoft">
              Die AOK hat deinen Antrag erhalten. Sie schickt bald jemanden vom Medizinischen Dienst, der sich
              Mamas Alltag ansieht.
            </Text>
            <AiNotice />
          </View>
        </Card>
      </Section>

      <Section title="Liste">
        <ListGroup>
          <ListItem
            title="Bescheid Pflegegrad 3"
            subtitle="AOK · 2. September"
            leading={
              <IconTile tone="muted">
                <Icon icon={FileText} size={20} color="fgMuted" />
              </IconTile>
            }
            onPress={() => {}}
          />
          <ListItem
            title="Familie"
            subtitle="Anna, Thomas und Mama"
            leading={
              <IconTile>
                <Icon icon={Users} size={20} color="onPrimarySoft" />
              </IconTile>
            }
            onPress={() => {}}
          />
          <ListItem title="Erinnerungen" subtitle="7 Tage, 2 Tage und am Tag selbst" onPress={() => {}} />
        </ListGroup>
      </Section>

      <Section title="Eingabefelder">
        <TextField
          label="E-Mail-Adresse"
          placeholder="name@beispiel.de"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          helper="Wir schicken dir einen Anmelde-Code."
        />
        <TextField
          label="Für wen kümmerst du dich?"
          value=""
          placeholder="z. B. Mama"
          error="Bitte gib einen Namen ein, damit deine Familie den Fall erkennt."
        />
      </Section>

      <Section title="Chips">
        <View className="flex-row flex-wrap gap-2">
          <Chip label="Alle" selected={filter === 'all'} onPress={() => setFilter('all')} />
          <Chip label="Meine" selected={filter === 'mine'} onPress={() => setFilter('mine')} />
          <Chip label="Offen" selected={filter === 'open'} onPress={() => setFilter('open')} />
        </View>
        <View className="flex-row flex-wrap gap-2">
          <Chip label="Pflegekasse" tone="primary" />
          <Chip label="Arzt" tone="info" />
          <Chip label="Rechnung" tone="ochre" />
          <Chip label="Erledigt" tone="success" />
          <Chip label="Entwurf" />
        </View>
      </Section>

      <Section title="Fristen">
        <View className="flex-row flex-wrap gap-2">
          <DeadlineBadge due={isoInDays(-2)} />
          <DeadlineBadge due={isoInDays(0)} />
          <DeadlineBadge due={isoInDays(1)} />
          <DeadlineBadge due={isoInDays(5)} />
          <DeadlineBadge due={isoInDays(24)} />
        </View>
      </Section>

      <Section title="Avatare">
        <View className="flex-row items-center gap-4">
          <Avatar name="Anna Weber" size="lg" />
          <Avatar name="Thomas Weber" />
          <Avatar name="Ingrid Weber" size="sm" />
          <AvatarGroup
            names={['Anna Weber', 'Thomas Weber', 'Lena Krause', 'Jonas Weber', 'Mia Weber']}
            size="md"
            max={3}
            on="canvas"
          />
        </View>
      </Section>

      <Section title="KI-Hinweis">
        <AiNotice variant="block" />
      </Section>

      <Section title="Fortschritt">
        <Card>
          <ProgressSteps steps={steps} />
        </Card>
      </Section>

      <Section title="Leerzustand">
        <Card padding="none">
          <EmptyState
            icon={Inbox}
            title="Alles erledigt"
            message="Gerade steht nichts an. Wenn ein neuer Brief kommt, fotografiere ihn einfach."
            action={{ label: 'Brief erfassen', icon: Camera, onPress: () => {} }}
          />
        </Card>
      </Section>

      <Section title="Overlays">
        <View className="flex-row flex-wrap gap-3">
          <Button label="Bottom Sheet" variant="outline" onPress={() => setSheetOpen(true)} />
          <Button
            label="Toast"
            variant="outline"
            onPress={() =>
              toast({
                message: 'Du hast die Aufgabe übernommen.',
                action: { label: 'Rückgängig', onPress: () => {} },
              })
            }
          />
        </View>
      </Section>

      <BottomSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Thomas einladen"
        description="Teile den Link per WhatsApp, SMS oder E-Mail. Er ist 7 Tage gültig."
      >
        <ListGroup>
          <ListItem title="Mitglied" subtitle="Kann Aufgaben übernehmen und Briefe erfassen" />
          <ListItem title="Nur lesen" subtitle="Sieht alles, ändert nichts" />
        </ListGroup>
        <Button
          label="Link teilen"
          icon={Send}
          size="lg"
          align="stretch"
          onPress={() => setSheetOpen(false)}
        />
      </BottomSheet>
    </Screen>
  );
}
