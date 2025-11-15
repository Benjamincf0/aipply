import { Page, Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import { JobSchema, JobSearchResponseSchema } from "../types.js";
import { convertToURLGoogleSearch } from "../utils/utils.js";

async function findCareerPage(
  company: string,
  stagehand: Stagehand,
  page: Page
) {
  try {
    // Navigate to Google search for the company's careers page
    const query = `${company} careers page`;
    const url = convertToURLGoogleSearch(query);

    try {
      await page.goto(url, { waitUntil: "networkidle" });
    } catch (gotoError) {
      console.warn(`Timeout waiting for Google search, continuing anyway...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // Find and click the first search result that is the company's careers page
    const actions = await stagehand.observe(
      `Find the search result that is the careers page for ${company}. Look for links that contain the company name and words like "careers", "jobs", or "join us". Click on the first matching search result.`
    );

    if (actions.length > 0) {
      // Click on the first matching search result
      await stagehand.act(actions[0]);

      // Wait for the page to fully load with timeout handling
      try {
        await page.waitForLoadState("networkidle", 10000);
      } catch (waitError) {
        console.warn(
          `Timeout waiting for page to reach networkidle, continuing anyway...`
        );
        // Give it a bit more time for any pending resources
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      // Return the URL of the careers page we just navigated to
      const careerPageURL = page.url();
      console.log(`Found careers page for ${company}: ${careerPageURL}`);
      return careerPageURL;
    }

    console.warn(`Could not find careers page link for ${company}`);
    return undefined;
  } catch (error) {
    console.error(
      `Error in findCareerPage for ${company}: ${(error as Error).message}`
    );
    return undefined;
  }
}

async function getJobsFromJobBoard(
  jobBoard: string,
  jobBoardURL: string,
  stagehand: Stagehand,
  page: Page
) {
  let jobs: JobSchema[] = [];
  try {
    // 1. Navigate to the job board page
    await page.goto(jobBoardURL, { waitUntil: "networkidle" });

    // 2. Find the first 3 job listing cards/containers on this page
    const [jobCards] = await stagehand.observe(
      "Find the first 3 job listing cards/containers on this page"
    );

    // 3. Extract the data from those cards
    const jobData = await stagehand.extract(
      "Extract the job title, company name, and location from the first 5 job listing cards/containers on this page",
      JobSearchResponseSchema
    );
    console.log("\n\n\n\n\n\n\nJob data:");
    console.log(JSON.stringify(jobData.jobs, null, 2));
    jobs = jobData.jobs;

    for (const job of jobs) {
      console.log(
        `\n🔍 Searching for career page for: ${job.title} at ${job.company}`
      );

      // Instead of clicking Indeed's apply button, directly search for the company's career page
      const careerPageURL = await findCareerPage(job.company, stagehand, page);

      if (careerPageURL) {
        job.applyUrl = careerPageURL;
      }

      // Return to job board to process next job
      try {
        await page.goto(jobBoardURL, { waitUntil: "networkidle" });
      } catch (gotoError) {
        console.warn(`Timeout returning to job board, continuing anyway...`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    return jobs;
  } catch (error) {
    console.error("Error getting one job:", error);
    throw error;
  }
}

export { getJobsFromJobBoard };
