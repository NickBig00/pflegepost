import { z } from 'zod';

// Shapes mirror the planned database tables (docs/ARCHITECTURE.md), so the
// demo screens can later switch to real data without changing their props.

const isoDay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const memberSchema = z.object({
  id: z.string(),
  displayName: z.string().min(1),
  role: z.enum(['owner', 'member', 'viewer']),
});

export const careCaseSchema = z.object({
  id: z.string(),
  displayName: z.string().min(1),
  fullName: z.string().min(1),
  members: z.array(memberSchema).min(1),
});

export const senderTypeSchema = z.enum([
  'pflegekasse',
  'medizinischer_dienst',
  'pflegedienst',
  'arzt',
  'behoerde',
]);

export const documentSchema = z.object({
  id: z.string(),
  caseId: z.string(),
  title: z.string().min(1),
  sender: z.string().min(1),
  senderType: senderTypeSchema,
  receivedOn: isoDay,
  summaryPlain: z.string().min(1),
});

export const taskSchema = z.object({
  id: z.string(),
  caseId: z.string(),
  documentId: z.string().nullable(),
  title: z.string().min(1),
  dueDate: isoDay.nullable(),
  assigneeId: z.string().nullable(),
  status: z.enum(['open', 'in_progress', 'done']),
});

/** Result of reading a letter (document_analysis + deadlines + task suggestions). */
export const analysisSchema = z.object({
  referenceNumber: z.string().nullable(),
  letterDate: isoDay,
  pageCount: z.number().int().positive(),
  summaryPlain: z.string().min(1),
  deadline: z
    .object({
      dueDate: isoDay,
      /** Verbatim sentence from the letter; a deadline without a quote is shown as uncertain. */
      sourceQuote: z.string().min(1),
      page: z.number().int().positive(),
    })
    .nullable(),
  suggestedTasks: z.array(
    z.object({
      id: z.string(),
      title: z.string().min(1),
      /** Suggested due date relative to the deadline (0 = on the deadline). */
      daysBeforeDeadline: z.number().int().nonnegative(),
    }),
  ),
});

export type Analysis = z.infer<typeof analysisSchema>;
export type Member = z.infer<typeof memberSchema>;
export type CareCase = z.infer<typeof careCaseSchema>;
export type SenderType = z.infer<typeof senderTypeSchema>;
export type CareDocument = z.infer<typeof documentSchema>;
export type Task = z.infer<typeof taskSchema>;
