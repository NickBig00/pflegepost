import type { Task } from '@/demo/schemas';

import { isoInDays, receivedLabel } from '../dates';
import { firstName, greeting } from '../greeting';
import { upcomingTasks } from '../tasks';

test.each([
  [6, 'Guten Morgen'],
  [10, 'Guten Morgen'],
  [11, 'Hallo'],
  [17, 'Hallo'],
  [18, 'Guten Abend'],
  [2, 'Guten Abend'],
])('greeting at %i:00 → %s', (hour, text) => {
  expect(greeting(new Date(2026, 9, 19, hour))).toBe(text);
});

test('firstName', () => {
  expect(firstName('Anna Weber')).toBe('Anna');
});

test('isoInDays crosses month boundaries', () => {
  expect(isoInDays(13, new Date(2026, 9, 19))).toBe('2026-11-01');
  expect(isoInDays(-19, new Date(2026, 9, 19))).toBe('2026-09-30');
});

test('receivedLabel', () => {
  const today = new Date(2026, 9, 19);
  expect(receivedLabel('2026-10-19', today)).toBe('Heute');
  expect(receivedLabel('2026-10-18', today)).toBe('Gestern');
  expect(receivedLabel('2026-10-14', today)).toMatch(/^14\. Okt/);
});

const task = (id: string, dueDate: string | null, status: Task['status'] = 'open'): Task => ({
  id,
  caseId: 'c',
  documentId: null,
  title: id,
  dueDate,
  assigneeId: null,
  status,
});

test('upcomingTasks sorts by deadline, skips done tasks and puts undated last', () => {
  const tasks = [
    task('c', null),
    task('a', '2026-10-25'),
    task('done', '2026-10-20', 'done'),
    task('b', '2026-10-21'),
  ];
  expect(upcomingTasks(tasks).map((t) => t.id)).toEqual(['b', 'a', 'c']);
  expect(upcomingTasks(tasks, 2).map((t) => t.id)).toEqual(['b', 'a']);
});
