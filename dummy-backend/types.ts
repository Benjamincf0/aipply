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
  startDate: z.string().optional(),
  completedDate: z.string().optional(),
  status: z.enum(["pending", "running", "failed", "completed"]),
  profileId: z.number(),
});

export const ProjectSchema = z.object({
  name: z.string(),
  description: z.string(),
  technologies: z.array(z.string()),
  link: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const WorkExperienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  duration: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  responsibilities: z.array(z.string()),
});

export const EducationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  field: z.string(),
  startDate: z.string(),
  graduationDate: z.string(),
  gpa: z.string().optional(),
});
export const ApplicantProfileSchema = z.object({
  // Basic Information
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  location: z.string(),
  city: z.string(),
  state: z.string().optional(),
  country: z.string(),
  postalCode: z.string().optional(),
  streetAddress: z.string().optional(),

  // Links
  linkedin: z.string().optional(),
  github: z.string().optional(),
  portfolio: z.string().optional(),
  website: z.string().optional(),

  // Work Experience
  workExperience: z.array(WorkExperienceSchema),

  // Education
  education: z.array(EducationSchema),

  // Skills
  technicalSkills: z.array(z.string()),
  softSkills: z.array(z.string()),

  // Projects
  projects: z.array(ProjectSchema),

  // Additional Information
  coverLetter: z.string().optional(),
  availability: z.string().optional(),
  workAuthorization: z.string().optional(),
  requiresSponsorship: z.boolean().optional(),
  willingToRelocate: z.boolean().optional(),
  expectedSalary: z.string().optional(),
  noticePeriod: z.string().optional(),

  legallyAllowedToWork: z.boolean().optional(),
  legallyAllowedToWorkInCanada: z.boolean().optional(),
  legallyAllowedToWorkInUnitedStates: z.boolean().optional(),
  legallyAllowedToWorkInUnitedKingdom: z.boolean().optional(),
  legallyAllowedToWorkInAustralia: z.boolean().optional(),
  legallyAllowedToWorkInNewZealand: z.boolean().optional(),
  legallyAllowedToWorkInSouthAfrica: z.boolean().optional(),
  legallyAllowedToWorkInIndia: z.boolean().optional(),
  legallyAllowedToWorkInChina: z.boolean().optional(),

  eligibleToWork: z.boolean().optional(),
  eligibleForInternship: z.boolean().optional(),
  eligibleForCoop: z.boolean().optional(),
  eligibleForFullTime: z.boolean().optional(),
  eligibleForPartTime: z.boolean().optional(),
  eligibleForContract: z.boolean().optional(),
  eligibleForFreelance: z.boolean().optional(),
  eligibleForRemote: z.boolean().optional(),
  eligibleForOnsite: z.boolean().optional(),
  eligibleForHybrid: z.boolean().optional(),

  interestedTermLength: z.array(z.string()).optional(),
  // Resume
  resumePath: z.string(),
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
export type ApplicantProfileSchema = z.infer<typeof ApplicantProfileSchema>;
