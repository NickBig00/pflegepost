import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { HeartHandshake, Mail, Send, UserPlus, Users, WifiOff } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Share, View } from 'react-native';

import { useAuth } from '@/features/auth/AuthProvider';
import { inviteMessage, inviteValidUntil, roleLabel } from '@/lib/invite';
import { errorMessage, getSupabase, type CareCaseRow, type InviteRole, type Role } from '@/lib/supabase';
import {
  changeMemberRole,
  createInvite,
  leaveCase,
  removeMember,
  revokeInvite,
  type FamilyMember,
} from '@/lib/supabase/family';
import {
  Avatar,
  BottomSheet,
  Button,
  Card,
  CheckRow,
  EmptyState,
  Icon,
  IconTile,
  ListGroup,
  ListItem,
  Screen,
  SectionHeader,
  Text,
  useTheme,
  useToast,
} from '@/ui';

import { useFamily } from './useFamily';

const inviteRoles: { role: InviteRole; description: string }[] = [
  { role: 'member', description: 'Kann Briefe ansehen und Aufgaben übernehmen' },
  { role: 'viewer', description: 'Sieht alles, ändert nichts – gut für Pflegeberatung' },
];

const memberRoles: { role: Role; description: string }[] = [
  { role: 'owner', description: 'Kann zusätzlich Menschen einladen und Rollen ändern' },
  { role: 'member', description: 'Kann Briefe ansehen und Aufgaben übernehmen' },
  { role: 'viewer', description: 'Sieht alles, ändert nichts' },
];

const nameOf = (m: FamilyMember) => m.displayName?.trim() || 'Ohne Namen';

/** Family tab with real members, invites and member management. */
export function FamilyView({ careCase }: { careCase: CareCaseRow }) {
  const { userId, refreshAccount } = useAuth();
  const { colors } = useTheme();
  const toast = useToast();
  const { family, failed, reload } = useFamily(careCase.id);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteRole, setInviteRole] = useState<InviteRole>('member');
  const [inviting, setInviting] = useState(false);
  const [selected, setSelected] = useState<FamilyMember | null>(null);

  const me = family?.members.find((m) => m.userId === userId);
  const isOwner = me?.role === 'owner';
  const ownerCount = family?.members.filter((m) => m.role === 'owner').length ?? 0;

  const shareInvite = async () => {
    setInviting(true);
    try {
      const token = await createInvite(getSupabase(), careCase.id, inviteRole);
      setInviteOpen(false);
      reload();
      await Share.share({
        message: inviteMessage(careCase.display_name, Linking.createURL(`/einladung/${token}`)),
      });
    } catch (e) {
      toast({ message: errorMessage(e), tone: 'info' });
    } finally {
      setInviting(false);
    }
  };

  const revoke = async (inviteId: string) => {
    try {
      await revokeInvite(getSupabase(), inviteId);
      reload();
      toast({ message: 'Die Einladung gilt nicht mehr.' });
    } catch (e) {
      toast({ message: errorMessage(e), tone: 'info' });
    }
  };

  return (
    <>
      <Screen eyebrow={`Für ${careCase.display_name}`} title="Familie">
        <View className="gap-3">
          <SectionHeader title="Wer dabei ist" />
          {family ? (
            <ListGroup>
              {family.members.map((m) => {
                const mine = m.userId === userId;
                return (
                  <ListItem
                    key={m.userId}
                    title={mine ? `${nameOf(m)} (du)` : nameOf(m)}
                    subtitle={roleLabel[m.role]}
                    leading={<Avatar name={nameOf(m)} />}
                    onPress={mine || isOwner ? () => setSelected(m) : undefined}
                    accessibilityHint={
                      mine ? 'Öffnet die Möglichkeit, den Fall zu verlassen' : 'Rolle ändern oder entfernen'
                    }
                  />
                );
              })}
              <ListItem
                title={careCase.display_name}
                subtitle="Um sie oder ihn kümmert ihr euch gemeinsam"
                leading={
                  <IconTile tone="accent">
                    <Icon icon={HeartHandshake} size={20} color="onAccentSoft" />
                  </IconTile>
                }
              />
            </ListGroup>
          ) : failed ? (
            <Card padding="none">
              <EmptyState
                icon={WifiOff}
                title="Gerade keine Verbindung"
                message="Deine Familie lässt sich gerade nicht laden. Versuch es gleich noch einmal."
                action={{ label: 'Noch einmal versuchen', onPress: reload }}
              />
            </Card>
          ) : (
            <Card>
              <View
                className="flex-row items-center justify-center gap-2 py-4"
                accessibilityLiveRegion="polite"
              >
                <ActivityIndicator color={colors.primary} />
                <Text variant="callout" tone="muted">
                  Ich lade deine Familie …
                </Text>
              </View>
            </Card>
          )}
          {isOwner ? (
            <Button
              label="Jemanden einladen"
              icon={UserPlus}
              variant="outline"
              align="stretch"
              onPress={() => setInviteOpen(true)}
            />
          ) : null}
        </View>

        <Card tone="muted">
          <View className="flex-row items-center gap-3.5">
            <IconTile tone="primary">
              <Icon icon={Users} size={20} color="onPrimarySoft" />
            </IconTile>
            <Text variant="callout" tone="muted" className="flex-1">
              Sobald ihr Aufgaben übernehmt, siehst du hier, wie ihr euch die Arbeit teilt.
            </Text>
          </View>
        </Card>

        {isOwner && family && family.invites.length > 0 ? (
          <View className="gap-3">
            <SectionHeader title="Offene Einladungen" />
            <ListGroup>
              {family.invites.map((invite) => (
                <ListItem
                  key={invite.id}
                  title={roleLabel[invite.role]}
                  subtitle={inviteValidUntil(invite.expiresAt)}
                  leading={
                    <IconTile tone="info">
                      <Icon icon={Send} size={20} color="onInfoSoft" />
                    </IconTile>
                  }
                  trailing={
                    <Button
                      label="Zurückziehen"
                      variant="ghost"
                      size="sm"
                      onPress={() => revoke(invite.id)}
                    />
                  }
                />
              ))}
            </ListGroup>
          </View>
        ) : null}

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
        description="Teile den Link per WhatsApp, SMS oder E-Mail. Er gilt 7 Tage und nur einmal."
      >
        <View className="gap-4">
          {inviteRoles.map((r) => (
            <CheckRow
              key={r.role}
              label={r.role === 'viewer' ? 'Liest nur mit' : roleLabel[r.role]}
              description={r.description}
              checked={inviteRole === r.role}
              onToggle={() => setInviteRole(r.role)}
            />
          ))}
        </View>
        <Button
          label="Link teilen"
          icon={Send}
          size="lg"
          align="stretch"
          loading={inviting}
          onPress={shareInvite}
        />
      </BottomSheet>

      <MemberSheet
        member={selected}
        isSelf={selected?.userId === userId}
        isLastOwner={isOwner && ownerCount === 1}
        hasOthers={(family?.members.length ?? 0) > 1}
        careCase={careCase}
        onClose={() => setSelected(null)}
        onChanged={async (left) => {
          setSelected(null);
          if (left) await refreshAccount();
          else reload();
        }}
      />
    </>
  );
}

function MemberSheet({
  member,
  isSelf,
  isLastOwner,
  hasOthers,
  careCase,
  onClose,
  onChanged,
}: {
  member: FamilyMember | null;
  isSelf: boolean;
  isLastOwner: boolean;
  hasOthers: boolean;
  careCase: CareCaseRow;
  onClose: () => void;
  onChanged: (left: boolean) => Promise<void>;
}) {
  const toast = useToast();
  // The sheet keeps its content while closing; state resets per opened member.
  const [shown, setShown] = useState<FamilyMember | null>(member);
  const [role, setRole] = useState<Role | null>(member?.role ?? null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  if (member && member !== shown) {
    setShown(member);
    setRole(member.role);
    setConfirming(false);
    setError(undefined);
  }
  if (!shown) return null;
  const name = nameOf(shown);

  const run = async (action: () => Promise<void>, message: string, left: boolean) => {
    setBusy(true);
    setError(undefined);
    try {
      await action();
      toast({ message });
      await onChanged(left);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const supabase = getSupabase();
  const errorText = error ? (
    <Text variant="callout" tone="accent" accessibilityLiveRegion="polite">
      {error}
    </Text>
  ) : null;

  if (isSelf && isLastOwner) {
    return (
      <BottomSheet
        visible={Boolean(member)}
        onClose={onClose}
        title="Du verwaltest den Fall"
        description={
          hasOthers
            ? 'Bevor du gehst, gib die Verwaltung an jemand anderen weiter: Tipp auf die Person und wähle „Verwaltet den Fall“.'
            : `Gerade bist nur du bei „${careCase.display_name}“. Lade jemanden ein, der sich mit dir kümmert.`
        }
      >
        <Button label="Verstanden" variant="secondary" align="stretch" onPress={onClose} />
      </BottomSheet>
    );
  }

  if (isSelf) {
    return (
      <BottomSheet
        visible={Boolean(member)}
        onClose={onClose}
        title={confirming ? `„${careCase.display_name}“ wirklich verlassen?` : 'Du'}
        description={
          confirming
            ? 'Du siehst den Fall danach nicht mehr. Du kannst später wieder eingeladen werden.'
            : roleLabel[shown.role]
        }
      >
        {errorText}
        {confirming ? (
          <View className="gap-2">
            <Button
              label="Ja, Fall verlassen"
              variant="danger"
              size="lg"
              align="stretch"
              loading={busy}
              onPress={() =>
                run(
                  () => leaveCase(supabase, careCase.id),
                  `Du hast „${careCase.display_name}“ verlassen.`,
                  true,
                )
              }
            />
            <Button label="Abbrechen" variant="ghost" align="center" onPress={() => setConfirming(false)} />
          </View>
        ) : (
          <Button
            label="Fall verlassen"
            variant="danger"
            align="stretch"
            onPress={() => setConfirming(true)}
          />
        )}
      </BottomSheet>
    );
  }

  return (
    <BottomSheet
      visible={Boolean(member)}
      onClose={onClose}
      title={confirming ? `${name} wirklich entfernen?` : name}
      description={
        confirming
          ? `${name} sieht „${careCase.display_name}“ danach nicht mehr. Du kannst später wieder einladen.`
          : 'Welche Rolle passt?'
      }
    >
      {confirming ? null : (
        <View className="gap-4">
          {memberRoles.map((r) => (
            <CheckRow
              key={r.role}
              label={roleLabel[r.role]}
              description={r.description}
              checked={role === r.role}
              onToggle={() => setRole(r.role)}
            />
          ))}
        </View>
      )}
      {errorText}
      {confirming ? (
        <View className="gap-2">
          <Button
            label="Ja, entfernen"
            variant="danger"
            size="lg"
            align="stretch"
            loading={busy}
            onPress={() =>
              run(
                () => removeMember(supabase, careCase.id, shown.userId),
                `${name} ist nicht mehr dabei.`,
                false,
              )
            }
          />
          <Button label="Abbrechen" variant="ghost" align="center" onPress={() => setConfirming(false)} />
        </View>
      ) : (
        <View className="gap-2">
          <Button
            label="Speichern"
            size="lg"
            align="stretch"
            disabled={role === shown.role}
            loading={busy}
            onPress={() =>
              role &&
              run(
                () => changeMemberRole(supabase, careCase.id, shown.userId, role),
                `${name}: ${roleLabel[role]}`,
                false,
              )
            }
          />
          <Button
            label="Aus dem Fall entfernen"
            variant="danger"
            align="stretch"
            onPress={() => setConfirming(true)}
          />
        </View>
      )}
    </BottomSheet>
  );
}
