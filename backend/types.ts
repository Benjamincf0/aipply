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

  // Resume
  resumePath: z.string(),
});

export type WorkExperience = z.infer<typeof WorkExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type ApplicantProfile = z.infer<typeof ApplicantProfileSchema>;
