import { analysisSchema, documentSchema } from '../schemas';
import { createIncomingLetter } from '../incoming';

const { letter, document, analysis } = createIncomingLetter(new Date(2026, 9, 19));

test('incoming letter matches the schemas', () => {
  expect(() => analysisSchema.parse(analysis)).not.toThrow();
  expect(() => documentSchema.parse(document)).not.toThrow();
});

test('the deadline quote appears verbatim in the letter', () => {
  const quote = analysis.deadline!.sourceQuote;
  expect(letter.paragraphs.join('\n')).toContain(quote);
  expect(quote).toContain('14.11.2026');
  expect(analysis.deadline!.dueDate).toBe('2026-11-14');
});
