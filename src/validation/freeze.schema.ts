import { z } from 'zod';

export const CreateFreezeSchema = z.object({
  type: z.enum(['base','intervention','final']),
  svg: z.string().min(1),
  metadata: z.string().min(0),
  idempotencyKey: z.string().min(10),
  expectedVersion: z.number().int().min(0),
  parentHash: z.string().optional(),
  hash: z.string().min(1)
});

export type CreateFreezeInput = z.infer<typeof CreateFreezeSchema>;
