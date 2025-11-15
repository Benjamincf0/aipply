import { z } from "zod";

export const JobSchema = z.object({
  title: z.string(),
  company: z.string(),
  source: z.string(),
  location: z.string().optional(),
  applyUrl: z.string().optional(),
  description: z.string().optional(),
});

export type Job = z.infer<typeof JobSchema>;
