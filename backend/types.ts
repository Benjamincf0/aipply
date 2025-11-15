import { z } from "zod";

export const JobSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  source: z.string(),
  location: z.string().optional(),
  applyUrl: z.string().optional(),
  description: z.string().optional(),
});

export const ApplicationStatusSchema = z.object({
  job: JobSchema,
  sessionId: z.string(),
  coverLetter: z.string(),
  resume: z.string(),
  startDate: z.string(),
  completedDate: z.string().optional(),
  status: z.enum(["pending", "running", "failed", "completed"]),
});

export type JobSchema = z.infer<typeof JobSchema>;
export type ApplicationStatusSchema = z.infer<typeof ApplicationStatusSchema>;
