import { z } from "zod";

export const linkFreezeParamSchema = z.object({
  freezeId: z.string().min(1),
});

export const createLinkBodySchema = z.object({
  url: z.string().url(),
  note: z.string().min(1).optional(),
});

export type CreateLinkBody = z.infer<typeof createLinkBodySchema>;
