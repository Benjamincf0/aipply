import z from "zod";

export const JobSearchReq = z.object({
  search: z.string(),
  location: z.string().optional(),
  type: z
    .enum([
      "internship",
      "full-time",
      "part-time",
      "contract",
      "feelance",
      "volunteer",
    ])
    .optional(),
  start: z.string().optional(),
});

const jobHighlightSchema = z.object({
  title: z.string(),
  items: z.array(z.string()),
});

// Schema for apply options (job board links)
const applyOptionSchema = z.object({
  title: z.string(),
  link: z.string().url(),
});

// Main job schema
export const JobResultSchema = z.object({
  title: z.string(),
  company_name: z.string(),
  location: z.string(),
  via: z.string(),
  share_link: z.string().url(),
  thumbnail: z.string().url().optional(),
  extensions: z.array(z.string()),
  detected_extensions: z.record(z.union([z.boolean(), z.string()])),
  description: z.string(),
  job_highlights: z.array(jobHighlightSchema).optional(),
  apply_options: z.array(applyOptionSchema),
  job_id: z.string(),
});

export const ApplicationStatusSchema = z.object({
  job: JobResultSchema,
  sessionId: z.string(),
  startDate: z.string(),
  completedDate: z.string().optional(),
  status: z.enum(["pending", "running", "failed", "completed"]),
  profileId: z.number(),
});

export const WebSocketMessageSchema = z.object({
  type: z.literal("application/add"),
  data: z.object({
    profileId: z.number(),
    jobs: z.array(JobResultSchema),
  }),
});

export type JobSearchReq = z.infer<typeof JobSearchReq>;
export type JobResultSchema = z.infer<typeof JobResultSchema>;
export type ApplicationStatusSchema = z.infer<typeof ApplicationStatusSchema>;
export type WebSocketMessageSchema = z.infer<typeof WebSocketMessageSchema>;
