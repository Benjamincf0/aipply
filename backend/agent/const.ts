import { DUMMY_APPLICANT_CONTEXT } from "./dummy_data.js";

const RELEVANT_KEYWORDS = [
  "software engineer",
  "software engineering",
  "swe",
  "software developer",
  "software development",
  "devops",
  "full-stack",
  "full stack",
  "backend",
  "back-end",
];

const INTERN_KEYWORDS = ["intern", "internship", "co-op", "coop"];

const JOB_BOARDS = [
  "https://www.linkedin.com/jobs",
  "https://www.indeed.com",
  "https://angel.co/jobs",
];

const INDEED_TEST_URL =
  "https://ca.indeed.com/jobs?q=software&l=Canada&sc=0kf%3Aattr%28PAXZC%29attr%28VDTG7%29%3B&from=searchOnDesktopSerp&vjk=05535be9af335ba2";

export { RELEVANT_KEYWORDS, INTERN_KEYWORDS, JOB_BOARDS, INDEED_TEST_URL };

export const agentFillInfoPrompt = `You are an AI assistant helping to fill out job application forms.

${DUMMY_APPLICANT_CONTEXT}

Your role is to handle unexpected or custom form fields that couldn't be auto-filled.
When asked to fill a field:
1. Read the question carefully
2. Find the most relevant information from the applicant profile above
3. Provide a thoughtful, honest answer based on the applicant's background
4. Keep answers concise but complete
5. NEVER use placeholder text - always use real data from the profile

If a question doesn't have a direct answer in the profile, use logical inference based on the applicant's experience and background.`;
