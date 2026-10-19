import { createDemoData } from '@/demo/data';

import { familyLoad, loadSuggestion } from '../family';
import { weeklyReview } from '../review';
import { filterTasks, groupByDue } from '../tasks';

const today = new Date(2026, 9, 19);
const { careCase, tasks } = createDemoData(today);

test('family load shares add up to 1', () => {
  const loads = familyLoad(careCase.members, tasks, today);
  expect(loads.reduce((s, l) => s + l.share, 0)).toBeCloseTo(1);
  expect(loads.find((l) => l.member.id === 'anna')!.share).toBeGreaterThan(0.5);
});

test('suggestion asks the sibling for help without blaming', () => {
  const s = loadSuggestion(familyLoad(careCase.members, tasks, today), 'anna');
  expect(s.askMemberId).toBe('thomas');
  expect(s.text).toContain('Thomas');
  expect(s.text).not.toMatch(/nie|immer|schuld|vergessen/i);
});

test('balanced load gets a kind note', () => {
  const balanced = familyLoad(careCase.members, [], today);
  expect(loadSuggestion(balanced, 'anna').askMemberId).toBeNull();
});

test('filters and groups tasks', () => {
  expect(filterTasks(tasks, 'done', 'anna').every((t) => t.status === 'done')).toBe(true);
  expect(filterTasks(tasks, 'open', 'anna').every((t) => t.assigneeId === null)).toBe(true);
  expect(
    filterTasks(tasks, 'mine', 'anna').every((t) => t.assigneeId === 'anna' && t.status !== 'done'),
  ).toBe(true);
  const groups = groupByDue(filterTasks(tasks, 'all', 'anna'), today).map((g) => g.key);
  expect(groups).toEqual(['week', 'later']);
});

test('weekly review reads like a letter', () => {
  const r = weeklyReview(tasks, careCase.members, 'anna', 'Mama', today);
  expect(r.greeting).toBe('Liebe Anna,');
  expect(r.intro).toContain('4 Dinge');
  expect(r.done.some((d) => d.by === 'Thomas')).toBe(true);
  expect(r.next).toHaveLength(2);
});
