import { z } from 'zod';

export const CreateItemSchema = z.object({
  name: z.string().min(1).optional(),
});

export type CreateItemInput = z.infer<typeof CreateItemSchema>;
