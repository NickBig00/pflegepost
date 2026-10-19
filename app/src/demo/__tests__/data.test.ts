import { z } from 'zod';

import { createDemoData, CURRENT_USER_ID } from '../data';
import { careCaseSchema, documentSchema, taskSchema } from '../schemas';

const today = new Date(2026, 9, 19);
const { careCase, documents, tasks } = createDemoData(today);

test('demo data matches the schemas', () => {
  expect(() => careCaseSchema.parse(careCase)).not.toThrow();
  expect(() => z.array(documentSchema).parse(documents)).not.toThrow();
  expect(() => z.array(taskSchema).parse(tasks)).not.toThrow();
});

test('references point to existing members and documents', () => {
  const memberIds = new Set(careCase.members.map((m) => m.id));
  const documentIds = new Set(documents.map((d) => d.id));
  expect(memberIds.has(CURRENT_USER_ID)).toBe(true);
  for (const t of tasks) {
    if (t.assigneeId) expect(memberIds.has(t.assigneeId)).toBe(true);
    if (t.documentId) expect(documentIds.has(t.documentId)).toBe(true);
  }
});

test('dates are relative to today', () => {
  expect(tasks.find((t) => t.id === 'task-unterlagen')?.dueDate).toBe('2026-10-21');
});
