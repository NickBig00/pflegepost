import { daysUntil, deadlineLabel, deadlineUrgency, formatShortDate } from '../dates';

const today = new Date(2026, 9, 19, 15, 30); // Mon, 19 Oct 2026, afternoon

describe('daysUntil', () => {
  test('counts calendar days, ignoring the time of day', () => {
    expect(daysUntil('2026-10-19', today)).toBe(0);
    expect(daysUntil('2026-10-20', today)).toBe(1);
    expect(daysUntil('2026-10-17', today)).toBe(-2);
  });

  test('is stable across the DST switch (25 Oct 2026)', () => {
    expect(daysUntil('2026-10-26', today)).toBe(7);
  });
});

describe('deadlineUrgency', () => {
  test.each([
    [-1, 'overdue'],
    [0, 'today'],
    [1, 'soon'],
    [2, 'soon'],
    [3, 'week'],
    [7, 'week'],
    [8, 'later'],
  ] as const)('%i days → %s', (days, urgency) => {
    expect(deadlineUrgency(days)).toBe(urgency);
  });
});

describe('deadlineLabel', () => {
  test.each([
    ['2026-10-16', 'Seit 3 Tagen offen'],
    ['2026-10-18', 'Seit gestern offen'],
    ['2026-10-19', 'Heute'],
    ['2026-10-20', 'Morgen'],
    ['2026-10-21', 'Übermorgen'],
    ['2026-10-24', 'In 5 Tagen'],
  ])('%s → %s', (due, label) => {
    expect(deadlineLabel(due, today)).toBe(label);
  });

  test('uses a short German date beyond one week', () => {
    expect(deadlineLabel('2026-11-12', today)).toBe(`Bis ${formatShortDate('2026-11-12')}`);
    expect(formatShortDate('2026-11-12')).toMatch(/^12\. Nov/);
  });
});
