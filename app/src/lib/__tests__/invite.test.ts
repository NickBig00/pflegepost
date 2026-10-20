import { extractInviteToken, inviteMessage, inviteValidUntil, roleLabel } from '../invite';

const token = 'Ab3_-Ab3_-Ab3_-Ab3_-Ab3_-Ab3_-Ab';

test('finds the token in links and in the whole shared message', () => {
  expect(extractInviteToken(`pflegepost://einladung/${token}`)).toBe(token);
  expect(extractInviteToken(`exp://192.168.0.2:8081/--/einladung/${token}`)).toBe(token);
  expect(extractInviteToken(inviteMessage('Mama', `pflegepost://einladung/${token}`))).toBe(token);
  expect(extractInviteToken(`  ${token}\n`)).toBe(token);
});

test('rejects text without a valid token', () => {
  expect(extractInviteToken('pflegepost://einladung/kurz')).toBeNull();
  expect(extractInviteToken(`pflegepost://einladung/${token}x`)).toBeNull();
  expect(extractInviteToken('Hallo, kommst du am Sonntag?')).toBeNull();
});

test('the invite message names the case, the link and the fallback', () => {
  const text = inviteMessage('Mama', `pflegepost://einladung/${token}`);
  expect(text).toContain('„Mama“');
  expect(text).toContain(token);
  expect(text).toContain('Ich wurde eingeladen');
});

test('validity and role labels read naturally', () => {
  expect(inviteValidUntil('2026-10-27T10:00:00Z')).toBe('Gültig bis 27.\u00a0Okt.');
  expect(roleLabel.viewer).toBe('Liest mit');
});
