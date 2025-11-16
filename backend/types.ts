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

export const SearchJobSchema = z.object({
  query: z.string().min(1),
  location: z.string().optional(),
  type: z.enum(["full-time", "part-time", "contract"]).optional(),
});

export type SearchJobInput = z.infer<typeof SearchJobSchema>;

export const JobSearchResponseSchema = z.object({
  jobs: z.array(JobSchema),
});

export type JobSearchResponse = z.infer<typeof JobSearchResponseSchema>;

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
  currentYear: z.number().optional(),
  graduationDate: z.string(),
  gpa: z.string().optional(),
});

export const ProjectSchema = z.object({
  name: z.string(),
  description: z.string(),
  technologies: z.array(z.string()),
  link: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
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
  openForHybrid: z.boolean().optional(),
  openForRemote: z.boolean().optional(),
  openForOnsite: z.boolean().optional(),

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

  heardAboutUs: z.string().optional(),
  // Resume
  resumePath: z.string(),
});

export type ApplicationStatusSchema = z.infer<typeof ApplicationStatusSchema>;
export type WorkExperience = z.infer<typeof WorkExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type ApplicantProfile = z.infer<typeof ApplicantProfileSchema>;
