import "dotenv/config";
import { Page, Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import { JobSchema } from "./types.js";

let BROWSERBASE_PROJECT_ID: string;
let BROWSERBASE_API_KEY: string;
let GOOGLE_GENERATIVE_AI_API_KEY: string;
try {
  BROWSERBASE_PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID!;
  BROWSERBASE_API_KEY = process.env.BROWSERBASE_API_KEY!;
  GOOGLE_GENERATIVE_AI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY!;
} catch (e) {
  throw new Error(
    "BROWSERBASE_PROJECT_ID and BROWSERBASE_API_KEY must be set in environment variables to run this example. Please check your .env file."
  );
}

const stagehand = new Stagehand({
  env: "LOCAL",
  apiKey: GOOGLE_GENERATIVE_AI_API_KEY,
  model: "google/gemini-2.0-flash-exp",
});

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

async function getOneJob(
  jobBoardURL: string,
  stagehand: Stagehand,
  page: Page
) {
  let job: JobSchema | null = null;
  try {
    await page.goto(jobBoardURL, { waitUntil: "networkidle" });
    job = await stagehand.extract(
      `Extract the job title, company name, location, and description from the first job on the page.`,
      JobSchema
    );

    const action = await stagehand.observe(
      `Find the apply button or link for the job titled "${job.title}" at ${job.company}. Look for buttons or links with text like "Apply", "Apply Now", "Easy Apply", "Quick Apply", or similar.`
    );

    if (action.length > 0) {
      await stagehand.act(action[0]);
    } else {
      await stagehand.act(
        `Find the apply button or link for the job titled "${job.title}" at ${job.company}. Look for buttons or links with text like "Apply", "Apply Now", "Easy Apply", "Quick Apply", or similar.`
      );
    }
    console.log(
      "\n\n-=-=- Found apply button, navigating to apply page -=-=-=- \n\n"
    );

    try {
      await page.waitForLoadState("networkidle", 3000);
    } catch (e) {
      // If it times out, it's likely a modal, so just wait a bit for it to appear
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const applyURL = page.url();

    console.log("\n\n\n\n\nApply URL: ", applyURL);

    job.applyUrl = applyURL;

    await page.goBack({ waitUntil: "networkidle" });

    return job;
  } catch (error) {
    console.error("Error extracting job:", error);
    throw error;
  }
}

async function getJobPostings(jobBoardURL: string, page: Page) {
  const jobs: JobSchema[] = [];
  try {
    await page.goto(jobBoardURL, { waitUntil: "networkidle" });

    const jobs = await stagehand.extract(
      `Extract all job listings on this page. For each job, get:
        - Job title
        - Company name
        - Location (if available)
        - A brief description or job type
        Focus on finding intern or internship positions related to software engineering, development, devops, full-stack, or backend roles.`,
      z.object({
        jobs: z.array(JobSchema),
      })
    );

    const relevantJobs = jobs.jobs.filter((job) => {
      const titleLower = job.title.toLowerCase();
      const descLower = (job.description || "").toLowerCase();
      const combinedText = titleLower + " " + descLower;

      // Check if it's an intern position
      const isIntern = INTERN_KEYWORDS.some((keyword) =>
        combinedText.includes(keyword)
      );

      // Check if it's a relevant tech role
      const isRelevantRole = RELEVANT_KEYWORDS.some((keyword) =>
        combinedText.includes(keyword)
      );

      return isIntern && isRelevantRole;
    });

    const jobsWithLinks = [];

    for (const job of relevantJobs) {
      if (job.applyUrl) {
        try {
          const [applyButton] = await stagehand.observe(
            `Find the apply button or link for the job titled "${job.title}" at ${job.company}. Look for buttons or links with text like "Apply", "Apply Now", "Easy Apply", "Quick Apply", or similar.`
          );

          if (applyButton) {
            let applyUrl = null;

            if (applyButton.selector) {
              // await stagehand.act(applyButton.selector);
              applyUrl = await stagehand.extract(
                `Extract the URL from the apply button or link for the job titled "${job.title}" at ${job.company}.`
              );
            }

            jobsWithLinks.push({
              ...job,
              applyUrl: applyUrl || "Found but URL extraction failed",
              applyButtonSelector: applyButton.selector,
            });

            console.log(
              `✓ Found apply link for: ${job.title} at ${job.company}`
            );
          }
        } catch (error) {}
      }
    }
    await stagehand.close();
    return jobsWithLinks;
  } catch (error) {
    console.error("Error initializing Stagehand:", error);
    throw error;
  } finally {
    await stagehand.close();
  }
}

async function findApplicationButton(
  page: Page,
  job: JobListing
): Promise<string | null> {
  console.log(`Finding application button for: ${job.title} at ${job.company}`);

  if (!job.applicationUrl) return null;

  try {
    await page.goto(job.applicationUrl, { waitUntil: "networkidle" });

    // Use Stagehand to intelligently find application button
    const result = await stagehand.extract({
      instruction: `Find the main "Apply" or "Application" button/link for this job.
        Return the absolute URL if it's a link, or indicate if it's a form button.
        Ignore "Save Job" or "Share" buttons.`,
      schema: {
        type: "object",
        properties: {
          actionUrl: { type: "string" },
          buttonText: { type: "string" },
          actionType: { type: "string", enum: ["url", "form", "none"] },
        },
      },
    });

    if (result.actionType === "url" && result.actionUrl) {
      return result.actionUrl;
    } else if (result.actionType === "form") {
      console.log(`Form-based application found for ${job.title}`);
      return job.applicationUrl; // Return the page URL to handle form filling separately
    }
  } catch (error) {
    console.error(`Error finding application button for ${job.title}:`, error);
  }

  return null;
}

async function main() {
  const stagehand = new Stagehand({
    env: "LOCAL",
    apiKey: GOOGLE_GENERATIVE_AI_API_KEY,
    model: "google/gemini-2.0-flash-exp",
  });

  try {
    await stagehand.init();

    console.log(`Stagehand Session Started`);
    console.log(
      `Watch live: https://browserbase.com/sessions/${stagehand.browserbaseSessionId}`
    );

    const page = stagehand.context.pages()[0];

    const url = "https://wellfound.com/role/software-engineer";

    const job = await getOneJob(url, stagehand, page);
    console.log(JSON.stringify(job, null, 2));
  } catch (error) {
    console.error("Detailed error:", error);
    throw error;
  } finally {
    await stagehand.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
