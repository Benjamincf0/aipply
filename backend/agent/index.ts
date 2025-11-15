import "dotenv/config";
import { Page, Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import { JobSchema } from "../types.js";
import { convertToURLGoogleSearch } from "../utils/utils.js";

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

async function findCareerPage(
  company: string,
  stagehand: Stagehand,
  page: Page
) {
  // Navigate to Google search for the company's careers page
  const query = `${company} careers page`;
  const url = convertToURLGoogleSearch(query);
  await page.goto(url, { waitUntil: "networkidle" });

  // Find and click the first search result that is the company's careers page
  const actions = await stagehand.observe(
    `Click on the first search result that is the careers page for ${company}. Look for links that contain the company name and words like "careers", "jobs", or "join us".`
  );

  if (actions.length > 0) {
    // Click on the first matching search result
    await stagehand.act(actions[0]);

    // Wait for the page to fully load
    await page.waitForLoadState("networkidle");

    // Return the URL of the careers page we just navigated to
    const careerPageURL = page.url();
    console.log(`✓ Found careers page for ${company}: ${careerPageURL}`);
    return careerPageURL;
  }

  console.warn(`⚠️ Could not find careers page link for ${company}`);
  return undefined;
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
      "Extract the job title, company name, and location from the job listing cards/containers on this page",
      z.object({
        jobs: z.array(JobSchema),
      })
    );
    console.log("\n\n\n\n\n\n\nJob data:");
    console.log(JSON.stringify(jobData.jobs, null, 2));
    jobs = jobData.jobs;

    for (const job of jobs) {
      // 4. Find the apply button or link for the job
      const action = await stagehand.observe(
        `Find the apply button or link for the job titled "${job.title}" at ${job.company}. Look for buttons or links with text like "Apply", "Apply Now", "Easy Apply", "Quick Apply", or similar.`
      );

      if (action.length > 0) {
        // 5. If button found, click the apply button or link
        await stagehand.act(action[0]);
      } else {
        // 6. If button not found, find the apply button or link again
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

      // 7. Get the apply URL -> This should be in a new tab
      let applyURL = page.url();
      const isIndeed = applyURL.includes("indeed.com");
      const isIndeedLogin =
        isIndeed &&
        (applyURL.includes("/login") ||
          applyURL.includes("/auth") ||
          applyURL.includes("/interstitial"));

      const isLoginPage =
        applyURL.includes("/login") ||
        applyURL.includes("/signin") ||
        applyURL.includes("/auth") ||
        applyURL.includes("/apply");

      if (isIndeed) {
        console.log("On Indeed apply flow");
        const careerPageURL = await findCareerPage(
          job.company,
          stagehand,
          page
        );
        if (careerPageURL) {
          job.applyUrl = careerPageURL;
        }
      } else if (isLoginPage) {
        console.log("On a generic login page why???");
      } else {
        console.log(
          "On company's website - likely the actual application page"
        );
        job.applyUrl = applyURL;
      }

      await page.goto(jobBoardURL, { waitUntil: "networkidle" });
    }

    return jobs;
  } catch (error) {
    console.error("Error getting one job:", error);
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

async function main() {
  const stagehand = new Stagehand({
    env: "LOCAL",
    model: "google/gemini-2.0-flash-lite",
  });

  try {
    await stagehand.init();

    console.log(`Stagehand Session Started`);
    console.log(
      `Watch live: https://browserbase.com/sessions/${stagehand.browserbaseSessionId}`
    );

    const page = stagehand.context.pages()[0];

    const url =
      "https://ca.indeed.com/jobs?q=software&l=Canada&sc=0kf%3Aattr%28VDTG7%29%3B&from=searchOnDesktopSerp&cf-turnstile-response=0.jJkCaq4LJ5ztCbxHrL_bf29njqxnn1cM1Iy9rt1r0YqA0U0j3Wlb0ay9tUSQwLZyaTsug040eQQdJhqe-7dFQAmOjmHBenGm3THS-KiUjlnZeDyk64ib96n3j0Bha2Bd-SSStwAnAhyhb2S5kIRsou5tP3xZw1xfq7IGv2pt0Rj2Qin9qAXQGrKEyIULhlscHdLGhyNGNb8ZHWBDfT7Zz4glnWeohsOS-BsDvMqo-u9cjb3q18M7ncZgMnrjUSGz4Aak6TzQSy1f5rl3unSYE6kbO8a8u9NxTvcPfPHRA2LChsxfL5oEKM9x0H2bdpb5N8irVL0gdg8_BaXxEl5C7kFMGOdupSxylFTcvMdnLiO6n4tQmVf-bFtyftvAszXw_bxqdzwdyKRcEAw6WHcWBz_eGDjEKLGQVb7rJxjzGn-x029Nzl2lkn8AJtICEZLnFn0jhOG8b-4s1oAVuv2K4xI9Zj3hXB8a_jIpmW66KZS90kMN73NQY9oHeMFcSVyN4Mod0M47Dj2zpffpbNvM4z07MCOCj36-WJyGn36oO5ImMKjoah7wPfJroAN9TZ2gAeYcPumoFStitJhE58yql7p-tzLGTCgDz7Dzct9akDhGTXtkULGZsZIP_e0OZFMU3ZOmpMFrnG1Re5paz7j2yz-SlrV8Aqmcl_m-WnCYt-Q0_f0799_ZCelbecKSZVRg6AUknClFKHRR3tMDYLXYo4zZdkxRemJ9vS1tyqN3xU-As9k-KJHqLWiEYJn-eAE-qpC_8dLGyA_YGcXPkiTB98MLzLtv0WbptpS7KM8RoG-J7pGOwFmpyqlD6ZFCOtk5i0wKZLjFvTPtDsCt1QnRuCuIEuSrWmDfzFAoY71icR_sfPwI2dunz4-lldDHTE1LUjKY47gSW8bZBOAYniwW6_txkFABYrqSlRatbPCSarhJtH94h2gf-VJiSdn-sm-q.ZehbZpPgE7bqFbo2nRfR-A.b3956a71a9ba12ecf83c7b3fa57c8335fd127669da55eb5703bfd6fa52163bfb&vjk=76a942e318581cd4&advn=1606445599330783";

    const jobs = await getJobsFromJobBoard("indeed", url, stagehand, page);
    console.log(JSON.stringify(jobs, null, 2));
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
