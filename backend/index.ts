import "dotenv/config";
import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";

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

const RELEVANT_KEYWORDS = [
  "software engineer",
  "software development",
  "devops",
  "full-stack",
  "full stack",
  "backend",
  "back-end",
  "software developer",
];

const INTERN_KEYWORDS = ["intern", "internship", "co-op", "coop"];

const JobSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string().optional(),
  applyUrl: z.string().optional(),
  description: z.string().optional(),
});

async function getJobPostings(jobBoardURL: string, stagehand: Stagehand) {
  try {
    stagehand.init();
    const page = stagehand.context.pages()[0];
    await page.goto(jobBoardURL);

    await page.waitForLoadState("networkidle");

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
    await page.goto("https://www.goccc.ca/events/");

    console.log("Page loaded successfully");

    const actions = await stagehand.observe(
      "find the details button of the first event on the page"
    );
    console.log(`Observed actions:\n`, JSON.stringify(actions, null, 2));

    if (actions.length > 0) {
      await stagehand.act(actions[0]);
    } else {
      await stagehand.act("details button of the first event on the page");
    }

    const eventDetails = await stagehand.extract(
      "Extract the event name, date, time, location, and description from the page."
    );
    console.log(`Event details:\n`, JSON.stringify(eventDetails, null, 2));
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
