import "dotenv/config";
import { Stagehand } from "@browserbasehq/stagehand";
import { APPLICANT_PROFILE } from "./dummy_data.js";
import { getJobsFromJobBoard } from "./scrape_jobs.js";
import { applyToJobs } from "./apply_job.js";
import { INDEED_TEST_URL } from "./const.js";
import { fillApplicationForm } from "./fill_application.js";

let BROWSERBASE_PROJECT_ID: string;
let BROWSERBASE_API_KEY: string;
let GOOGLE_GENERATIVE_AI_API_KEY: string;
try {
  BROWSERBASE_PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID!;
  BROWSERBASE_API_KEY = process.env.BROWSERBASE_API_KEY!;
  GOOGLE_GENERATIVE_AI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY!;
} catch (e) {
  throw new Error(
    "BROWSERBASE_PROJECT_ID and BROWSERBASE_API_KEY must be set in environment variables to run this example. Please check your .env file.",
  );
}

async function main() {
  const stagehand = new Stagehand({
    env: "LOCAL",
    model: "google/gemini-2.5-flash-lite",
  });

  try {
    await stagehand.init();
    const page = stagehand.context.pages()[0];

    const GIVEN_URL = [
      "https://applynow.net.au/jobs/ni/BIL202530-software-firmware-developer-intern",
      "https://durabuiltdoorswindows.applytojob.com/apply/ZFqbK3gzHV/Engineering-COOP?source=Our%20Career%20Page%20Widget",
      "https://careers.mss.ca/fr/jobs/6631674-verification-de-logiciels-embarques-stage-co-op?ittk=HIUYBWZWMQ",
    ];

    for (const url of GIVEN_URL) {
      console.log(`\nNavigating to: ${url}`);
      await page.goto(url, { waitUntil: "networkidle" }).catch((e) => {
        console.error(`Failed to navigate to ${url}:`, e);
      });
      const fillResult = await fillApplicationForm(
        APPLICANT_PROFILE,
        stagehand,
        page,
      );
      console.log(`Form fill result: ${fillResult}`);
    }

    // console.log(`Stagehand Session Started`);
    // console.log(
    //   `Watch live: https://browserbase.com/sessions/${stagehand.browserbaseSessionId}`
    // );

    // const page = stagehand.context.pages()[0];

    // const url = INDEED_TEST_URL;

    // // 1. Collect jobs from job board
    // const jobs = await getJobsFromJobBoard("indeed", url, stagehand, page);
    // console.log(`\nCollected ${jobs.length} jobs from job board`);
    // console.log(JSON.stringify(jobs, null, 2));

    // // 2. Filter jobs that have career page URLs
    // const jobsWithCareerPages = jobs.filter((job) => job.applyUrl);
    // console.log(
    //   `\nFound ${jobsWithCareerPages.length} jobs with career page URLs`
    // );

    // if (jobsWithCareerPages.length === 0) {
    //   console.log("\nNo jobs with career page URLs found. Exiting...");
    //   return;
    // }

    // 3. Apply to jobs using the applicant profile
    // const applicationResults = await applyToJobs(
    //   jobsWithCareerPages,
    //   APPLICANT_PROFILE,
    //   stagehand,
    //   page
    // );

    // // 4. Display detailed results
    // console.log("\nDetailed Results:\n");
    // for (const result of applicationResults.results) {
    //   const statusIcon =
    //     result.status === "applied"
    //       ? "✅"
    //       : result.status === "skipped"
    //       ? "⊘"
    //       : "❌";
    //   console.log(
    //     `${statusIcon} ${result.job.title} at ${
    //       result.job.company
    //     } - ${result.status.toUpperCase()}`
    //   );
    //   if (result.reason) {
    //     console.log(`   Reason: ${result.reason}`);
    //   }
    // }

    console.log("\n✅ Job application automation completed!");
  } catch (error) {
    console.error("Detailed error:", error);
    throw error;
  } finally {
    await stagehand.close();
  }
}

main().catch((error) => {
  console.error("Unhandled error in main:", error);
});
