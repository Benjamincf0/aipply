import { z } from "zod";

export const JobSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  company: z.string(),
  source: z.string(),
  location: z.string().optional(),
  applyUrl: z.string().optional(),
  description: z.string().optional(),
});

export type JobSchema = z.infer<typeof JobSchema>;

export const SearchJobSchema = z.object({
  query: z.string().min(1),
  location: z.string().optional(),
  type: z.enum(["full-time", "part-time", "contract"]).optional(),
});

export type SearchJobInput = z.infer<typeof SearchJobSchema>;

export const JobSearchResponseSchema = z.object({
  results: z.array(JobSchema),
});

export type JobSearchResponse = z.infer<typeof JobSearchResponseSchema>;
