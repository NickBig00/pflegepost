import { router } from 'expo-router';
import { HeartHandshake, Mail, MessageCircleHeart, Send, UserPlus } from 'lucide-react-native';
import { useState } from 'react';
import { Share, View } from 'react-native';

import type { Member } from '@/demo/schemas';
import { useDemo } from '@/demo/store';
import { familyLoad, loadSuggestion } from '@/lib/family';
import { firstName } from '@/lib/greeting';
import {
  Avatar,
  BottomSheet,
  Button,
  Card,
  CheckRow,
  Icon,
  IconTile,
  ListGroup,
  ListItem,
  Screen,
  SectionHeader,
  ShareBar,
  Text,
  useTheme,
  type ColorToken,
} from '@/ui';

const roleLabel: Record<Member['role'], string> = {
  owner: 'Hauptverantwortlich',
  member: 'Mitglied',
  viewer: 'Nur lesen',
};

// Soft, distinct colors per person; order follows the member list.
const shareColors: ColorToken[] = ['primary', 'ochre', 'info', 'accent'];

export default function FamilyScreen() {
  const { careCase, currentUser, tasks } = useDemo();
  const { colors } = useTheme();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteRole, setInviteRole] = useState<'member' | 'viewer'>('member');

  const loads = familyLoad(careCase.members, tasks);
  const suggestion = loadSuggestion(loads, currentUser.id);
  const helper = careCase.members.find((m) => m.id === suggestion.askMemberId);
  const label = (m: Member) => (m.id === currentUser.id ? 'Du' : firstName(m.displayName));

  const askForHelp = async () => {
    if (!helper) return;
    await Share.share({
      message: `Hallo ${firstName(helper.displayName)}, magst du diese Woche eine Aufgabe für ${careCase.displayName} übernehmen? In Pflegepost siehst du, was gerade ansteht. Danke dir!`,
    });
  };

  const shareInvite = async () => {
    setInviteOpen(false);
    await Share.share({
      message: `Ich lade dich zu „${careCase.displayName}“ in Pflegepost ein, damit wir uns die Post und die Aufgaben teilen können: pflegepost://einladung/demo`,
    });
  };

  return (
    <>
      <Screen eyebrow={`Für ${careCase.displayName}`} title="Familie">
        <Card>
          <View className="gap-4">
            <Text variant="eyebrow" tone="subtle">
              Diese Woche
            </Text>
            <ShareBar
              accessibilityLabel={`Verteilung der Aufgaben: ${loads
                .map((l) => `${label(l.member)} ${l.share > 0.5 ? 'trägt viel' : 'hilft mit'}`)
                .join(', ')}`}
              segments={loads.map((l, i) => ({
                key: l.member.id,
                share: l.share,
                color: shareColors[i % shareColors.length]!,
              }))}
            />
            <View className="flex-row flex-wrap gap-4">
              {loads.map((l, i) => (
                <View key={l.member.id} className="flex-row items-center gap-2">
                  <View
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: colors[shareColors[i % shareColors.length]!] }}
                  />
                  <Text variant="callout" tone="muted">
                    {label(l.member)}
                  </Text>
                </View>
              ))}
            </View>
            <Text variant="body">{suggestion.text}</Text>
            {helper ? (
              <Button
                label={`${firstName(helper.displayName)} um Hilfe bitten`}
                icon={MessageCircleHeart}
                variant="secondary"
                onPress={askForHelp}
                accessibilityHint="Öffnet das Teilen-Menü mit einer freundlichen Nachricht"
              />
            ) : null}
          </View>
        </Card>

        <View className="gap-3">
          <SectionHeader title="Wer kümmert sich um was" />
          <ListGroup>
            {loads.map((l) => (
              <ListItem
                key={l.member.id}
                title={`${label(l.member)} · ${roleLabel[l.member.role]}`}
                subtitle={
                  l.openTitles.length === 0
                    ? 'Gerade nichts übernommen'
                    : l.openTitles.length === 1
                      ? l.openTitles[0]
                      : `${l.openTitles[0]} und ${l.openTitles.length - 1} weitere`
                }
                leading={<Avatar name={l.member.displayName} />}
              />
            ))}
            <ListItem
              title={careCase.fullName}
              subtitle={`Für ${careCase.displayName} kümmert ihr euch gemeinsam`}
              leading={
                <IconTile tone="accent">
                  <Icon icon={HeartHandshake} size={20} color="onAccentSoft" />
                </IconTile>
              }
            />
          </ListGroup>
          <Button
            label="Jemanden einladen"
            icon={UserPlus}
            variant="outline"
            align="stretch"
            onPress={() => setInviteOpen(true)}
          />
        </View>

        <View className="gap-3">
          <SectionHeader title="Rückblick" />
          <ListGroup>
            <ListItem
              title="Euer Wochenrückblick"
              subtitle="Ein kurzer Brief über die letzten sieben Tage"
              leading={
                <IconTile tone="info">
                  <Icon icon={Mail} size={20} color="onInfoSoft" />
                </IconTile>
              }
              onPress={() => router.push('/rueckblick')}
            />
          </ListGroup>
        </View>
      </Screen>

      <BottomSheet
        visible={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Jemanden einladen"
        description="Teile den Link per WhatsApp, SMS oder E-Mail. Er ist 7 Tage gültig."
      >
        <View className="gap-4">
          <CheckRow
            label="Mitglied"
            description="Kann Briefe erfassen und Aufgaben übernehmen"
            checked={inviteRole === 'member'}
            onToggle={() => setInviteRole('member')}
          />
          <CheckRow
            label="Nur lesen"
            description="Sieht alles, ändert nichts – gut für Pflegeberatung"
            checked={inviteRole === 'viewer'}
            onToggle={() => setInviteRole('viewer')}
          />
        </View>
        <Button label="Link teilen" icon={Send} size="lg" align="stretch" onPress={shareInvite} />
      </BottomSheet>
    </>
  );
}
